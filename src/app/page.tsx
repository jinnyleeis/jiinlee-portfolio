import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/types";
import { ProjectCard } from "@/components/ProjectCard";
import ProfileResume from "@/components/ProfileResume";

async function getData() {
  const supabase = await createServerSupabaseClient();

  const { data: profiles } = await supabase.from("profiles").select("*").limit(1);
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
    <div className="mx-auto px-4 py-10">
      {/* 프로필 이력서 레이아웃 */}
      {profile && <ProfileResume profile={profile} />}

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
