export const runtime = 'edge';

import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { getImageUrl } from "@/lib/supabase/storage";
import { ProjectMetaTags } from "@/components/ProjectMetaTags";
import { ProjectBodyWithToc } from "@/components/ProjectBodyWithToc";
import { CoverZoom } from "@/components/CoverZoom";

type Props = {
  params: { slug: string };
};

export default async function ProjectDetailPage({ params }: Props) {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", decodeURIComponent(params.slug))
    .single();

  if (error || !data) return notFound();

  const project = data as Project;

  // body_intro/body_main/body_outro를 이미 쓰고 있다면 여기서 합치고,
  // 아니면 그냥 project.body만 사용해도 OK
  const fullBody =
    (project as any).body_intro || (project as any).body_main || (project as any).body_outro
      ? [ (project as any).body_intro, (project as any).body_main, (project as any).body_outro ]
          .map((s: string | null) => (s || "").trim())
          .filter(Boolean)
          .join("\n\n---\n\n")
      : project.body || "";

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <h1 className={`${project.title_typography || "heading-32_b"}`}>
          {project.title}
        </h1>
        {project.subtitle && (
          <p
            className={`${
              project.subtitle_typography || "title-20_sb"
            } text-gray-700`}
          >
            {project.subtitle}
          </p>
        )}
        <ProjectMetaTags
          type_tags={project.type_tags}
          tech_stack_tags={project.tech_stack_tags}
          theme_tags={project.theme_tags}
          period={project.period}
          role_tags={project.role_tags}
          impact={project.impact}
        />
      </header>

      {project.cover_image_path && (
        <CoverZoom src={getImageUrl(project.cover_image_path)} alt={project.title} />
      )}


      {fullBody && (
        <section className="bg-white/90 rounded-2xl border border-border-soft p-5">
          <ProjectBodyWithToc markdown={fullBody} summary={project.summary} />
        </section>
      )}
    </div>
  );
}
