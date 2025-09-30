// app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BabyQ — Anne Sorular",
  description: "Her annenin aklına gelen sorulara güvenilir ve anında cevap.",
  // PWA / ikonlar
  manifest: "/manifest.json",
  themeColor: "#111111",
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/icon-192.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr">
      <head>
        {/* iOS için standalone davranışı */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Üst navigasyon */}
        <header style={{ borderBottom: "1px solid #eee" }}>
          <nav
            style={{
              maxWidth: 820,
              margin: "0 auto",
              padding: "12px 16px",
              display: "flex",
              gap: 16,
            }}
          >
            <Link href="/">Soru-Cevap</Link>
            <Link href="/articles">Yazılar</Link>
            <Link href="/legal">Hukuki</Link>
          </nav>
        </header>

        {/* Sayfa içerikleri */}
        {children}

        {/* Alt bilgi */}
        <footer
          style={{
            maxWidth: 820,
            margin: "40px auto",
            padding: "12px 16px",
            opacity: 0.6,
          }}
        >
          © {new Date().getFullYear()} BabyQ
        </footer>
      </body>
    </html>
  );
}
