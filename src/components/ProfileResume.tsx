"use client";

import type { Profile } from "@/lib/types";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import * as React from "react";

/**
 * 간단한 섹션 파서
 * - 입력 markdown에서 "## " 헤더를 기준으로 쪼개고,
 *   섹션명 키를 정규화하여 사전에 매핑함.
 */
function parseSections(md?: string | null) {
  const map: Record<string, string> = {};
  if (!md) return map;

  // 맨 앞에 헤더가 없어도 Summary로 처리할 수 있도록 prefix
  const src = md.trim().startsWith("## ") ? md : `## Summary\n\n${md ?? ""}`;
  const parts = src.split(/\n(?=##\s+)/g); // "## " 시작마다 분리

  for (const part of parts) {
    const m = part.match(/^##\s+([^\n]+)\n?([\s\S]*)$/);
    if (!m) continue;
    const rawKey = m[1].trim().toLowerCase();
    const body = (m[2] ?? "").trim();

    // 허용 섹션 키
    const key =
      rawKey.includes("summary") ? "summary" :
      rawKey.includes("experience") ? "experience" :
      rawKey.includes("education") ? "education" :
      rawKey.includes("strength") ? "strengths" :
      rawKey.includes("achievement") ? "achievements" :
      rawKey.includes("language") ? "languages" :
      rawKey;

    if (body) map[key] = body;
  }
  return map;
}

export default function ProfileResume({ profile }: { profile: Profile }) {
  // summary/skills 양쪽 모두에서 섹션 추출 (skills 쪽에 strengths, achievements, languages를 )
  const s1 = parseSections(profile.summary);
  const s2 = parseSections(profile.skills);

  const summary = s1.summary ?? "";
  const experience = s1.experience ?? "";
  const education = s1.education ?? "";
  const strengths = s2.strengths ?? s1.strengths ?? "";
  const achievements = s2.achievements ?? s1.achievements ?? "";
  const languages = s2.languages ?? s1.languages ?? "";

  return (
    // 그리드를 제거하고 프로젝트 카드와 동일한 "라인 전체" 폭을 사용하도록 단일 컬럼으로 재구성
    <section className="mb-10 w-full space-y-6">
      {/* 헤더를 카드 스타일로 */}
      <div className="border border-border-soft rounded-2xl bg-white/80 p-4 flex flex-col gap-2">
        <h1 className="heading-32_b leading-tight">
          {profile.full_name || "Your Name"}
        </h1>
        <p className="title-18_sb text-gray-700">
          {profile.title || "Your Title"}
        </p>
        <div className="mt-1 body-13_r text-gray-600 space-y-0.5">
          {profile.contact_phone && <div>📞 {profile.contact_phone}</div>}
          {profile.contact_email && <div>✉️ {profile.contact_email}</div>}
          {profile.contact_github && (
            <div>
              <a
                href={profile.contact_github}
                target="_blank"
                className="text-accent-blue underline"
              >
                {profile.contact_github}
              </a>
            </div>
          )}
          {profile.contact_birth && <div>🎂 {profile.contact_birth}</div>}
        </div>
      </div>

      {summary && (
        <div className="border border-border-soft rounded-2xl bg-white/80 p-4">
          <div className="title-20_sb mb-2">Summary</div>
          <MarkdownRenderer value={summary} />
        </div>
      )}
      {experience && (
        <div className="border border-border-soft rounded-2xl bg-white/80 p-4">
          <div className="title-20_sb mb-2">Experience</div>
          <MarkdownRenderer value={experience} />
        </div>
      )}
      {education && (
        <div className="border border-border-soft rounded-2xl bg-white/80 p-4">
          <div className="title-20_sb mb-2">Education</div>
          <MarkdownRenderer value={education} />
        </div>
      )}
      {strengths && (
        <div className="border border-border-soft rounded-2xl bg-[#E6F7F2] p-4">
          <div className="title-20_sb mb-2">Strengths</div>
          <MarkdownRenderer value={strengths} />
        </div>
      )}
      {achievements && (
        <div className="border border-border-soft rounded-2xl bg-[#F0F6FF] p-4">
          <div className="title-20_sb mb-2">Key Achievements</div>
          <MarkdownRenderer value={achievements} />
        </div>
      )}
      {languages && (
        <div className="border border-border-soft rounded-2xl bg-[#FFF1C9] p-4">
          <div className="title-20_sb mb-2">Languages</div>
          <MarkdownRenderer value={languages} />
        </div>
      )}
    </section>
  );
}

