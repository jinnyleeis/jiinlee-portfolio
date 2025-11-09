"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

export async function uploadProjectImage(file: File | null) {
  if (!file) return null;

  const supabase = await createServerSupabaseAdminClient();
  const ext = file.name.split(".").pop();
  const path = `projects/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(process.env.NEXT_PUBLIC_STORAGE_BUCKET!)
    .upload(path, file, { upsert: true });

  if (error) {
    console.error(error);
    throw error;
  }

  // DB에는 path만 저장, UI에서 getImageUrl로 URL 생성
  return path;
}

function parseMultiSelect(value: FormDataEntryValue | null) {
  if (!value) return null;
  const raw = value.toString().trim();
  if (!raw) return null;
  return raw.split(",").map((v) => v.trim()).filter(Boolean);
}

export async function createOrUpdateProject(formData: FormData) {
  const supabase = await createServerSupabaseAdminClient();

  const id = formData.get("id")?.toString() || undefined;
  const slug = formData.get("slug")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const subtitle = formData.get("subtitle")?.toString() || null;
  const period = formData.get("period")?.toString() || null;
  const summary = formData.get("summary")?.toString() || null;
  const body = formData.get("body")?.toString() || null;
  const impact = formData.get("impact")?.toString() || null;

  const type_tags = parseMultiSelect(formData.get("type_tags"));
  const tech_stack_tags = parseMultiSelect(formData.get("tech_stack_tags"));
  const theme_tags = parseMultiSelect(formData.get("theme_tags"));
  const role_tags = parseMultiSelect(formData.get("role_tags"));
  const keywords = parseMultiSelect(formData.get("keywords"));

  const title_typography = formData.get("title_typography")?.toString() || "heading-32_b";
  const subtitle_typography = formData.get("subtitle_typography")?.toString() || "title-20_sb";
  const body_typography = formData.get("body_typography")?.toString() || "body-16_r";

  const file = formData.get("cover_image") as File | null;
  let cover_image_path = formData.get("cover_image_path")?.toString() || null;

  if (file && file.size > 0) {
    cover_image_path = await uploadProjectImage(file);
  }

  const payload: Database["public"]["Tables"]["projects"]["Insert"] = {
    id,
    slug,
    title,
    subtitle,
    period,
    summary,
    body,
    impact,
    type_tags,
    tech_stack_tags,
    theme_tags,
    role_tags,
    keywords,
    title_typography,
    subtitle_typography,
    body_typography,
    cover_image_path,
  };

  const { error } = await supabase.from("projects").upsert(payload, {
    onConflict: "slug",
  });

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/projects/" + slug);
  revalidatePath("/admin");
}

export async function deleteProject(id: string) {
  const supabase = await createServerSupabaseAdminClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

// Form에서 바로 사용할 수 있는 서버 액션 래퍼
export async function deleteProjectAction(formData: FormData) {
  const id = formData.get("id")?.toString();
  if (!id) return;
  await deleteProject(id);
}
