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
  const [question, setQuestion] = useState<string>('Ateş 38.2; ne yapmalıyım?');
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ApiResp | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<any>(null);

  // Profilden yaş (ay) otomatik doldur (localStorage)
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

  // URL parametreleri (?debug=1, ?v=gemini gibi)
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
        <div
          style={{
            marginTop: 16,
            padding: 12,
            border: '1px solid #f3c',
            background: '#fff0f6',
            borderRadius: 8,
            color: '#9c1c6b',
          }}
        >
          <strong>Hata:</strong> {error}
        </div>
      )}

      {resp && (
        <section style={{ marginTop: 24 }}>
          {/* ACİL uyarı kutusu */}
          {resp?.meta?.urgent ? (
            <div
              style={{
                marginBottom: 12,
                padding: 12,
                border: '1px solid '#f99',
                background: '#fee',
                color: '#900',
                borderRadius: 8,
              }}
            >
              <strong>ACİL UYARI:</strong> Belirtiler acil olabilir. 112’yi
              arayın veya en yakın sağlık kuruluşuna başvurun.
            </div>
          ) : null}

          <h3 style={{ fontSize: 22, fontWeight: 700 }}>Yanıt</h3>
          <div style={{ whiteSpace: 'pre-wrap', marginTop: 8 }}>
            {cleanAnswer(resp.answer || '')}
          </div>

          {/* Disclaimer */}
          {resp?.disclaimer && (
            <div style={{ marginTop: 12, fontSize: 13, opacity: 0.75 }}>
              {resp.disclaimer}
            </div>
          )}

          {/* Kaynaklar */}
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

          {/* Feedback (opsiyonel; /api/feedback varsa çalışır) */}
          <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
            <button
              onClick={async () => {
                try {
                  const r = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      question_text: question,
                      age_months: Number(age || 0),
                      was_helpful: true,
                    }),
                  });
                  if (r.ok) alert('Teşekkürler! 🙌');
                } catch {}
              }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}
            >
              Faydalıydı 👍
            </button>

            <button
              onClick={async () => {
                try {
                  const r = await fetch('/api/feedback', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      question_text: question,
                      age_months: Number(age || 0),
                      was_helpful: false,
                    }),
                  });
                  if (r.ok) alert('Geri bildirimin için teşekkürler. 🙏');
                } catch {}
              }}
              style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #ddd', cursor: 'pointer' }}
            >
              Faydalı değildi 👎
            </button>
          </div>

          {/* Debug sadece ?debug=1 ile */}
          {showDebug && (
            <>
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
            </>
          )}
        </section>
      )}
    </main>
  );
}
