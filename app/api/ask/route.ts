export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/** ------------ Tipler ------------ */
type Faq = {
  id: string;
  age_min: number;
  age_max: number;
  category: string | null;
  question: string;
  answer: string;
  source?: string | null;
  created_at?: string;
};

/** ------------ Sabitler ------------ */
const DISCLAIMER =
  'Bu içerik tıbbi tavsiye değildir. Acil belirtilerde 112’yi arayın veya en yakın sağlık kuruluşuna başvurun.';

/** ------------ Yardımcılar ------------ */
function detectUrgent(ageMonths: number, text: string) {
  const s = (text || '').toLowerCase();
  const redWords = ['nefes','solunum','zor','zorluk','morarma','mavi','havale','nöbet','bilinç','bayıl','tepkisiz'];
  const hasRed = redWords.some(w => s.includes(w));
  const hasFever = /(?:38(\.|,)?\d?)/.test(s) || s.includes('38 derece');
  const smallInfant = ageMonths >= 0 && ageMonths < 3 && hasFever;
  return hasRed || smallInfant;
}

function extractKeywords(q: string) {
  const base = (q || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const extras: string[] = [];
  if (base.includes('ateş') || base.includes('ates')) extras.push('ateş');
  if (base.includes('uyku') || base.includes('uyum')) extras.push('uyku');
  if (base.includes('ek') && base.includes('gıda')) extras.push('ek gıda');
  if (base.includes('kabız') || base.includes('kabiz')) extras.push('kabızlık');

  return Array.from(new Set([...base, ...extras])).slice(0, 10);
}

function supabaseServer() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** ------------ GEMINI (v1 + 2.5-flash) ------------ */
async function callGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY!;
  if (!key) throw new Error('GEMINI_API_KEY yok');

  const model = 'gemini-2.5-flash';
  const url = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${key}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: prompt }]}],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 180,   // daha kısa yanıt
        topP: 0.9,
        topK: 40,
      }
      // safetySettings vermiyoruz; varsayılan kalsın
    }),
  });

  const j = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = j?.error?.message || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const cand = j?.candidates?.[0] || {};
  const parts = cand?.content?.parts || [];
  const text = Array.isArray(parts)
    ? parts.map((p: any) => p?.text).filter(Boolean).join('\n').trim()
    : '';

  if (text) return { text };

  // içerik yoksa: yine de eldeki sebebi ilet
  const finish = cand?.finishReason || j?.promptFeedback?.blockReason || 'empty_response';
  throw new Error(String(finish));
}

async function askGemini(system: string, user: string) {
  const prompt = `${system}\n\n---\n\n${user}`;
  try {
    const { text } = await callGemini(prompt);
    return { text, llmUsed: true, llmError: null, provider: 'gemini' as const };
  } catch (e: any) {
    return { text: null, llmUsed: false, llmError: String(e?.message || e), provider: 'gemini' as const };
  }
}

/** ------------ GET (sağlık) ------------ */
export async function GET() {
  return NextResponse.json({ ok: true });
}

/** ------------ POST (soru-cevap) ------------ */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // Tally webhook desteği
    let ageMonths = Number(body?.ageMonths ?? 0);
    let question = (body?.question ?? '').toString();
    if ((!ageMonths || !question) && body?.data?.fields?.length) {
      const fields: any[] = body.data.fields;
      const ageField = fields.find(f => /age|yaş|yas/i.test(f?.key || f?.label));
      const qField   = fields.find(f => /question|soru/i.test(f?.key || f?.label));
      if (ageField) ageMonths = Number(ageField.value || 0);
      if (qField)   question  = (qField.value || '').toString();
    }

    if (!question?.trim()) {
      return NextResponse.json({ error: 'Eksik parametre: question' }, { status: 400 });
    }
    if (Number.isNaN(ageMonths) || ageMonths < 0) ageMonths = 0;

    const urgent = detectUrgent(ageMonths, question);

    // Soruyu kaydet (best-effort)
    try {
      const supa = supabaseServer();
      await supa.from('questions').insert({
        user_id: null,
        child_age_months: ageMonths,
        text: question
      });
    } catch {}

    // Aday FAQ'lar (yaş + basit kelime skoru)
    let faqs: Faq[] = [];
    try {
      const supa = supabaseServer();
      const { data } = await supa
        .from('faqs')
        .select('*')
        .lte('age_min', ageMonths)
        .gte('age_max', ageMonths)
        .limit(30);

      const kws = extractKeywords(question);
      faqs = (data || [])
        .map((f: Faq) => {
          const hay = `${f.category ?? ''} ${f.question} ${f.answer}`.toLowerCase();
          const score = kws.reduce((acc, w) => (hay.includes(w) ? acc + 1 : acc), 0);
          return { ...f, _score: score } as any;
        })
        .sort((a: any, b: any) => b._score - a._score)
        .slice(0, 3)                         // bağlamı daha da kısalttık
        .map((f: any) => { delete f._score; return f as Faq; });
    } catch { faqs = []; }

    // Bağlamı KISALT
    const clip = (s: string, n: number) =>
      (s || '').replace(/\s+/g, ' ').trim().slice(0, n);

    const system =
      'Pediatri asistanısın. Tanı koymaz, ilaç/doz vermezsin.' +
      ' Türkçe, sakin ve kısa yaz. Biçim:' +
      ' 1 kısa özet; 3 madde pratik öneri; "Ne zaman doktora?" için 1 madde.' +
      ' 3 aydan küçük + 38°C, nefes darlığı, morarma, bilinç değişikliği varsa ACİL uyar.';

    const context = faqs.length
      ? 'Kısa FAQ bağlamı:\n' +
        faqs.slice(0, 1).map((f, i) =>
          `- [${i + 1}] ${f.category ?? ''} • ${f.age_min}-${f.age_max} ay
Soru: ${clip(f.question, 100)}
Cevap: ${clip(f.answer, 220)}`
        ).join('\n\n')
      : 'İlgili FAQ bulunamadı. Genel, güvenli öneriler ver.';

    const userMsg =
      `Bebek yaşı (ay): ${ageMonths}\n` +
      `Soru: ${clip(question, 200)}\n\n` +
      context +
      (urgent ? '\n\nÖNEMLİ: Metinde olası acil belirti var. Öncelikle acil uyarısını vurgula.' : '');

    // LLM
    const { text: aiText, llmUsed, llmError, provider } = await askGemini(system, userMsg);

    let source: 'AI' | 'FAQ' | 'FALLBACK';
    let answer: string;

    if (aiText) {
      source = 'AI';
      answer = `🔹 AI\n${aiText}`;
    } else if (faqs.length) {
      source = 'FAQ';
      answer = `🔸 FAQ\n${faqs[0].answer}`;
    } else {
      source = 'FALLBACK';
      answer = '🔺 Fallback\nÖn değerlendirme: Tehlike işareti görünmüyor. Çocuğu gözlemleyin, sıvı alımını izleyin. Belirti artarsa sağlık profesyoneline başvurun.';
    }

    return NextResponse.json({
      answer,
      candidates: faqs,
      disclaimer: DISCLAIMER,
      meta: { source, llmUsed, llmError, provider, matchedFaqs: faqs.length, urgent }
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'İşlenemeyen istek', detail: e?.message || 'unknown' },
      { status: 500 }
    );
  }
}
