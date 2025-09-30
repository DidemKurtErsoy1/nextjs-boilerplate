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
function cut(s: string, max = 400) {
  if (!s) return '';
  const t = s.replace(/\s+/g, ' ').trim();
  return t.length > max ? t.slice(0, max) + '…' : t;
}

function detectUrgent(ageMonths: number, text: string) {
  const s = (text || '').toLowerCase();
  const redWords = [
    'nefes','solunum','zor','zorluk','morarma','mavi',
    'havale','nöbet','bilinç','bayıl','tepkisiz','hırıltı','hirilti'
  ];
  const hasRed = redWords.some(w => s.includes(w));
  const hasFever = /(?:38(\.|,)?\d?)/.test(s) || s.includes('38 derece');
  const smallInfant = ageMonths >= 0 && ageMonths < 3 && hasFever;
  return hasRed || smallInfant;
}

// Sıcaklık yakala: "38", "38.5", "38°", "38 C", "38 derece"
function extractTempC(q: string): number | null {
  const s = (q || '').toLowerCase();
  const m = s.match(/(\d{2}(?:[.,]\d)?)(?:\s?°\s?c| ?c| ?derece)?/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  if (isNaN(n) || n < 30 || n > 45) return null;
  return n;
}

// Kural tabanlı acil kesme
function evaluateRisk(ageMonths: number, q: string) {
  const t = extractTempC(q);
  const emergency =
    (t !== null && t >= 40) ||            // ≥40°C
    (ageMonths < 3 && t !== null && t >= 38) || // <3 ay + ≥38°C
    detectUrgent(ageMonths, q);           // kritik anahtarlar
  return { emergency, temp: t };
}

// Basit anahtar kelime çıkarımı (eşanlamlar dahil)
function extractKeywords(q: string) {
  const base = (q || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  const extras: string[] = [];

  // ateş
  if (base.some(w => ['ateş','ates','ateşi','atesi'].includes(w))) extras.push('ateş');

  // öksürük
  if (base.some(w => ['öksürük','oksuruk','öksürüyor','oksuruyor','hırıltı','hirilti','balgam'].includes(w))) {
    extras.push('öksürük');
  }

  // ishal
  if (base.some(w => ['ishal','diare','sulu','kaka'].includes(w))) extras.push('ishal');

  // kusma
  if (base.some(w => ['kusma','kustu','istifra','kusan'].includes(w))) extras.push('kusma');

  // kabızlık
  if (base.some(w => ['kabız','kabizlik','kabızlık','kabiz','kaka yapmıyor','sert'].includes(w))) extras.push('kabızlık');

  // uyku / ek gıda
  if (base.some(w => ['uyku','uyumuyor','gece'].includes(w))) extras.push('uyku');
  if (base.includes('ek') && base.some(w => ['gıda','gida'].includes(w))) extras.push('ek gıda');

  return Array.from(new Set([...base, ...extras])).slice(0, 12);
}

function supabaseServer() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** ------------ GEMINI (kısa, dayanıklı) ------------ */
// Kısa ve hızlı modellerle sırayla dene; kısmi metin gelse bile kabul et
async function geminiGenerate(prompt: string) {
  const key = process.env.GEMINI_API_KEY!;
  if (!key) throw new Error('GEMINI_API_KEY yok');

  const MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash', 'gemini-2.5-flash'];

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 140, // kısa tut
          candidateCount: 1
        }
      })
    });

    const j = await res.json().catch(() => ({}));
    if (!res.ok) {
      const msg = j?.error?.message || `HTTP ${res.status}`;
      if (/not\s+found|unsupported|permission/i.test(msg)) continue; // sıradaki model
      throw new Error(msg);
    }

    const parts = j?.candidates?.[0]?.content?.parts || [];
    const text  = parts.map((p:any)=>p?.text).filter(Boolean).join('\n').trim();
    if (text) return { text };

    // MAX_TOKENS / EMPTY / BLOCK… : metin yoksa sıradaki denemeye bırak
  }

  throw new Error('no_model_available_or_empty');
}

// Bağlamlı kısa prompt; düşerse bağlamsız çok kısa retry
async function askGeminiSmart(ageMonths: number, question: string, faqs: Faq[], urgent: boolean) {
  const system =
    'Pediatri asistanısın; tanı koyma, ilaç/doz verme. Türkçe ve kısa yaz. ' +
    'Biçim: 1 cümle özet; 3 madde öneri; 1 madde "Ne zaman doktora?". Toplam ≤90 kelime. ' +
    'Acil belirti varsa önce ACİL uyar.';

  const ctx = faqs.length
    ? 'Kısa FAQ:\n' + faqs.map((f,i)=>
        `- [${i+1}] ${f.category ?? ''} • ${f.age_min}-${f.age_max} ay\n` +
        `S: ${cut(f.question, 100)}\nC: ${cut(f.answer, 180)}`
      ).join('\n')
    : 'FAQ yoksa genel ama güvenli öneri yaz.';

  const user =
    `Bebek yaşı: ${ageMonths} ay\n` +
    `Soru: ${cut(question, 140)}\n\n` +
    ctx +
    (urgent ? '\n\nÖNEMLİ: Metinde olası acil belirti var; önce acil uyar.' : '');

  // Deneme 1: bağlamlı kısa
  try {
    const r1 = await geminiGenerate(cut(`Sistem:\n${system}\n\nKullanıcı:\n${user}`, 1600));
    return { text: r1.text, llmUsed: true, llmError: null, provider: 'gemini' as const };
  } catch (_) {
    // Deneme 2: bağlamsız ultra kısa
    try {
      const user2 =
        `Yaş: ${ageMonths} ay. Soru: ${cut(question, 140)}. ` +
        (urgent ? 'Acil belirti mümkün, önce acil uyar.' : '') +
        ' En fazla 5 satır ver.';
      const r2 = await geminiGenerate(cut(`Sistem:\n${system}\n\nKullanıcı:\n${user2}`, 800));
      return { text: r2.text, llmUsed: true, llmError: null, provider: 'gemini' as const };
    } catch (e2:any) {
      return { text: null, llmUsed: false, llmError: String(e2?.message || e2), provider: 'gemini' as const };
    }
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

    // Tally webhook desteği (opsiyonel)
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

    // Çok kısa soru
    if (question.trim().length < 12) {
      const answer =
        'Ön değerlendirme: Soru çok kısa. Daha doğru yönlendirme için şunları ekleyin:\n' +
        '• Bebeğin yaşı (ay)\n• Ölçülen en yüksek ateş ve nasıl ölçtünüz\n• Eşlik eden belirti (nefes darlığı, kusma vb.)';
      return NextResponse.json({
        answer, candidates: [], disclaimer: DISCLAIMER,
        meta: { source: 'FALLBACK', llmUsed: false, llmError: null, provider: 'rules', matchedFaqs: 0, urgent: false }
      });
    }

    // ACİL kuralı
    const risk = evaluateRisk(ageMonths, question);
    if (risk.emergency) {
      const t = risk.temp;
      const answer =
        '🔺 ACİL UYARI\n' +
        (t ? `• Bildirilen ateş: yaklaşık ${t}°C.\n` : '') +
        '• 40°C ve üzeri ateş veya 3 aydan küçük bebekte ≥38°C acil değerlendirme gerektirebilir.\n' +
        '• Hemen bir sağlık kuruluşuna başvurun veya 112’yi arayın.\n' +
        '• İnce giydirin, serin ortam; bol sıvı teklif edin.\n' +
        '• Soğuk duş/alkollü ovma uygulamayın; ilaç dozu yazmam.';
      return NextResponse.json({
        answer, candidates: [], disclaimer: DISCLAIMER,
        meta: { source: 'FALLBACK', llmUsed: false, llmError: null, provider: 'rules', matchedFaqs: 0, urgent: true }
      });
    }

    const urgent = detectUrgent(ageMonths, question);

    // Soruyu kaydet (best-effort)
    try {
      const supa = supabaseServer();
      await supa.from('questions').insert({
        user_id: null, child_age_months: ageMonths, text: question
      });
    } catch {}

    // FAQ adayları (yaş + kelime skoru) → en fazla 2 bağlam
    let faqs: Faq[] = [];
    try {
      const supa = supabaseServer();
      const { data } = await supa
        .from('faqs')
        .select('*')
        .lte('age_min', ageMonths)
        .gte('age_max', ageMonths)
        .limit(20);

      const kws = extractKeywords(question);
      faqs = (data || [])
        .map((f: Faq) => {
          const hay = `${f.category ?? ''} ${f.question} ${f.answer}`.toLowerCase();
          const score = kws.reduce((acc, w) => (hay.includes(w) ? acc + 1 : acc), 0);
          return { ...f, _score: score } as any;
        })
        .sort((a: any, b: any) => b._score - a._score)
        .slice(0, 2)
        .map((f: any) => { delete f._score; return f as Faq; });
    } catch { faqs = []; }

    // LLM: bağlamlı kısa → olmazsa bağlamsız kısa
    const { text: aiText, llmUsed, llmError, provider } =
      await askGeminiSmart(ageMonths, question, faqs, urgent);

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
      answer =
        '🔺 Fallback\nÖn değerlendirme: Tehlike işareti görünmüyor. ' +
        'Çocuğu gözlemleyin, sıvı alımını izleyin. Belirti artarsa sağlık profesyoneline başvurun.';
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
