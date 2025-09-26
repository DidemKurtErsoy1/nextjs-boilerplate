import { NextResponse } from 'next/server'
import { supabaseAdmin } from '../../../lib/supabaseServer'

type AskBody = { ageMonths?: number; question?: string }

export async function GET() { return NextResponse.json({ ok: true }) }

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AskBody
    const age = Math.max(0, Math.min(60, Number(body.ageMonths ?? 0)))
    const q = String(body.question ?? '').trim().slice(0, 600)
    if (!q) return NextResponse.json({ error: 'question_required' }, { status: 400 })

    await supabaseAdmin.from('questions')
      .insert({ user_id: null, child_age_months: age, text: q })

    const keyword = q.split(/\s+/).slice(0,3).join(' ')
    const { data: faqs, error } = await supabaseAdmin
      .from('faqs')
      .select('id, question, answer, source, category, age_min, age_max')
      .lte('age_min', age).gte('age_max', age)
      .or(`question.ilike.%${keyword}%,answer.ilike.%${keyword}%`)
      .limit(3)
    if (error) throw error

    const answer = faqs?.length
      ? faqs[0].answer
      : 'Ön değerlendirme: Tehlike işareti görünmüyor. Gözlemleyin, sıvı verin; kötüleşirse sağlık profesyoneline başvurun.'
    const disclaimer = 'Bu içerik tıbbi tavsiye değildir. Acil belirtilerde 112’yi arayın veya en yakın sağlık kuruluşuna başvurun.'
    return NextResponse.json({ answer, candidates: faqs ?? [], disclaimer })
  } catch (e:any) {
    return NextResponse.json({ error: 'internal_error', detail: e?.message ?? e }, { status: 500 })
  }
}
