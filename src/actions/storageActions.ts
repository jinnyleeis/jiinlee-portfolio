"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";

function handleError(error: any) {
  if (error) {
    console.error(error);
    throw error;
  }
}

export async function uploadFile(formData: FormData) {
  const supabase = await createServerSupabaseClient();

  const files = Array.from(formData.values()).map((f) => f as File);

  const bucket = process.env.NEXT_PUBLIC_STORAGE_BUCKET!;

  const results = await Promise.all(
    files.map(async (file) => {
      const ext = file.name.split(".").pop() || "bin";
      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const path = `uploads/${Date.now()}-${Math.random()
        .toString(36)
        .slice(2, 8)}-${safeName}`;
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type || undefined });
      handleError(error);
      return { path: data?.path || path };
    })
  );

  return results; // [{ path }]
}
