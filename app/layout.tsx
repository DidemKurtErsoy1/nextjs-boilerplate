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

// ...imports ve metadata aynı...

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`} style={{ background:'#fff' }}>
        <SwRegister />

        <header className="header glass">
          <nav className="nav">
            <Link className="brand" href="/">
              <span className="brand-mark">👶</span>
              <span>BabyQ</span>
            </Link>
            <div className="links">
              <Link className="nav-btn" href="/">Ask</Link>
              <Link className="nav-btn" href="/articles">Articles</Link>
              <Link className="nav-btn" href="/profile">Profile</Link>
              <Link className="nav-btn" href="/legal">Legal</Link>
            </div>
          </nav>
        </header>

        <main className="container">
          <section className="card">{children}</section>
        </main>

        <footer className="footer">
          © {new Date().getFullYear()} <strong>BabyQ</strong> — trusted, instant answers.
        </footer>
      </body>
    </html>
  );
}

