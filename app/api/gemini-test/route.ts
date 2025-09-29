export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ ok: false, error: 'GEMINI_API_KEY yok' }, { status: 500 });

  try {
    // 1) Model listesi
    const listRes = await fetch('https://generativelanguage.googleapis.com/v1/models', {
      headers: { 'x-goog-api-key': key }
    });
    const listJson = await listRes.json();

    // 2) Basit generate
    const genRes = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Sadece "ok" yaz.' }] }] })
    });
    const genJson = await genRes.json();

    return NextResponse.json({
      ok: true,
      listStatus: listRes.status,
      firstModels: listJson?.models?.slice(0, 3)?.map((m: any) => m?.name),
      genStatus: genRes.status,
      genText: genJson?.candidates?.[0]?.content?.parts?.[0]?.text || null,
      genError: genJson?.error?.message || null
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e.message }, { status: 500 });
  }
}
