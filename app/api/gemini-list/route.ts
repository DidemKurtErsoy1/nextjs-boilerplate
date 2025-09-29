export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: 'GEMINI_API_KEY yok' }, { status: 500 });

  const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${key}`);
  const j = await res.json().catch(() => ({}));

  const models = (j.models || []).map((m: any) => ({
    name: m.name, // ör: "models/gemini-1.5-flash"
    methods: m.supportedGenerationMethods // ör: ["generateContent", "countTokens"]
  }));

  return NextResponse.json({ models });
}
