'use client';

import { useEffect, useMemo, useState } from 'react';

/* ------------ Types ------------ */
type ApiResp = {
  answer?: string;
  candidates?: Array<{
    id?: string;
    age_min?: number;
    age_max?: number;
    category?: string | null;
    question?: string;
  }>;
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

/* ------------ Helpers ------------ */
const cleanAnswer = (s: string) =>
  (s || '').replace(/^🔹 AI\n|^🔸 FAQ\n|^🔺 Fallback\n/, '');

/* ------------ Page ------------ */
export default function Home() {
  const [age, setAge] = useState<string>('');        // will auto-fill from Profile (localStorage)
  const [question, setQuestion] = useState<string>(''); // placeholder will guide the user
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // Auto-fill age (months) from local profile
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
    <main style={{ maxWidth: 920, margin: '40px auto', padding: 0 }}>
      {/* Hero */}
      <section
        style={{
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 8px 28px rgba(0,0,0,.08)',
        }}
      >
        {/* Warm gradient header (yellow → orange → green) */}
        <div
          style={{
            background:
              'linear-gradient(135deg, #FFE873 0%, #FFB84D 45%, #3DDC97 100%)',
            padding: '28px 24px',
            color: '#0f172a',
          }}
        >
          <h1
            style={{
              fontSize: 36,
              fontWeight: 900,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span
              style={{
                display: 'inline-flex',
                width: 44,
                height: 44,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 12,
                background: 'rgba(255,255,255,0.55)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.3)',
                fontSize: 24,
              }}
            >
              👶
            </span>
            BabyQ — Parenting Answers
          </h1>
          <p
            style={{
              margin: '8px 0 0 0',
              fontSize: 16,
              fontWeight: 600,
              opacity: 0.9,
            }}
          >
            “Trusted, instant answers to the questions every parent has.”
          </p>
        </div>

        {/* Form + Answer area */}
        <div
          style={{
            background: 'linear-gradient(180deg, #fff 0%, #f8fff8 100%)',
            padding: 20,
          }}
        >
          {/* Form Card */}
          <form
            onSubmit={onSubmit}
            style={{
              display: 'grid',
              gap: 14,
              padding: 20,
              border: '1px solid #e6e6e6',
              borderRadius: 14,
              background: '#ffffff',
              boxShadow:
                '0 2px 8px rgba(0,0,0,0.03), 0 1px 0 rgba(255,255,255,0.6) inset',
            }}
          >
            <label style={{ fontWeight: 700, color: '#334155' }}>
              Baby’s age (months)
              <input
                type="number"
                min={0}
                max={60}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 7"
                style={{
                  width: '100%',
                  padding: 12,
                  marginTop: 6,
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  boxShadow: '0 0 0 2px rgba(61,220,151,0)',
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    '0 0 0 2px rgba(61,220,151,.35)')
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                required
              />
            </label>

            <label style={{ fontWeight: 700, color: '#334155' }}>
              What’s the concern?
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={5}
                placeholder="e.g. My baby is coughing a lot and has a 38.2°C fever. What should I do?"
                style={{
                  width: '100%',
                  padding: 12,
                  marginTop: 6,
                  borderRadius: 10,
                  border: '1px solid #d1d5db',
                  outline: 'none',
                  resize: 'vertical',
                }}
                onFocus={(e) =>
                  (e.currentTarget.style.boxShadow =
                    '0 0 0 2px rgba(255,184,77,.35)')
                }
                onBlur={(e) => (e.currentTarget.style.boxShadow = 'none')}
                required
              />
            </label>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
  type="submit"
  disabled={loading || !question.trim()}
  style={{
    padding: '12px 16px',
    background: '#ffffff',
    color: '#0b1220',
    fontWeight: 800,
    borderRadius: 12,
    border: '1px solid #E2E8F0',
    cursor: loading ? 'not-allowed' : 'pointer',
    boxShadow: loading ? 'none' : '0 2px 10px rgba(0,0,0,.06)',
    transition: 'transform .06s ease, box-shadow .12s ease, border-color .12s ease',
  }}
  onMouseEnter={(e) => (e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,.10)')}
  onMouseLeave={(e) => (e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,.06)')}
  onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.98)')}
  onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
>
  {loading ? '🤖 Generating answer…' : '✨ Get Answer'}
</button>


              <a
                href="/profile"
                style={{
                  padding: '12px 16px',
                  background: '#F1F5F9',
                  color: '#0b1220',
                  fontWeight: 700,
                  borderRadius: 12,
                  border: '1px solid #E2E8F0',
                  textDecoration: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
                title="Update your profile to auto-fill age"
              >
                👤 Edit Profile
              </a>
            </div>
          </form>

          {/* Error */}
          {error && (
            <div
              style={{
                marginTop: 16,
                padding: 14,
                border: '1px solid #f3c',
                background:
                  'linear-gradient(180deg, #fff0f6 0%, #fff6fb 100%)',
                borderRadius: 12,
                color: '#9c1c6b',
                fontWeight: 600,
              }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Answer */}
          {resp && (
            <section
              style={{
                marginTop: 18,
                padding: 18,
                border: '1px solid #e6e6e6',
                borderRadius: 14,
                background: '#ffffff',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
              }}
            >
              {resp?.meta?.urgent ? (
                <div
                  style={{
                    marginBottom: 12,
                    padding: 14,
                    border: '1px solid #fda4a4',
                    background:
                      'linear-gradient(180deg, #fff5f5 0%, #ffecec 100%)',
                    color: '#991b1b',
                    borderRadius: 12,
                    fontWeight: 800,
                  }}
                >
                  🚨 EMERGENCY: Symptoms may be urgent. Call local emergency
                  services or seek immediate medical care.
                </div>
              ) : null}

              <h3 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>
                📌 Answer
              </h3>
              <div
                style={{
                  whiteSpace: 'pre-wrap',
                  marginTop: 10,
                  lineHeight: 1.55,
                  color: '#0b1220',
                }}
              >
                {cleanAnswer(resp.answer || '')}
              </div>

              {resp?.disclaimer && (
                <div
                  style={{
                    marginTop: 12,
                    fontSize: 13,
                    opacity: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                >
                  ⚠️ {resp.disclaimer}
                </div>
              )}

              {resp.candidates?.length ? (
                <details style={{ marginTop: 16 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 700 }}>
                    📚 Show sources ({resp.candidates.length})
                  </summary>
                  <ul style={{ marginTop: 8 }}>
                    {resp.candidates.map((c, i) => (
                      <li key={(c as any).id || i} style={{ marginBottom: 8 }}>
                        <div style={{ fontWeight: 700 }}>
                          {(c as any).category} • {(c as any).age_min}-
                          {(c as any).age_max} mo
                        </div>
                        <div style={{ opacity: 0.8 }}>
                          {(c as any).question}
                        </div>
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}

              {/* Simple feedback (works if /api/feedback exists) */}
              <div style={{ marginTop: 14, display: 'flex', gap: 10 }}>
                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          question_text: question,
                          age_months: Number(age || 0),
                          was_helpful: true,
                        }),
                      });
                      alert('Thanks for your feedback! 🙌');
                    } catch {}
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                  }}
                >
                  Helpful 👍
                </button>

                <button
                  onClick={async () => {
                    try {
                      await fetch('/api/feedback', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          question_text: question,
                          age_months: Number(age || 0),
                          was_helpful: false,
                        }),
                      });
                      alert('Thanks — we’ll improve the answer. 🙏');
                    } catch {}
                  }}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 10,
                    border: '1px solid #e2e8f0',
                    background: '#F8FAFC',
                    cursor: 'pointer',
                  }}
                >
                  Not helpful 👎
                </button>
              </div>

              {/* Debug (optional via ?debug=1) */}
              {showDebug && (
                <>
                  <details style={{ marginTop: 12 }}>
                    <summary>🛠 Debug (meta)</summary>
                    <pre style={{ marginTop: 8 }}>
                      {JSON.stringify(resp.meta, null, 2)}
                    </pre>
                  </details>
                  <details style={{ marginTop: 12 }}>
                    <summary>📤 Sent payload</summary>
                    <pre style={{ marginTop: 8 }}>
                      {JSON.stringify(lastPayload, null, 2)}
                    </pre>
                  </details>
                </>
              )}
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
