import { getSessionUser } from "@/lib/auth";

export default async function DebugSessionPage() {
  const user = await getSessionUser();
  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="title-20_sb mb-4">Debug Session</h1>
      <pre className="bg-neutral-100 rounded-xl p-4 text-sm overflow-x-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
      <p className="body-13_l text-gray-500 mt-4">세션이 null이면 아직 로그인되지 않은 상태입니다.</p>
    </div>
  );
}
