import { notFound } from 'next/navigation';
import { articles } from '../data';

export default function ArticleDetail({ params }: { params: { slug: string } }) {
  const art = articles.find(a => a.slug === params.slug);
  if (!art) return notFound();

  return (
    <main style={{maxWidth:820, margin:'40px auto', padding:16}}>
      <h1 style={{fontSize:28, fontWeight:700}}>{art.title}</h1>
      <pre style={{whiteSpace:'pre-wrap', marginTop:12, lineHeight:1.6}}>{art.body}</pre>
    </main>
  );
}
