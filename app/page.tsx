'use client';

import { useState } from 'react';

type ApiResp = {
  answer?: string;
  candidates?: any[];
  disclaimer?: string;
  meta?: {
    source?: 'AI' | 'FAQ' | 'FALLBACK';
    llmUsed?: boolean;
    llmError?: string | null;
    matchedFaqs?: number;
    urgent?: boolean;
  };
  error?: string;
  detail?: string;
};

const cleanAnswer = (s: string) =>
  (s || '').replace(/^🔹 AI\n|^🔸 FAQ\n|^🔺 Fallback\n/, '');

export default function Home() {
  const [age, setAge] = useState<string>('7');
  const [question, setQuestion] = useState<string>('Ateş 38.2; ne yapmalıyım?');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // ...
async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setResp(null);

  const payload = {
    ageMonths: Number(age || 0),
    question: question.trim(),
  };

  setLastPayload(payload);

  try {
    // URL'deki ?v=... parametresini API'ye de taşı
    const provider = typeof window !== 'undefined'
      ? new URLSearchParams(window.location.search).get('v') || ''
      : '';

    const url = provider ? `/api/ask?v=${provider}` : '/api/ask';

    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const j = (await r.json()) as ApiResp;
    if (!r.ok) throw new Error(j?.error || j?.detail || 'Request failed');
    setResp(j);
  } catch (err: any) {
    setError(err?.message || 'Bir şeyler ters gitti.');
  } finally {
    setLoading(false);
  }
}

  return (
    <main style={{ maxWidth: 820, margin: '40px auto', padding: 16 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>BabyQ – Anne Sorular</h1>
      <p style={{ opacity: 0.7, marginBottom: 24 }}>
        “Her annenin aklına gelen sorulara güvenilir ve anında cevap”
      </p>

      <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
        <label>
          Bebeğin yaşı (ay):
          <input
            type="number"
            min={0}
            max={60}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{ width: '100%', padding: 10, marginTop: 6 }}
            required
          />
        </label>

        <label>
          Sorun nedir?
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={5}
            style={{ width: '100%', padding: 10, marginTop: 6 }}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding: '14px 16px',
            background: loading ? '#666' : '#111',
            color: '#fff',
            borderRadius: 8,
            border: 0,
            cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: 8,
          }}
        >
          {loading ? 'Cevap hazırlanıyor…' : 'Cevapla'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, color: 'crimson' }}>
          Hata: {error}
        </div>
      )}

      {resp && (
        <section style={{ marginTop: 24 }}>
          <h3 style={{ fontSize: 22, fontWeight: 700 }}>Yanıt</h3>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {cleanAnswer(resp.answer || '')}
          </div>

          {resp.candidates?.length ? (
            <details style={{ marginTop: 16 }}>
              <summary>Kaynakları göster ({resp.candidates.length})</summary>
              <ul style={{ marginTop: 8 }}>
                {resp.candidates.map((c: any, i: number) => (
                  <li key={c.id || i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>
                      {c.category} • {c.age_min}-{c.age_max} ay
                    </div>
                    <div style={{ opacity: 0.8 }}>{c.question}</div>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          <details style={{ marginTop: 12 }}>
            <summary>Debug (meta)</summary>
            <pre style={{ marginTop: 8 }}>
{JSON.stringify(resp.meta, null, 2)}
            </pre>
          </details>

          <details style={{ marginTop: 12 }}>
            <summary>Gönderilen payload</summary>
            <pre style={{ marginTop: 8 }}>
{JSON.stringify(lastPayload, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}
