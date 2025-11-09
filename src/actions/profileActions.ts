"use server";

import { revalidatePath } from "next/cache";
import { createServerSupabaseAdminClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

export async function upsertProfile(formData: FormData) {
  const supabase = await createServerSupabaseAdminClient();

  const payload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: formData.get("id")?.toString() || undefined,
    full_name: formData.get("full_name")?.toString() || null,
    title: formData.get("title")?.toString() || null,
    summary: formData.get("summary")?.toString() || null,
    contact_birth: formData.get("contact_birth")?.toString() || null,
    contact_phone: formData.get("contact_phone")?.toString() || null,
    contact_email: formData.get("contact_email")?.toString() || null,
    contact_github: formData.get("contact_github")?.toString() || null,
    skills: formData.get("skills")?.toString() || null,
  };

  const { error } = await supabase.from("profiles").upsert(payload, {
    onConflict: "id",
  });

  if (error) {
    console.error(error);
    throw error;
  }

  revalidatePath("/");
  revalidatePath("/admin");
}
