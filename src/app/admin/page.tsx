import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Profile, Project } from "@/lib/types";
import { isAdmin, getSessionUser } from "@/lib/auth";
import { signOut } from "@/actions/authActions";

export default async function AdminPage() {
  const admin = await isAdmin();
  if (!admin) {
    const user = await getSessionUser();
    return (
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        <h1 className="heading-24_b mb-2">Admin</h1>
        {!user && (
          <>
            <p className="body-16_r">관리자만 접근 가능합니다. 먼저 로그인하세요.</p>
            <a href="/login" className="label-14_sb underline">/login 으로 이동</a>
          </>
        )}
        {user && (
          <>
            <p className="body-16_r">현재 로그인된 계정: <span className="font-mono">{user.email}</span></p>
            <p className="body-16_r">이메일이 관리자 이메일(<span className="font-mono">{process.env.NEXT_PUBLIC_ADMIN_EMAIL}</span>)과 다릅니다.</p>
            <form action={signOut}>
              <button className="mt-2 px-4 py-2 rounded-lg bg-neutral-800 text-white label-14_sb" type="submit">로그아웃</button>
            </form>
          </>
        )}
      </div>
    );
  }

  const supabase = await createServerSupabaseClient();
  const { data: profiles } = await supabase.from("profiles").select("*").limit(1);
  const profile = (profiles?.[0] as Profile | undefined) ?? null;

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("id", { ascending: true });

  const projectList = (projects as Project[] | null) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="heading-28_b">Admin Dashboard</h1>
        <form action={signOut}>
          <button className="px-3 py-1 rounded-lg bg-neutral-800 text-white label-14_sb" type="submit">로그아웃</button>
        </form>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <a href="/admin/profile" className="border border-border-soft rounded-xl p-4 bg-white/80 hover:bg-white transition flex flex-col gap-2">
          <h2 className="title-20_sb">Profile 관리</h2>
          <p className="body-14_r text-gray-600">개인 프로필 정보 및 소개/스킬 마크다운 수정</p>
        </a>
        <a href="/admin/projects" className="border border-border-soft rounded-xl p-4 bg-white/80 hover:bg-white transition flex flex-col gap-2">
          <h2 className="title-20_sb">Projects 관리</h2>
          <p className="body-14_r text-gray-600">프로젝트 생성 · 편집 · 순서 정렬</p>
        </a>
      </div>
    </div>
  );
}
