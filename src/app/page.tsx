import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";
import MarkdownRenderer from "@/components/MarkdownRenderer";

async function getData() {
  const supabase = await createServerSupabaseClient();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  const profile = (profiles?.[0] as Profile | undefined) ?? null;

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });

  return {
    profile,
    projects: (projects as Project[] | null) ?? [],
  };
}

export default async function HomePage() {
  const { profile, projects } = await getData();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* 상단 소개 */}
      <section className="mb-10">
        {profile && (
          <>
            <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
              <div>
                <h1 className="heading-32_b mb-1">
                  {profile.full_name || "Jiin Lee"}
                </h1>
                <p className="title-18_sb text-gray-700">
                  {profile.title || "Profile Title Placeholder"}
                </p>
              </div>
              <div className="body-13_r text-right text-gray-600 space-y-1">
                <div>{profile.contact_birth}</div>
                <div>{profile.contact_phone}</div>
                <div>{profile.contact_email}</div>
                <div>
                  <a
                    href={profile.contact_github || "https://github.com/jinnyleeis"}
                    target="_blank"
                    className="text-accent-blue underline"
                  >
                    {profile.contact_github || "github.com/jinnyleeis"}
                  </a>
                </div>
              </div>
            </div>

            {profile.summary && (
              <div className="bg-white/80 rounded-2xl border border-border-soft p-4 mb-6">
                <MarkdownRenderer value={profile.summary} />
              </div>
            )}

            {profile.skills && (
              <div className="bg-[#FFF1C9]/70 rounded-2xl border border-border-soft p-4 mb-10">
                <h2 className="title-20_sb mb-2">Skills & Experiences</h2>
                <MarkdownRenderer value={profile.skills} />
              </div>
            )}
          </>
        )}
      </section>

      {/* 프로젝트 리스트 */}
      <section className="space-y-4">
        <h2 className="heading-24_b mb-2">Projects</h2>
        <div className="space-y-4">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
