import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import "@/styles/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "LearnSphere AI - Personalized Learning Experience",
  description:
    "Transform any content into a personalized, interactive learning experience using Chrome's built-in AI APIs. Adaptive content, mind maps, audio lessons, and Bloom's Taxonomy assessments tailored to your grade level and interests.",
  keywords: [
    "AI learning",
    "personalized education",
    "Chrome AI",
    "adaptive learning",
    "Bloom's taxonomy",
  ],
  authors: [{ name: "LearnSphere AI Team" }],
  robots: "index, follow",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#7DBDB8",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="32x32" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LearnSphere AI" />
      </head>
      <body
        className={`${inter.className} antialiased bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 min-h-screen`}
      >
        <div className="flex flex-col min-h-screen">
          <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Image
                    src="/logo.svg"
                    alt="LearnSphere AI Logo"
                    className="w-8 h-8"
                    width={32}
                    height={32}
                  />
                  <h1 className="text-xl font-bold text-gray-900">
                    LearnSphere AI
                  </h1>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm text-gray-600">Chrome AI Ready</div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 container mx-auto px-4 py-8">{children}</main>

          <footer className="bg-white/60 backdrop-blur-sm border-t border-gray-200 py-4">
            <div className="container mx-auto px-4 text-center text-sm text-gray-600">
              <p>
                Powered by Chrome Built-in AI • Privacy-first learning • Offline
                capable
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
