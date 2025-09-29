export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ ok:false, error:'GEMINI_API_KEY yok' }, { status:500 });

  try {
    // Basit generate testi
    const res = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'Sadece "ok" yaz.' }]}] }),
    });
    const j = await res.json();
    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      text: j?.candidates?.[0]?.content?.parts?.[0]?.text || null,
      error: j?.error?.message || null,
    });
  } catch (e:any) {
    return NextResponse.json({ ok:false, error:e.message }, { status:500 });
  }
}
