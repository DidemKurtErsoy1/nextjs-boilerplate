import Link from 'next/link';
import { articles } from './data';

export default function ArticlesPage() {
  return (
    <main style={{maxWidth:820, margin:'40px auto', padding:16}}>
      <h1 style={{fontSize:28, fontWeight:700}}>Yazılar</h1>
      <ul style={{marginTop:16, display:'grid', gap:12}}>
        {articles.map(a => (
          <li key={a.slug} style={{border:'1px solid #eee', borderRadius:8, padding:12}}>
            <h2 style={{fontSize:18, margin:0}}>
              <Link href={`/articles/${a.slug}`}>{a.title}</Link>
            </h2>
            <p style={{opacity:.8, marginTop:6}}>{a.excerpt}</p>
            <Link href={`/articles/${a.slug}`}>Devamını oku →</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
