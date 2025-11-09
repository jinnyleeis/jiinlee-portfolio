import { signIn } from "@/actions/authActions";
import { getSessionUser } from "@/lib/auth";
import { signOut } from "@/actions/authActions";

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 space-y-6">
        <h1 className="title-20_sb mb-2">Logged In</h1>
        <p className="body-16_r">{user.email} 계정으로 로그인되어 있습니다.</p>
        <form action={signOut}>
          <button
            type="submit"
            className="mt-2 px-4 py-2 rounded-lg bg-neutral-800 text-white label-14_sb"
          >
            로그아웃
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto px-4 py-10 space-y-6">
      <h1 className="title-20_sb mb-2">Login</h1>
      <form action={signIn} className="space-y-4 border border-border-soft rounded-xl p-4 bg-white/80">
        <label className="block space-y-1">
          <span className="label-14_sb">Email</span>
          <input
            name="email"
            type="email"
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Password</span>
          <input
            name="password"
            type="password"
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
            required
          />
        </label>
        <button
          type="submit"
          className="mt-2 px-4 py-2 rounded-lg bg-accent-orange text-black label-14_sb"
        >
          로그인
        </button>
      </form>
      <p className="body-13_l text-gray-500">Supabase Dashboard에서 해당 이메일 사용자 생성 / 비밀번호 설정이 필요합니다.</p>
    </div>
  );
}
