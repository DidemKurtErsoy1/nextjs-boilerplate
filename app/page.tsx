'use client'
import { useState } from 'react'

type ApiResp = { answer: string; candidates: any[]; disclaimer: string; error?: string; detail?: string }

export default function Home() {
  const [age, setAge] = useState<number>(7)
  const [q, setQ] = useState('')
  const [res, setRes] = useState<ApiResp | null>(null)
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState<string | null>(null)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setErr(null); setRes(null)
    try {
      const r = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ageMonths: age, question: q })
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j?.error || 'request_failed')
      setRes(j)
    } catch (e:any) {
      setErr(String(e.message || e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <main style={{maxWidth:680, margin:'0 auto', padding:24, fontFamily:'system-ui, Arial'}}>
      <h1 style={{fontSize:28, fontWeight:700, marginBottom:8}}>BabyQ – Anne Sorular</h1>
      <p style={{opacity:.8, marginBottom:24}}>“Her annenin aklına gelen sorulara güvenilir ve anında cevap”</p>

      <form onSubmit={submit} style={{display:'grid', gap:12}}>
        <label> Bebeğin yaşı (ay):
          <input type="number" min={0} max={60} value={age}
                 onChange={e=>setAge(Number(e.target.value))}
                 style={{width:'100%', padding:10, borderRadius:10, border:'1px solid #ccc'}} />
        </label>

        <label> Sorun nedir?
          <textarea rows={4} placeholder="Örn: Ateş 38.2; ne yapmalıyım?"
                    value={q} onChange={e=>setQ(e.target.value)}
                    style={{width:'100%', padding:10, borderRadius:10, border:'1px solid #ccc'}} />
        </label>

        <button disabled={loading || q.trim().length < 3}
                style={{padding:'10px 16px', borderRadius:10, border:'none', background:'#111', color:'#fff'}}>
          {loading ? 'Yanıt aranıyor…' : 'Cevapla'}
        </button>
      </form>

      {err && <p style={{color:'#b00020', marginTop:16}}>Hata: {err}</p>}

      {res && (
        <section style={{marginTop:24}}>
          <h2 style={{fontSize:20, fontWeight:700, marginBottom:8}}>Yanıt</h2>
          <p style={{whiteSpace:'pre-wrap'}}>{res.answer}</p>
          <p style={{fontSize:12, opacity:.8, marginTop:8}}>{res.disclaimer}</p>

          {res.candidates?.length > 0 && (
            <details style={{marginTop:16}}>
              <summary>Aday kaynaklar ({res.candidates.length})</summary>
              <ul>
                {res.candidates.map((c:any) => (
                  <li key={c.id}><strong>{c.category}</strong>: {c.question}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}
    </main>
  )
}
