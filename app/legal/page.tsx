// app/legal/page.tsx
export default function LegalPage() {
  return (
    <main style={{ maxWidth: 820, margin:'24px auto', padding:16 }}>
      <h1 style={{ fontSize:28, fontWeight:800 }}>Legal & Safety</h1>
      <p style={{ opacity:.75 }}>
        BabyQ provides general, educational information and does not offer medical diagnosis, treatment,
        or prescriptions. Always seek the advice of a qualified healthcare professional with any questions
        you may have regarding a medical condition. If you think your child may have a medical emergency,
        call your local emergency number immediately.
      </p>
      <h3 style={{ marginTop:16 }}>Data</h3>
      <p style={{ opacity:.85 }}>
        We store minimal data to operate the service. Questions may be logged to improve quality.
        See our Privacy section (coming soon) for details.
      </p>
      <h3 style={{ marginTop:16 }}>Contact</h3>
      <p style={{ opacity:.85 }}>hello@babyq.app (placeholder)</p>
    </main>
  );
}
