import { notFound } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { getImageUrl } from "@/lib/supabase/storage";
import Image from "next/image";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { ProjectMetaTags } from "@/components/ProjectMetaTags";

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

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-3">
        <h1 className={`${project.title_typography || "heading-32_b"}`}>
          {project.title}
        </h1>
        {project.subtitle && (
          <p className={`${project.subtitle_typography || "title-20_sb"} text-gray-700`}>
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
        <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden ">
          <Image
            src={getImageUrl(project.cover_image_path)}
            alt={project.title}
            fill
            className="object-contain object-center"
          />
        </div>
      )}

      {project.summary && (
        <section className="bg-white/80 rounded-2xl border border-border-soft p-4">
          <MarkdownRenderer value={project.summary} />
        </section>
      )}

      {project.body && (
        <section className="bg-white/90 rounded-2xl border border-border-soft p-5">
          <MarkdownRenderer value={project.body} />
        </section>
      )}
    </div>
  );
}
