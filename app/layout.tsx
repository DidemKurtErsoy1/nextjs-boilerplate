// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SwRegister from "./sw-register";

const geistSans = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-geist-mono" });

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
      <body className={`${geistSans.variable} ${geistMono.variable} site-bg`}>
        <SwRegister />

        {/* Üst Bar */}
        <header className="site-header">
          <nav className="site-nav">
            <Link href="/" className="brand">
              <span className="logo">👶</span>
              <span>BabyQ</span>
            </Link>

            <div className="spacer" />

            <div className="nav-links">
              <Link href="/" className="nav-link">Soru-Cevap</Link>
              <Link href="/articles" className="nav-link">Yazılar</Link>
              <Link href="/profile" className="nav-link">Profil</Link>
              <Link href="/legal" className="nav-link">Hukuki</Link>
            </div>
          </nav>
        </header>

        {/* Sayfa içeriği (ortalanmış bir kart içinde) */}
        <main className="site-main">
          <section className="card">
            {children}
          </section>
        </main>

        {/* Alt bilgi */}
        <footer className="site-footer">
          © {new Date().getFullYear()} <strong>BabyQ</strong> — güvenli, kısa yanıtlar.
        </footer>
      </body>
    </html>
  );
}
