import { cookies } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getSessionUser() {
  const cookieStore = cookies();
  const supabase = await createServerSupabaseClient(cookieStore);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function isAdmin() {
  const user = await getSessionUser();
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  return !!user && user.email === adminEmail;
}
