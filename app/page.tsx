'use client';

import { useEffect, useMemo, useState } from 'react';

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
    provider?: string;
  };
  error?: string;
  detail?: string;
};

const cleanAnswer = (s: string) =>
  (s || '').replace(/^🔹 AI\n|^🔸 FAQ\n|^🔺 Fallback\n/, '');

export default function Home() {
  const [age, setAge] = useState<string>('7');
  const [question, setQuestion] = useState<string>('My baby has a 38.2°C fever. What should I do?');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // Autofill age (months) from local profile
  useEffect(() => {
    try {
      const raw = localStorage.getItem('babyq_profile_v1');
      if (!raw) return;
      const p = JSON.parse(raw) as { birth_date?: string };
      if (!p?.birth_date) return;

      const monthsBetween = (birthISO: string) => {
        const b = new Date(birthISO);
        const now = new Date();
        let m =
          (now.getFullYear() - b.getFullYear()) * 12 +
          (now.getMonth() - b.getMonth());
        if (now.getDate() < b.getDate()) m -= 1;
        return Math.max(0, m);
      };

      setAge(String(monthsBetween(p.birth_date)));
    } catch {}
  }, []);

  // URL flags
  const showDebug = useMemo(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('debug');
  }, []);
  const providerQuery = useMemo(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('v') || '';
  }, []);

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
      const url = providerQuery ? `/api/ask?v=${providerQuery}` : '/api/ask';
      const r = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const j = (await r.json()) as ApiResp;
      if (!r.ok) throw new Error(j?.error || j?.detail || `HTTP ${r.status}`);
      setResp(j);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Hero (amber-only gradient) */}
      <section className="hero section">
        <div className="badge" aria-hidden="true">👶</div>
        <h1>BabyQ — Parenting Answers</h1>
        <p className="muted">Trusted, instant answers to the questions every parent has.</p>
      </section>

      {/* Form card */}
      <section className="card section" aria-labelledby="ask-title">
        <h2 id="ask-title" style={{ marginTop: 0, marginBottom: 12 }}>Ask a question</h2>

        <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12 }}>
          <label className="label" htmlFor="age">
            Baby’s age (months)
          </label>
          <input
            id="age"
            name="age"
            type="number"
            min={0}
            max={60}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="input"
            placeholder="e.g. 7"
            required
            aria-required="true"
          />

          <label className="label" htmlFor="question">
            What’s the concern?
          </label>
          <textarea
            id="question"
            name="question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="textarea"
            placeholder="e.g. My baby is coughing a lot and has a 38.2°C fever. What should I do?"
            required
            aria-required="true"
          />

          <button
            type="submit"
            className="btn"
            disabled={loading || !question.trim()}
            aria-busy={loading}
          >
            {loading ? 'Preparing answer…' : 'Get answer'}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="alert-danger" style={{ marginTop: 14 }}>
            <strong>Error:</strong> {error}
          </div>
        )}
      </section>

      {/* Answer */}
      {resp && (
        <section className="card section" aria-labelledby="answer-title">
          {/* emergency banner */}
          {resp?.meta?.urgent ? (
            <div className="alert" role="alert" style={{ marginBottom: 12 }}>
              <strong>URGENT:</strong> Symptoms may be urgent. Call emergency services or visit the nearest healthcare facility.
            </div>
          ) : null}

          <h2 id="answer-title" style={{ marginTop: 0 }}>Answer</h2>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {cleanAnswer(resp.answer || '')}
          </div>

          {/* Disclaimer */}
          {resp?.disclaimer && (
            <div className="muted" style={{ marginTop: 12, fontSize: 13 }}>
              {resp.disclaimer}
            </div>
          )}

          {/* Sources */}
          {resp.candidates?.length ? (
            <details style={{ marginTop: 16 }}>
              <summary>Sources ({resp.candidates.length})</summary>
              <ul style={{ marginTop: 8 }}>
                {resp.candidates.map((c: any, i: number) => (
                  <li key={c.id || i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>
                      {c.category} • {c.age_min}-{c.age_max} months
                    </div>
                    <div className="muted">{c.question}</div>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {/* Debug (only with ?debug=1) */}
          {showDebug && (
            <>
              <details style={{ marginTop: 12 }}>
                <summary>Debug (meta)</summary>
                <pre style={{ marginTop: 8 }}>
{JSON.stringify(resp.meta, null, 2)}
                </pre>
              </details>

              <details style={{ marginTop: 12 }}>
                <summary>Sent payload</summary>
                <pre style={{ marginTop: 8 }}>
{JSON.stringify(lastPayload, null, 2)}
                </pre>
              </details>
            </>
          )}
        </section>
      )}
    </>
  );
}
