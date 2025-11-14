export const runtime = 'edge';

import { isAdmin } from "@/lib/auth";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";
import { AdminProjectForm } from "@/components/AdminProjectForm";
import { notFound } from "next/navigation";

interface Props { params: { id: string }; }

export default async function EditProjectPage({ params }: Props) {
  const admin = await isAdmin();
  if (!admin) return <div className="max-w-xl mx-auto px-4 py-10">권한 없음</div>;

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    console.error(error);
  }
  if (!data) return notFound();

  const project = data as Project;

  return (
    <div className="w-full px-6 py-10 space-y-6">
      <h1 className="heading-24_b">프로젝트 편집</h1>
      <AdminProjectForm project={project} />
    </div>
  );
}
