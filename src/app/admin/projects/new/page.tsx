import { isAdmin } from "@/lib/auth";
import { AdminProjectForm } from "@/components/AdminProjectForm";

export default async function NewProjectPage() {
  const admin = await isAdmin();
  if (!admin) return <div className="max-w-xl mx-auto px-4 py-10">권한 없음</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="heading-24_b mb-6">새 프로젝트</h1>
      <AdminProjectForm />
    </div>
  );
}
