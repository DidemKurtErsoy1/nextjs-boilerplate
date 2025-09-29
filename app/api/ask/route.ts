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

// Sıcaklık (°C) yakala
function extractTempC(q: string): number | null {
  const s = (q || '').toLowerCase();
  const m = s.match(/(\d{2}(?:[.,]\d)?)(?:\s?°\s?c| ?c| ?derece)?/i);
  if (!m) return null;
  const n = parseFloat(m[1].replace(',', '.'));
  if (isNaN(n) || n < 30 || n > 45) return null;
  return n;
}

// Risk değerlendirme: kural tabanlı acil kesme
function evaluateRisk(ageMonths: number, q: string) {
  const t = extractTempC(q);
  const keywordsUrgent = detectUrgent(ageMonths, q);
  const veryYoungFever = ageMonths < 3 && t !== null && t >= 38;
  const hyperpyrexia = t !== null && t >= 40;
  if (hyperpyrexia || veryYoungFever || keywordsUrgent) {
    return { level: 'emergency' as const, temp: t, reason: hyperpyrexia ? '≥40°C' : veryYoungFever ? '<3 ay + ≥38°C' : 'metinde acil belirti' };
  }
  return { level: 'normal' as const, temp: t, reason: null as string | null };
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

// Kullanıcıya gösterilecek metni JSON'dan üret
function renderAnswerFromJSON(obj: any) {
  try {
    const summary = (obj?.summary || '').trim();
    const steps: string[] = Array.isArray(obj?.actions) ? obj.actions : [];
    const doctor: string[] = Array.isArray(obj?.doctor_when) ? obj.doctor_when : [];
    const extra: string[] = Array.isArray(obj?.notes) ? obj.notes : [];

    const bullets = (arr: string[]) => arr.filter(Boolean).map(x => `• ${x.trim()}`).join('\n');

    let out = '';
    if (summary) out += `${summary}\n`;
    if (steps.length) out += bullets(steps) + '\n';
    if (doctor.length) out += `Ne zaman doktora?\n${bullets(doctor)}\n`;
    if (extra.length) out += bullets(extra) + '\n';
    return out.trim();
  } catch {
    return '';
  }
}

/** ------------ GEMINI (v1, 2.5-pro → 2.5-flash, JSON çıktısı) ------------ */
async function callGeminiJSON(prompt: string) {
  const key = process.env.GEMINI_API_KEY!;
  if (!key) throw new Error('GEMINI_API_KEY yok');

  const MODELS = ['gemini-2.5-pro', 'gemini-2.5-flash']; // kalite → hızlı fallback
  const urlFor = (m: string) => `https://generativelanguage.googleapis.com/v1/models/${m}:generateContent?key=${key}`;

  const reqBody = {
    contents: [{ role: 'user', parts: [{ text: prompt }]}],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 180,             // kısa, net
      responseMimeType: 'application/json' // JSON iste
    }
  };

  for (const model of MODELS) {
    const res = await fetch(urlFor(model), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(reqBody),
    });
    const j = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg = j?.error?.message || `HTTP ${res.status}`;
      // model erişilemezse sıradakine geç
      if (/not\s+found|unsupported|permission/i.test(msg)) continue;
      throw new Error(msg);
    }

    // JSON bekliyoruz; yine de güvenle parse et
    let obj: any = null;
    try {
      const raw = j?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      obj = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      // Bazı sürümlerde zaten obj döner
      obj = j?.candidates?.[0]?.content?.parts?.[0] ?? null;
    }

    if (obj && (obj.summary || obj.actions || obj.doctor_when)) {
      return { ok: true, model, obj };
    }

    // hiç içerik yoksa sebebi bul
    const finish = j?.candidates?.[0]?.finishReason || j?.promptFeedback?.blockReason || 'empty_response';
    throw new Error(String(finish));
  }

  throw new Error('no_model_available');
}

async function askGeminiStructured(system: string, user: string) {
  // Sıkı, kısa, JSON şablonlu prompt
  const prompt = [
    'Aşağıdaki kurallara %100 uy:',
    '• Kısa ve sakin Türkçe yaz.',
    '• Tanı koyma, ilaç/DOZ verme, marka önermeden konuş.',
    '• Sadece verilen bağlamı ve genel güvenli ebeveynlik bilgisini kullan.',
    '• Cevabı SADECE şu JSON biçiminde ver, markdown KULLANMA:',
    '{',
    '  "summary": "tek cümle özet",',
    '  "actions": ["madde1","madde2","madde3"],',
    '  "doctor_when": ["şu durumda...","bu durumda..."],',
    '  "notes": ["varsa ek kısa not"]',
    '}',
    '',
    'Sistem talimatı:',
    system,
    '',
    'Kullanıcı:',
    user
  ].join('\n');

  try {
    const r = await callGeminiJSON(prompt);
    const pretty = renderAnswerFromJSON(r.obj);
    if (pretty) {
      return { text: pretty, llmUsed: true, llmError: null, provider: 'gemini' as const };
    }
    return { text: null, llmUsed: false, llmError: 'empty_json', provider: 'gemini' as const };
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

    // 0) AŞIRI KISA SORU FİLTRESİ
    if (question.trim().length < 12) {
      const answer =
        'Ön değerlendirme: Soru çok kısa. Daha doğru yönlendirme için şu soruları yanıtlayın:\n' +
        '• Bebeğin yaşı (ay)?\n' +
        '• Ölçülen en yüksek ateş kaç °C ve nasıl ölçtünüz?\n' +
        '• Eşlik eden belirti var mı (nefes darlığı, morarma, kusma, uyuşukluk vb.)?';
      return NextResponse.json({
        answer,
        candidates: [],
        disclaimer: DISCLAIMER,
        meta: { source: 'FALLBACK', llmUsed: false, llmError: null, provider: 'gemini', matchedFaqs: 0, urgent: false }
      });
    }

    // 1) KURAL TABANLI ACİL KESME
    const risk = evaluateRisk(ageMonths, question);
    if (risk.level === 'emergency') {
      const t = risk.temp;
      const answer =
        '🔺 ACİL UYARI\n' +
        (t ? `• Bildirilen ateş: yaklaşık ${t}°C.\n` : '') +
        '• 40°C ve üzeri ateş veya 3 aydan küçük bebekte ≥38°C acil değerlendirme gerektirebilir.\n' +
        '• Hemen bir sağlık kuruluşuna başvurun veya 112’yi arayın.\n' +
        '• İnce giydirin, serin ortam sağlayın; bol sıvı teklif edin.\n' +
        '• Soğuk duş/alkollü ovma uygulamayın; ilaç dozu yazmam.\n' +
        '• Nefes darlığı, morarma, bilinç değişikliği, tepkisizlik varsa beklemeyin.';
      return NextResponse.json({
        answer,
        candidates: [],
        disclaimer: DISCLAIMER,
        meta: { source: 'FALLBACK', llmUsed: false, llmError: null, provider: 'rules', matchedFaqs: 0, urgent: true }
      });
    }

    const urgent = detectUrgent(ageMonths, question);

    // 2) Soruyu kaydet (best-effort)
    try {
      const supa = supabaseServer();
      await supa.from('questions').insert({
        user_id: null,
        child_age_months: ageMonths,
        text: question
      });
    } catch {}

    // 3) Aday FAQ'lar — kısa bağlam
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

    // 4) Kısaltılmış bağlam + yapılandırılmış prompt
    const clip = (s: string, n: number) =>
      (s || '').replace(/\s+/g, ' ').trim().slice(0, n);

    const system =
      'Pediatri asistanısın. Tanı koymaz, ilaç/doz vermezsin. ' +
      'Kısa ve sakin Türkçe. Çıktı JSON olacak (summary, actions[3], doctor_when[1-3], notes[0-2]). ' +
      'Şüphede kalırsan belirsizliğini belirt ve güvenli öneri ver.';

    const ctx = faqs.length
      ? 'Kısa FAQ bağlamı:\n' +
        faqs.map((f, i) =>
          `- [${i + 1}] ${f.category ?? ''} • ${f.age_min}-${f.age_max} ay\n` +
          `Soru: ${clip(f.question, 100)}\n` +
          `Cevap: ${clip(f.answer, 220)}`
        ).join('\n\n')
      : 'İlgili FAQ bulunamadı. Genel, güvenli ebeveynlik önerileri ver.';

    const userMsg =
      `Bebek yaşı (ay): ${ageMonths}\n` +
      `Soru: ${clip(question, 220)}\n\n` +
      ctx +
      (urgent ? '\n\nÖNEMLİ: Metinde olası acil belirti var. Uyarıya öncelik ver.' : '');

    // 5) LLM (yapılandırılmış)
    const { text: aiText, llmUsed, llmError, provider } = await askGeminiStructured(system, userMsg);

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
