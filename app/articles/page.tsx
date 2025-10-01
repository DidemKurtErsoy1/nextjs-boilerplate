// app/articles/page.tsx

import Link from "next/link";
import { articles } from "./data";

export default function ArticlesPage() {
  return (
    <main style={{ maxWidth: 820, margin: "40px auto", padding: 16 }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>Articles</h1>
      <ul style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {articles.map((a) => (
          <li key={a.slug} style={{ border: "1px solid #ddd", borderRadius: 12, padding: 16, background: "#fff" }}>
            <h2 style={{ fontSize: 20, margin: 0 }}>
              <Link href={`/articles/${a.slug}`}>{a.title}</Link>
            </h2>
            <p style={{ opacity: 0.8, marginTop: 6 }}>{a.excerpt}</p>
            <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>
              Updated: {a.updatedAt} · {a.author}
            </div>
            <Link href={`/articles/${a.slug}`}>Read more →</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}

