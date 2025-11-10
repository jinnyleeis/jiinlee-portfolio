import { isAdmin } from "@/lib/auth";
import { AdminProfileForm } from "@/components/AdminProfileForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

export default async function AdminProfilePage() {
  const admin = await isAdmin();
  if (!admin) {
    return <div className="max-w-xl mx-auto px-4 py-10">권한 없음</div>;
  }
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase.from("profiles").select("*").limit(1);
  const profile = (data?.[0] as Profile | undefined) ?? null;
  return (
    <div className="w-full px-6 py-10 space-y-6">
      <h1 className="heading-24_b">Profile 관리</h1>
      <AdminProfileForm profile={profile} />
    </div>
  );
}
