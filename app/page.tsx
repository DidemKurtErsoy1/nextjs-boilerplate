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

  // Autofill age (months) from Profile (localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem('babyq_profile_v1');
      if (!raw) return;
      const p = JSON.parse(raw) as { birth_date?: string };
      if (!p?.birth_date) return;
      const monthsBetween = (birthISO: string) => {
        const b = new Date(birthISO); const now = new Date();
        let m = (now.getFullYear() - b.getFullYear()) * 12 + (now.getMonth() - b.getMonth());
        if (now.getDate() < b.getDate()) m -= 1;
        return Math.max(0, m);
      };
      setAge(String(monthsBetween(p.birth_date)));
    } catch {}
  }, []);

  // URL params
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
    setLoading(true); setError(null); setResp(null);

    const payload = { ageMonths: Number(age || 0), question: question.trim() };
    setLastPayload(payload);

    try {
      const url = providerQuery ? `/api/ask?v=${providerQuery}` : '/api/ask';
      const r = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
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
      {/* HERO: orange → yellow */}
      <div style={{
        borderRadius: 18,
        padding: 24,
        marginBottom: 16,
        background: 'linear-gradient(135deg, #FF8A3D 0%, #FFC857 100%)',
        color: '#0b1220',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: '0 20px 40px rgba(255, 168, 56, .20)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
          <span style={{ fontSize:28, lineHeight:1 }}>👶</span>
          <h1 style={{ fontSize: 34, lineHeight:1.2, margin:0, fontWeight: 800 }}>
            BabyQ — Parenting Answers
          </h1>
        </div>
        <p style={{ margin:0, opacity:.85, fontSize:16 }}>
          Trusted, instant answers to the questions every parent has.
        </p>
      </div>

      {/* FORM */}
      <form onSubmit={onSubmit} style={{
        display:'grid', gap:12,
        background:'#ffffff', padding:16, borderRadius:16,
        border:'1px solid #EEF2F7', boxShadow:'0 10px 30px rgba(2,12,27,.06)'
      }}>
        <label>
          Baby’s age (months)
          <input
            type="number"
            min={0}
            max={60}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            style={{
              width:'100%', padding:12, marginTop:6,
              background:'#ffffff', color:'#0b1220',
              border:'1px solid #E5E7EB', borderRadius:12, outline:'none',
              boxShadow:'inset 0 1px 2px rgba(16,24,40,.04)',
              transition:'border-color .12s ease, box-shadow .12s ease'
            }}
            onFocus={(e)=>{ e.currentTarget.style.borderColor='#FB923C'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(251,146,60,.25)';}}
            onBlur={(e)=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.boxShadow='inset 0 1px 2px rgba(16,24,40,.04)';}}
            required
          />
        </label>

        <label>
          What’s the concern?
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={5}
            placeholder="e.g. My baby is coughing a lot and has a 38.2°C fever. What should I do?"
            style={{
              width:'100%', padding:12, marginTop:6, resize:'vertical',
              background:'#ffffff', color:'#0b1220',
              border:'1px solid #E5E7EB', borderRadius:12, outline:'none',
              boxShadow:'inset 0 1px 2px rgba(16,24,40,.04)',
              transition:'border-color .12s ease, box-shadow .12s ease'
            }}
            onFocus={(e)=>{ e.currentTarget.style.borderColor='#FB923C'; e.currentTarget.style.boxShadow='0 0 0 3px rgba(251,146,60,.25)';}}
            onBlur={(e)=>{ e.currentTarget.style.borderColor='#E5E7EB'; e.currentTarget.style.boxShadow='inset 0 1px 2px rgba(16,24,40,.04)';}}
            required
          />
        </label>

        <button
          type="submit"
          disabled={loading || !question.trim()}
          style={{
            padding:'12px 16px',
            background:'#ffffff',
            color:'#0b1220', fontWeight:800,
            borderRadius:12, border:'1px solid #E2E8F0',
            cursor: loading ? 'not-allowed':'pointer',
            boxShadow: loading ? 'none' : '0 2px 10px rgba(0,0,0,.06)',
            transition:'transform .06s ease, box-shadow .12s ease, border-color .12s ease'
          }}
          onMouseEnter={(e)=> e.currentTarget.style.boxShadow='0 4px 14px rgba(0,0,0,.10)'}
          onMouseLeave={(e)=> e.currentTarget.style.boxShadow='0 2px 10px rgba(0,0,0,.06)'}
          onMouseDown={(e)=> e.currentTarget.style.transform='scale(0.98)'}
          onMouseUp={(e)=> e.currentTarget.style.transform='scale(1)'}
        >
          {loading ? 'Generating…' : 'Get Answer'}
        </button>
      </form>

      {/* Errors */}
      {error && (
        <div style={{
          marginTop:16, padding:12, border:'1px solid #FECACA',
          background:'#FEF2F2', color:'#991B1B', borderRadius:12
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Answer */}
      {resp && (
        <section style={{ marginTop: 24 }}>
          {resp?.meta?.urgent ? (
            <div style={{
              marginBottom:12, padding:12, border:'1px solid #FDBA74',
              background:'#FFF7ED', color:'#9A3412', borderRadius:12
            }}>
              <strong>URGENT:</strong> Symptoms may be urgent. Call emergency services or go to the nearest facility.
            </div>
          ) : null}

          <h3 style={{ fontSize: 20, fontWeight: 800, margin:'8px 0' }}>Answer</h3>
          <div style={{ whiteSpace:'pre-wrap', marginTop:8, background:'#fff', border:'1px solid #EEF2F7', borderRadius:12, padding:12 }}>
            {cleanAnswer(resp.answer || '')}
          </div>

          {resp?.disclaimer && (
            <div style={{ marginTop: 10, fontSize: 13, opacity: .75 }}>
              {resp.disclaimer}
            </div>
          )}

          {resp.candidates?.length ? (
            <details style={{ marginTop: 14 }}>
              <summary>Show sources ({resp.candidates.length})</summary>
              <ul style={{ marginTop: 8 }}>
                {resp.candidates.map((c: any, i: number) => (
                  <li key={c.id || i} style={{ marginBottom: 8 }}>
                    <div style={{ fontWeight: 600 }}>
                      {c.category} • {c.age_min}-{c.age_max} mo
                    </div>
                    <div style={{ opacity: 0.8 }}>{c.question}</div>
                  </li>
                ))}
              </ul>
            </details>
          ) : null}

          {showDebug && (
            <>
              <details style={{ marginTop: 12 }}>
                <summary>Debug (meta)</summary>
                <pre style={{ marginTop: 8 }}>{JSON.stringify(resp.meta, null, 2)}</pre>
              </details>

              <details style={{ marginTop: 12 }}>
                <summary>Payload</summary>
                <pre style={{ marginTop: 8 }}>{JSON.stringify(lastPayload, null, 2)}</pre>
              </details>
            </>
          )}
        </section>
      )}
    </>
  );
}
