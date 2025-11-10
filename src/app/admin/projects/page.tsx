import Link from "next/link";
import { isAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import ProjectOrderEditor from "@/components/ProjectOrderEditor";

export default async function AdminProjectsPage() {
  const admin = await isAdmin();
  if (!admin) return <div className="max-w-xl mx-auto px-4 py-10">권한 없음</div>;

  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true, nullsFirst: false })
    .order("id", { ascending: true });
  const projects = (data as Project[] | null) ?? [];
  //console.log(projects);

  return (
    <div className="w-full px-6 py-10 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="heading-24_b">Projects 관리</h1>
        <Link
          href="/admin/projects/new"
          className="px-3 py-2 rounded-lg bg-accent-orange text-black label-14_sb"
        >
          새 프로젝트 만들기
        </Link>
      </div>

      <ProjectOrderEditor
        items={projects.map((p) => ({
          id: p.id,
          title: p.title,
            slug: p.slug,
            sort_order: p.sort_order,
        }))}
      />
    </div>
  );
}
