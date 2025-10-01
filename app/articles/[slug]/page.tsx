// app/articles/[slug]/page.tsx
import { notFound } from "next/navigation";
import { articles } from "../data";

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = articles.find((x) => x.slug === params.slug);
  if (!a) return notFound();

  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8 }}>{a.title}</h1>
      <p style={{ opacity: 0.8, marginBottom: 12 }}>{a.excerpt}</p>
      <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 24 }}>
        Updated: {a.updatedAt} · {a.author}
      </div>

      {a.content.hero && <p style={{ fontStyle: "italic", marginBottom: 16 }}>{a.content.hero}</p>}

      {a.content.sections.map((s, i) => (
        <section key={i} style={{ margin: "20px 0" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700 }}>{s.h2}</h2>
          {s.paras.map((p, j) => (
            <p key={j} style={{ lineHeight: 1.6 }}>{p}</p>
          ))}
          {s.bullets && (
            <ul style={{ marginLeft: 18 }}>
              {s.bullets.map((b, k) => (
                <li key={k}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}

      <section style={{ marginTop: 28 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700 }}>FAQ</h2>
        <ul style={{ marginLeft: 18 }}>
          {a.content.faq.map((f, i) => (
            <li key={i} style={{ marginBottom: 10 }}>
              <strong>{f.q}</strong>
              <div>{f.a}</div>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
