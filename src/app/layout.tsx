import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const noto = localFont({
  src: "./fonts/NotoSansKR-VariableFont_wght.ttf",
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jiin Lee | Portfolio",
  description: "Portfolio site built with Next.js, Supabase, Tailwind",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className="h-full">
      <body
        className={`
          ${noto.className}
          ${noto.variable}
          bg-cream text-text-main antialiased min-h-screen
        `}
      >
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-border-soft sticky top-0 bg-cream/80 backdrop-blur z-20">
            <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-accent-orange" />
                <span className="title-20_sb">Jiin’s 포트폴리오</span>
              </div>
              <nav className="flex gap-4 label-14_sb">
                <a href="/" className="hover:underline">
                  Home
                </a>
                <a href="/admin" className="hover:underline">
                  Admin
                </a>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            {children}
          </main>
          <footer className="border-t border-border-soft mt-12">
            <div className="max-w-5xl mx-auto px-4 py-6 body-13_l text-gray-500">
              © {new Date().getFullYear()} Jiin Lee · Built with Next.js & Supabase
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
