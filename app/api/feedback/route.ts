export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseAdmin() {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false }
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { question_text, age_months, was_helpful } = body || {};
    if (typeof was_helpful !== 'boolean') {
      return NextResponse.json({ error: 'was_helpful gerekli (boolean)' }, { status: 400 });
    }
    const supa = supabaseAdmin();
    await supa.from('feedback').insert({
      question_text: (question_text || '').toString(),
      age_months: Number(age_months) || 0,
      was_helpful
    });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok:false, error: e?.message || 'insert_error' }, { status: 500 });
  }
}
