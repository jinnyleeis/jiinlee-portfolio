"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function signIn(formData: FormData) {
  const email = formData.get("email")?.toString() || "";
  const password = formData.get("password")?.toString() || "";
  if (!email || !password) {
    throw new Error("이메일과 비밀번호를 입력하세요.");
  }
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  revalidatePath("/admin");
  revalidatePath("/login");
}

export async function signOut() {
  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error(error);
    throw new Error(error.message);
  }
  revalidatePath("/admin");
  revalidatePath("/");
}
