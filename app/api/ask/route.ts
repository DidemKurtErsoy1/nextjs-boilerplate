import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseServer'

type AskBody = { ageMonths?: number; question?: string }

export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AskBody
    const age = Math.max(0, Math.min(60, Number(body.ageMonths ?? 0)))
    const q = String(body.question ?? '').trim().slice(0, 600)
    if (!q) return NextResponse.json({ error: 'question_required' }, { status: 400 })

    // 1) soruyu kaydet
    const { error: qErr } = await supabaseAdmin
      .from('questions')
      .insert({ user_id: null, child_age_months: age, text: q })
    if (qErr) throw qErr

    // 2) yaş aralığı + kelime-kelime arama
    const tokens = Array.from(
      new Set(
        q.toLowerCase()
         .replace(/[^\p{L}\s]/gu, ' ')      // noktalama vs. temizle
         .split(/\s+/)
         .filter(t => t && t.length >= 3)   // çok kısa kelimeleri at
      )
    ).slice(0, 3)

    const orFilter = tokens.length
      ? tokens.map(t => `question.ilike.%${t}%,answer.ilike.%${t}%`).join(',')
      : `question.ilike.%${q.split(/\s+/)[0]}%,answer.ilike.%${q.split(/\s+/)[0]}%`

    const { data: faqs, error: fErr } = await supabaseAdmin
      .from('faqs')
      .select('id, question, answer, source, category, age_min, age_max')
      .lte('age_min', age)
      .gte('age_max', age)
      .or(orFilter)
      .limit(3)
    if (fErr) throw fErr

    const answer = faqs?.length
      ? faqs[0].answer
      : 'Ön değerlendirme: Tehlike işareti görünmüyor. Çocuğu gözlemleyin, sıvı alımını takip edin. Belirti artarsa sağlık profesyoneline başvurun.'

    const disclaimer =
      'Bu içerik tıbbi tavsiye değildir. Acil belirtilerde 112’yi arayın veya en yakın sağlık kuruluşuna başvurun.'

    return NextResponse.json({ answer, candidates: faqs ?? [], disclaimer })
  } catch (e: any) {
    return NextResponse.json(
      { error: 'internal_error', detail: e?.message ?? String(e) },
      { status: 500 }
    )
  }
}
