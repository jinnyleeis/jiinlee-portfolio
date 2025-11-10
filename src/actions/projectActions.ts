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
    console.error("createOrUpdateProject error", error);
    throw new Error(error.message || "Project upsert failed");
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

    // 섹션별 본문
  const body_intro = formData.get("body_intro")?.toString() || "";
  const body_main  = formData.get("body_main")?.toString() || "";
  const body_outro = formData.get("body_outro")?.toString() || "";

   // 기존 body는 섹션들을 합쳐서 저장 
  const bodySections = [body_intro, body_main, body_outro]
    .map((s) => s.trim())
    .filter(Boolean);
  const body = bodySections.join("\n\n---\n\n");

  const id = formData.get("id")?.toString() || undefined;
  const original_slug = formData.get("original_slug")?.toString() || null;
  const slug = formData.get("slug")?.toString() || "";
  const title = formData.get("title")?.toString() || "";
  const subtitle = formData.get("subtitle")?.toString() || null;
  const period = formData.get("period")?.toString() || null;
  const summary = formData.get("summary")?.toString() || null;
  // const body = formData.get("body")?.toString() || null;
  const impact = formData.get("impact")?.toString() || null;
  const link = formData.get("link")?.toString() || null;

  const type_tags = parseMultiSelect(formData.get("type_tags"));
  const tech_stack_tags = parseMultiSelect(formData.get("tech_stack_tags"));
  const theme_tags = parseMultiSelect(formData.get("theme_tags"));
  const role_tags = parseMultiSelect(formData.get("role_tags"));
  const keywords = parseMultiSelect(formData.get("keywords"));

  const title_typography = formData.get("title_typography")?.toString() || "heading-32_b";
  const subtitle_typography = formData.get("subtitle_typography")?.toString() || "title-20_sb";
  const body_typography = formData.get("body_typography")?.toString() || "body-16_r";

  const sort_order_raw = formData.get("sort_order")?.toString() || null;
  const sort_order = sort_order_raw ? Number(sort_order_raw) : null;

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
    body_intro,
    body_main,
    body_outro,
    impact,
    type_tags,
    tech_stack_tags,
    theme_tags,
    role_tags,
    keywords,
  link,
    title_typography,
    subtitle_typography,
    body_typography,
    cover_image_path,
    sort_order,
  };

  // update vs insert: id가 있으면 id로 update, 없으면 insert
  async function doWrite(data: typeof payload) {
    if (id) {
      return supabase.from("projects").update(data).eq("id", id);
    }
    return supabase.from("projects").insert(data);
  }

  let { error } = await doWrite(payload);

  if (error) {
    console.error("createOrUpdateProject error", error);
    const msg = (error && (error.message || error.details || error.hint)) || "Project save failed";
    const code = error && error.code ? ` [${error.code}]` : "";
    throw new Error(`${msg}${code}`);
  }

  revalidatePath("/");
  if (original_slug && original_slug !== slug) {
    revalidatePath("/projects/" + original_slug);
  }
  revalidatePath("/projects/" + slug);
  revalidatePath("/admin");
}

export async function deleteProject(id: string) {
  const supabase = await createServerSupabaseAdminClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);

  if (error) {
    console.error("deleteProject error", error);
    const msg = (error && (error.message || error.details || error.hint)) || "Project delete failed";
    const code = error && error.code ? ` [${error.code}]` : "";
    throw new Error(`${msg}${code}`);
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

// 다중 프로젝트 정렬 업데이트 액션
export async function updateProjectOrder(formData: FormData) {
  const supabase = await createServerSupabaseAdminClient();
  const entriesRaw = formData.getAll("order_item"); // JSON 문자열 배열 기대
  const updates: { id: string; sort_order: number }[] = [];
  for (const raw of entriesRaw) {
    try {
      const parsed = JSON.parse(raw.toString());
      if (parsed && parsed.id && typeof parsed.sort_order === "number") {
        updates.push({ id: parsed.id, sort_order: parsed.sort_order });
      }
    } catch (e) {
      console.error("updateProjectOrder parse error", e);
    }
  }
  if (updates.length === 0) return;
  // upsert는 고유 제약이 없으면 insert가 발생해 NOT NULL 에러 유발 가능
  // 안전하게 id별 개별 update로 처리
  const results = await Promise.all(
    updates.map((u) =>
      supabase
        .from("projects")
        .update({ sort_order: u.sort_order })
        .eq("id", u.id)
    )
  );
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) {
   
    console.error("updateProjectOrder error", firstErr);
    const msg = (firstErr && (firstErr.message || firstErr.details || firstErr.hint)) || "Order update failed";
    const code = firstErr && firstErr.code ? ` [${firstErr.code}]` : "";
    throw new Error(`${msg}${code}`);
  }
  revalidatePath("/");
  revalidatePath("/admin/projects");
}
