// app/articles/[slug]/page.tsx
import { notFound } from 'next/navigation';
import { articles } from '../data';

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const a = articles.find(x => x.slug === params.slug);
  if (!a) return notFound();

  return (
    <main style={{ maxWidth: 820, margin:'24px auto', padding:16 }}>
      <h1 style={{ fontSize:30, fontWeight:800, marginBottom:8 }}>{a.title}</h1>
      <p style={{ opacity:.75 }}>{a.excerpt}</p>
      <hr style={{ margin:'16px 0', border:'none', borderTop:'1px solid #EEF2F7' }} />
      <div style={{ whiteSpace:'pre-wrap', lineHeight:1.6 }}>{a.content}</div>
    </main>
  );
}
