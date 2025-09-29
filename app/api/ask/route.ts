export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// -------------------------
// Helpers & config
// -------------------------

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

const DISCLAIMER =
  'Bu içerik tıbbi tavsiye değildir. Acil belirtilerde 112’yi arayın veya en yakın sağlık kuruluşuna başvurun.';

// basit kırmızı bayrak kontrolü
function detectUrgent(ageMonths: number, text: string) {
  const s = (text || '').toLowerCase();
  const redWords = [
    'nefes', 'solunum', 'zor', 'zorluk',
    'morarma', 'mavi',
    'havale', 'nöbet',
    'bilinç', 'bayıl', 'tepkisiz'
  ];
  const hasRed = redWords.some(w => s.includes(w));
  // 3 aydan küçük ve 38+ ateş
  const hasFever = /(?:38(\.|,)?\d?)/.test(s) || s.includes('38 derece');
  const smallInfant = ageMonths >= 0 && ageMonths < 3 && hasFever;
  return hasRed || smallInfant;
}

// kullanıcı metninden anahtar kelime çıkar (çok basit)
function extractKeywords(q: string) {
  const base = (q || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);

  // küçük eşanlam/alias desteği
  const extras: string[] = [];
  if (base.includes('ateş') || base.includes('ates')) extras.push('ateş');
  if (base.includes('uyku') || base.includes('uyum')) extras.push('uyku');
  if (base.includes('ek') && base.includes('gıda')) extras.push('ek gıda');
  if (base.includes('kabız') || base.includes('kabiz')) extras.push('kabızlık');

  return Array.from(new Set([...base, ...extras])).slice(0, 10);
}

// Supabase server client (service role ile)
function supabaseServer() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Gemini 1.5 Flash ile yanıt iste
async function callGemini(prompt: string) {
  const key = process.env.GEMINI_API_KEY!;
  const MODELS = ['gemini-1.5-flash-latest', 'gemini-1.5-flash-8b-latest']; // sırasıyla dene

  for (const model of MODELS) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }]}],
        generationConfig: { temperature: 0.2, maxOutputTokens: 600 },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    const j = await res.json();
    if (res.ok) {
      const text =
        j.candidates?.[0]?.content?.parts?.[0]?.text?.trim?.() || '';
      if (text) return text;
    } else {
      // 404/unsupported ise bir sonraki modele geç
      const msg = j?.error?.message || '';
      if (!/not found|unsupported/i.test(msg)) {
        throw new Error(msg || 'Gemini call failed');
      }
    }
  }

  throw new Error('No Gemini model available');
}


    return {
      text,
      llmUsed: !!text,
      llmError: r.ok ? null : (j?.error?.message || 'gemini_error'),
      provider: 'gemini' as const
    };
  } catch (e: any) {
    return { text: null, llmUsed: false, llmError: e?.message || 'gemini_error', provider: 'gemini' as const };
  }
}

// -------------------------
// GET: sağlık kontrolü
// -------------------------
export async function GET() {
  return NextResponse.json({ ok: true });
}

// -------------------------
// POST: soru-cevap
// -------------------------
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    // Tally webhook desteği (opsiyonel): fields dizisinden çek
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

    // Supabase: soruyu kaydet
    try {
      const supa = supabaseServer();
      await supa.from('questions').insert({
        user_id: null, // auth eklersen user_id geçir
        child_age_months: ageMonths,
        text: question
      });
    } catch {
      /* loglama dışında hatayı yutuyoruz */
    }

    // FAQ adaylarını getir (önce yaş filtresi, sonra basit keyword match)
    let faqs: Faq[] = [];
    try {
      const supa = supabaseServer();
      // yaş aralığına uyanları çek (ilk 50)
      const { data } = await supa
        .from('faqs')
        .select('*')
        .lte('age_min', ageMonths)
        .gte('age_max', ageMonths)
        .limit(50);
      const kws = extractKeywords(question);
      // anahtar kelime puanla
      faqs = (data || [])
        .map((f: Faq) => {
          const hay = `${f.category ?? ''} ${f.question} ${f.answer}`.toLowerCase();
          const score = kws.reduce((acc, w) => (hay.includes(w) ? acc + 1 : acc), 0);
          return { ...f, _score: score };
        })
        .sort((a: any, b: any) => (b._score - a._score))
        .slice(0, 5)
        .map((f: any) => {
          delete f._score;
          return f as Faq;
        });
    } catch {
      faqs = [];
    }

    // LLM prompt’u
    const system =
      'Sen bir pediatri asistanısın. Tıbbi tanı koymazsın ve ilaç/ doz vermezsin. ' +
      'Türkçe, kısa ve sakin yaz. Çıktı formatı: 1 kısa özet cümlesi; ardından 3 madde pratik öneri; ' +
      "'Ne zaman doktora?' için 1 madde. 3 aydan küçük + 38°C, nefes darlığı, morarma, bilinç değişikliği gibi durumlarda ACİL uyar.";

    const context = faqs.length
      ? 'İlgili FAQ içeriği:\n' + faqs.map((f, i) => `- [${i + 1}] ${f.category ?? ''} • ${f.age_min}-${f.age_max} ay\nSoru: ${f.question}\nCevap: ${f.answer}\n`).join('\n')
      : 'İlgili FAQ bulunamadı. Genel, güvenli öneriler ver.';

    const userMsg =
      `Bebek yaşı (ay): ${ageMonths}\n` +
      `Soru: ${question}\n\n` +
      context +
      (urgent ? '\n\nÖNEMLİ: Kullanıcı metninde olası acil belirti var. Öncelikle acil uyarısını vurgula.' : '');

    // Gemini'den yanıt iste
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
      answer =
        '🔺 Fallback\nÖn değerlendirme: Tehlike işareti görünmüyor. ' +
        'Çocuğu gözlemleyin, sıvı alımını takip edin. Belirti artarsa sağlık profesyoneline başvurun.';
    }

    return NextResponse.json({
      answer,
      candidates: faqs,
      disclaimer: DISCLAIMER,
      meta: {
        source,
        llmUsed,
        llmError,
        provider,          // "gemini" görmelisin
        matchedFaqs: faqs.length,
        urgent
      }
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'İşlenemeyen istek', detail: e?.message || 'unknown' },
      { status: 500 }
    );
  }
}
