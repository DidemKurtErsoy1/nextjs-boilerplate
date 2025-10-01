// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BabyQ — Parenting Answers",
  description: "Trusted, instant answers to the questions every parent has.",
  manifest: "/manifest.json",
  themeColor: "#111111",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Top Bar */}
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          backdropFilter: 'saturate(180%) blur(8px)',
          background: 'rgba(8,12,20,.7)', borderBottom: '1px solid rgba(255,255,255,.06)'
        }}>
          <nav style={{
            maxWidth: 980, margin: '0 auto', padding: '12px 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between'
          }}>
            <Link href="/" style={{ display:'flex', gap:10, alignItems:'center', fontWeight:800, color:'#fff', textDecoration:'none' }}>
              <span style={{ fontSize:20 }}>👶</span>
              <span>BabyQ</span>
            </Link>
            <div style={{ display:'flex', gap:18 }}>
              <Link href="/" style={{ color:'#fff', opacity:.9 }}>Ask</Link>
              <Link href="/articles" style={{ color:'#fff', opacity:.9 }}>Articles</Link>
              <Link href="/profile" style={{ color:'#fff', opacity:.9 }}>Profile</Link>
              <Link href="/legal" style={{ color:'#fff', opacity:.9 }}>Legal</Link>
            </div>
          </nav>
        </header>

        <main style={{ maxWidth: 980, margin: '0 auto', padding: '24px 16px' }}>
          {children}
        </main>

        <footer style={{ maxWidth:980, margin:'40px auto', padding:'12px 16px', opacity:.6, color:'#cbd5e1' }}>
          © {new Date().getFullYear()} <strong>BabyQ</strong> — safe, concise answers.
        </footer>
      </body>
    </html>
  );
}
