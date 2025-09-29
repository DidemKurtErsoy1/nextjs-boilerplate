export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseServer'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

type AskBody = { ageMonths?: number; question?: string }

const RED_FLAGS =
  /(3.*ay.*(alt|küç).*|3\s*ay.*|üç.*ay.*).*\b38\b|nefes\s*darlığı|solunum\s*sıkıntısı|morarma|bayıl(ma|dı)|havale|konv(ü|u)lsiyon|bilinç\s*değ/i

const DISCLAIMER =
  'Bu içerik tıbbi tavsiye değildir. Acil belirtilerde 112’yi arayın veya en yakın sağlık kuruluşuna başvurun.'

const norm = (s: string) => s.toLowerCase().replace(/[^\p{L}\s]/gu, ' ')
const tokensOf = (q: string, n = 4) =>
  Array.from(new Set(norm(q).split(/\s+/).filter(t => t && t.length >= 3))).slice(0, n)

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AskBody
    const age = Math.max(0, Math.min(60, Number(body.ageMonths ?? 0)))
    const q = String(body.question ?? '').trim().slice(0, 600)
    if (!q) return NextResponse.json({ error: 'question_required' }, { status: 400 })

    // 1) Soruyu kaydet
    await supabaseAdmin.from('questions').insert({ user_id: null, child_age_months: age, text: q })

    // 2) FAQ adaylarını bul (yaş + kelime, sonra fallback'ler)
    const tokens = tokensOf(q)
    const cols = 'id, question, answer, source, category, age_min, age_max'

    // a) yaş + kelime
    let { data: faqs, error: fErr } = await supabaseAdmin
      .from('faqs')
      .select(cols)
      .lte('age_min', age)
      .gte('age_max', age)
      .or(tokens.length ? tokens.map(t => `question.ilike.%${t}%,answer.ilike.%${t}%`).join(',') : undefined)
      .limit(5)
    if (fErr) throw fErr

    // b) yalnız yaş
    if (!faqs?.length) {
      const r2 = await supabaseAdmin.from('faqs').select(cols).lte('age_min', age).gte('age_max', age).limit(5)
      if (r2.error) throw r2.error
      faqs = r2.data ?? []
    }

    // c) yalnız kelime
    if (!faqs?.length && tokens.length) {
      const r3 = await supabaseAdmin
        .from('faqs')
        .select(cols)
        .or(tokens.map(t => `question.ilike.%${t}%,answer.ilike.%${t}%`).join(','))
        .limit(5)
      if (r3.error) throw r3.error
      faqs = r3.data ?? []
    }

    const urgent = RED_FLAGS.test(q)
    const context = (faqs ?? [])
      .map((f, i) => `# KAYNAK ${i + 1}\nKategori: ${f.category}\nSoru: ${f.question}\nYanıt: ${f.answer}`)
      .join('\n\n')

    // 3) LLM dene
    let source: 'AI' | 'FAQ' | 'FALLBACK' = 'FALLBACK'
    let llmUsed = false
    let llmError: string | null = null
    let aiAnswer = ''

    try {
      const system =
        `Sen bir çocuk sağlığı asistanısın; teşhis koymazsın, bilgilendirirsin.
Kısa ve sakin Türkçe yanıt ver; en fazla 4–6 maddelik öneri yaz.
0–60 ay için konuş. Yanıtın sonunda uyarı metnini ekle.` + (urgent ? '\nSORUDA ACİL UYARI VAR: Önce acil değerlendirme öner.' : '')

      const userMsg = `Çocuğun yaşı (ay): ${age}
Soru: ${q}

İlgili içerik özetleri:
${context || '— (bağlam yok)'}
Yanıt biçimi: 1) 1 cümle özet 2) 3–5 madde öneri 3) "Ne zaman doktora?"`

      const completion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 420,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: userMsg },
        ],
      })
      aiAnswer = completion.choices?.[0]?.message?.content?.trim() || ''
      if (aiAnswer) {
        source = 'AI'
        llmUsed = true
      }
    } catch (e: any) {
      llmError = e?.message || String(e)
    }

    // 4) Nihai cevap
    let final = ''
    if (aiAnswer) {
      final = `🔹 AI\n${aiAnswer}`
    } else if (faqs?.[0]?.answer) {
      final = `🔸 FAQ\n${faqs[0].answer}`
      source = 'FAQ'
    } else {
      final = `🔺 Fallback\nÖn değerlendirme: Tehlike işareti görünmüyor. Çocuğu gözlemleyin, sıvı alımını takip edin. Belirti artarsa sağlık profesyoneline başvurun.`
      source = 'FALLBACK'
    }

    return NextResponse.json({
      answer: `${final}\n\n${DISCLAIMER}`,
      candidates: faqs ?? [],
      disclaimer: DISCLAIMER,
      meta: { source, llmUsed, llmError, matchedFaqs: faqs?.length || 0, urgent }
    })
  } catch (e: any) {
    return NextResponse.json({ error: 'internal_error', detail: e?.message ?? String(e) }, { status: 500 })
  }
}
