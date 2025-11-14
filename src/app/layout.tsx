

import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";
import { AppShell } from "@/components/AppShell";

// Cloudflare Pages (next-on-pages) 빌드 호환을 위해 전역 Edge 런타임 선언

const noto = localFont({
  src: "./fonts/NotoSansKR-VariableFont_wght.ttf",
  variable: "--font-noto-sans-kr",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Jiin Lee | Portfolio",
  description: "Portfolio site built with Next.js, Supabase, Tailwind",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  const profile = (profiles?.[0] as Profile | undefined) ?? null;

  return (
    <html lang="ko" className="h-full">
      <body
        className={`
          ${noto.className}
          ${noto.variable}
          bg-cream text-text-main antialiased min-h-screen
        `}
      >
        <AppShell profile={profile}>{children}</AppShell>
      </body>
    </html>
  );
}
