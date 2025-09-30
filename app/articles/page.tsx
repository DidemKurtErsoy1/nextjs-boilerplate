import Link from "next/link";
import { articles } from "./data";

export default function ArticlesPage() {
  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 800 }}>Yazılar</h1>

      <ul style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {articles.map((a) => (
          <li
            key={a.slug}
            style={{
              border: "1px solid #222",
              borderRadius: 12,
              padding: 16,
              background: "rgba(255,255,255,0.02)",
              boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
              transition: "transform .12s ease, box-shadow .12s ease",
            }}
          >
            <div style={{ opacity: 0.7, fontSize: 12 }}>
              {new Date(a.date).toLocaleDateString("tr-TR")}
              {a.tags?.length ? " • " + a.tags.join(" • ") : null}
            </div>

            <h2 style={{ fontSize: 18, margin: "6px 0 0" }}>
              <Link href={`/articles/${a.slug}`} style={{ color: "inherit", textDecoration: "none" }}>
                {a.title}
              </Link>
            </h2>

            <p style={{ opacity: 0.85, marginTop: 6 }}>{a.excerpt}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {a.tags?.map((t) => (
                <span
                  key={t}
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid rgba(255,255,255,0.08)",
                    background: "rgba(255,255,255,0.04)",
                    opacity: 0.9,
                  }}
                >
                  #{t}
                </span>
              ))}
            </div>

            <div style={{ marginTop: 10 }}>
              <Link href={`/articles/${a.slug}`} style={{ color: "inherit" }}>
                Devamını oku →
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}
