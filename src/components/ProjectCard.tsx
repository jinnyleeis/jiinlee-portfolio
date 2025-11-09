import Link from "next/link";
import Image from "next/image";
import type { Project } from "@/lib/types";
import { getImageUrl } from "@/lib/supabase/storage";
import { ProjectMetaTags } from "./ProjectMetaTags";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group border border-border-soft rounded-2xl bg-white/70 hover:bg-white transition flex flex-col md:flex-row gap-4 p-4"
    >
      {project.cover_image_path && (
        <div className="relative w-full md:w-64 aspect-video rounded-xl overflow-hidden bg-[#FFF1C9]">
          <Image
            src={getImageUrl(project.cover_image_path)}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}

      <div className="flex-1 flex flex-col gap-3">
        <h2 className={`${project.title_typography || "heading-24_b"}`}>
          {project.title}
        </h2>
        {project.subtitle && (
          <p className={`${project.subtitle_typography || "title-16_sb"} text-gray-700`}>
            {project.subtitle}
          </p>
        )}
        {project.summary && (
          <p className="body-14_r text-gray-700 line-clamp-3">
            {project.summary}
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
      </div>
    </Link>
  );
}
