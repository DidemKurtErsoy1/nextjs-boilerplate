// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SwRegister from "./sw-register"; // PWA service worker

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BabyQ — Anne Sorular",
  description: "Her annenin aklına gelen sorulara güvenilir ve anında cevap.",
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
    <html lang="tr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg`}>
        <SwRegister />

        {/* Üst Bar */}
        <header className="header glass">
          <nav className="nav">
            <Link className="brand" href="/">
              <span className="brand-mark">👶</span>
              <span>BabyQ</span>
            </Link>
            <div className="links">
              <Link className="nav-btn" href="/">Soru-Cevap</Link>
              <Link className="nav-btn" href="/articles">Yazılar</Link>
              <Link className="nav-btn" href="/legal">Hukuki</Link>
            </div>
          </nav>
        </header>

        {/* Sayfa içeriği */}
        <main className="container">
          <section className="card">{children}</section>
        </main>

        {/* Footer */}
        <footer className="footer">
          © {new Date().getFullYear()} <strong>BabyQ</strong> — güvenli, kısa yanıtlar.
        </footer>
      </body>
    </html>
  );
}
