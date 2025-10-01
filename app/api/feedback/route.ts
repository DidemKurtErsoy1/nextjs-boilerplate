export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function supabaseServer() {
  const url = process.env.SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, {
    auth: { persistSession: false }, // sadece burada; başka yere koyma
  });
}

export async function GET() {
  // sağlık kontrolü
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const question_text = (body?.question_text || '').toString().slice(0, 2000);
    const age_months = Number.isFinite(body?.age_months) ? Number(body.age_months) : null;
    const was_helpful = body?.was_helpful;

    if (typeof was_helpful !== 'boolean') {
      return NextResponse.json(
        { error: 'was_helpful (boolean) gerekli' },
        { status: 400 }
      );
    }

    const supa = supabaseServer();
    const { error } = await supa.from('feedback').insert({
      question_text,
      age_months,
      was_helpful,
    });
    if (error) throw error;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: String(e?.message || e) },
      { status: 500 }
    );
  }
}
