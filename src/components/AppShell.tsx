"use client";

import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/types";
import { TocProvider, useToc } from "@/components/toc/TocContext";
import MarkdownRenderer from "./MarkdownRenderer";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";

type Props = {
  children: React.ReactNode;
  profile: Profile | null;
};

export function AppShell({ children, profile }: Props) {
  return (
    <TocProvider>
      <div className="min-h-screen flex flex-col bg-cream text-text-main">
        <Header />

        <main className="flex-1">
          <div className="max-w-9xl mx-auto px-4 py-10 flex gap-6">
            {/* 좌측 사이드바 영역 */}
            <div className="hidden lg:block w-72 shrink-0">
              <Sidebar profile={profile} />
            </div>

            {/* 우측 컨텐츠 */}
            <div className="flex-1 min-w-0 mx-28">{children}</div>
          </div>
        </main>

        <Footer />
      </div>
    </TocProvider>
  );
}

function Header() {
  return (
    <header className="border-b border-border-soft top-0 bg-cream/80 backdrop-blur z-20">
      <div className="max-w-9xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-accent-orange" />
          <a href="/" className="title-20_sb hover:cursor-pointer">Jiin’s 포트폴리오</a>
        </div>
        <nav className="flex gap-4 label-16_sb">
          <a href="/" className="hover:underline">
            Home
          </a>
          <a href="/admin" className="hover:underline">
            Admin
          </a>
        </nav>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border-soft mt-12">
      <div className="max-w-9xl mx-auto px-4 py-6 body-13_l text-gray-500">
        © {new Date().getFullYear()} Jiin Lee · Built with Next.js & Supabase
      </div>
    </footer>
  );
}

function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname();
  const { items, summary } = useToc();

  const [homeProjects, setHomeProjects] = useState<Project[]>([]);

  useEffect(() => {
    // 홈에서 프로젝트 목차 노출
    if (pathname === "/") {
      const supabase = createBrowserSupabaseClient();
      Promise.resolve(
        supabase
          .from("projects")
          .select("id, slug, title, sort_order")
          .order("sort_order", { ascending: true })
      )
        .then(({ data }) => setHomeProjects((data as Project[]) || []))
        .catch(() => setHomeProjects([]));
    }
  }, [pathname]);

  if (!pathname) return null;

  // Admin에서는 사이드바 숨김
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const isProjectDetail = /^\/projects\/.+/.test(pathname);

  // 프로젝트 상세 + TOC가 있을 때 => 목차 모드
  if (isProjectDetail && items.length > 0) {
    return (
      <nav className="sticky top-[20px] border border-border-soft rounded-2xl min-w-[320px] bg-white/80 px-4 py-4 text-md max-h-[calc(100vh-6rem)] overflow-y-auto flex flex-col">
        {summary && (
          <div className="mb-3">
            <div className="label-14_md text-gray-500 mb-1">요약</div>
            <div className="text-[12px] leading-relaxed text-gray-700 max-h-56 overflow-y-auto rounded-lg border border-border-soft bg-white/70 px-2 py-2 [&_.markdown-h1]:text-sm [&_.markdown-h1]:mb-2 [&_.markdown-h2]:text-xs [&_.markdown-h2]:mb-1 [&_.markdown-callout]:mb-2 [&_.markdown-callout]:py-1 [&_.markdown-callout]:px-2">
              <MarkdownRenderer value={summary} />
            </div>
            <div className="h-px bg-border-soft my-3" />
          </div>
        )}
        <div className="label-14_md text-gray-500 mb-2 flex items-center gap-1">
          <span>목차</span>
        </div>
        <ul className="space-y-1 pb-2">
          {items.map((item) => (
            <li key={item.id} className={item.level === 2 ? "ml-4 text-gray-600" : ""}>
              <a href={`#${item.id}`} className="hover:underline text-gray-500 block">
                {item.text}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    );
  }

  // 홈: 프로젝트 목차 + 프로필 카드
  if (pathname === "/") {
    return (
      <aside className="sticky top-24 border border-border-soft rounded-2xl bg-white/80 px-3 py-3 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto">
        {/* 프로젝트 목차 */}
        <div>
          <div className="label-14_md text-gray-500 mb-1">프로젝트 목차</div>
          <ul className="space-y-1">
            {homeProjects.map((p, i) => (
              <li key={p.id} className="flex items-start gap-1">
                <span className="text-gray-500 select-none w-4 text-right body-13_r">{i + 1}.</span>
                <a
                  href={`/projects/${p.slug}`}
                  className="body-13_r text-gray-700 hover:underline flex-1"
                  aria-label={`${i + 1}번 프로젝트 ${p.title}`}
                >
                  {p.title}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-px bg-border-soft" />

        {/* 간략 프로필 카드 */}
        {profile && (
          <div className="space-y-2">
            <div className="title-16_sb">{profile.full_name || "Profile"}</div>
            {profile.title && <div className="body-13_r text-gray-600">{profile.title}</div>}
            <div className="h-px bg-border-soft" />
            <div className="space-y-1 body-13_r text-gray-600">
              {profile.contact_email && <div>{profile.contact_email}</div>}
              {profile.contact_phone && <div>{profile.contact_phone}</div>}
              {profile.contact_github && (
                <div>
                  <a href={profile.contact_github} target="_blank" className="text-accent-blue underline">
                    GitHub
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </aside>
    );
  }

  // 그 외 페이지: 기존 간략 프로필 카드
  if (!profile) return null;
  return (
    <aside className="sticky top-24 border border-border-soft rounded-2xl bg-white/80 px-3 py-3 space-y-2 max-h-[calc(100vh-6rem)] overflow-y-auto">
      <div>
        <div className="title-16_sb">{profile.full_name || "Profile"}</div>
        {profile.title && <div className="body-13_r text-gray-600">{profile.title}</div>}
      </div>
      <div className="h-px bg-border-soft" />
      <div className="space-y-1 body-13_r text-gray-600">
        {profile.contact_birth && <div>{profile.contact_birth}</div>}
        {profile.contact_phone && <div>{profile.contact_phone}</div>}
        {profile.contact_email && <div>{profile.contact_email}</div>}
        {profile.contact_github && (
          <div>
            <a href={profile.contact_github} target="_blank" className="text-accent-blue underline">
              GitHub
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
