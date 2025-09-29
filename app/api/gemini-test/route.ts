export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ ok:false, error:'GEMINI_API_KEY yok' }, { status:500 });

  // Sırayla dene: önce v1, sonra v1beta; -latest kullanma
  const tries = [
    { ver: 'v1',     model: 'gemini-1.5-flash'    },
    { ver: 'v1',     model: 'gemini-1.5-flash-8b' },
    { ver: 'v1beta', model: 'gemini-1.5-flash'    },
    { ver: 'v1beta', model: 'gemini-1.5-flash-8b' },
  ];

  let lastErr: any = null;

  for (const t of tries) {
    const url = `https://generativelanguage.googleapis.com/${t.ver}/models/${t.model}:generateContent`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': key
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Sadece "Merhaba" de.' }] }],
        generationConfig: { temperature: 0.2, maxOutputTokens: 64 }
      })
    });
    const j = await res.json().catch(() => null);
    const text = j?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (res.ok && text) {
      return NextResponse.json({ ok:true, version:t.ver, model:t.model, text });
    }
    lastErr = { status: res.status, error: j?.error?.message || JSON.stringify(j) };
  }

  return NextResponse.json({ ok:false, ...lastErr }, { status: 500 });
}
