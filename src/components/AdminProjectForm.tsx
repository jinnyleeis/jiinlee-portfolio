"use client";

import type { Project } from "@/lib/types";
import { createOrUpdateProject, deleteProjectAction } from "@/actions/projectActions";
import { ProjectMarkdownEditor } from "./ProjectMarkdownEditor";

const TYPO_OPTIONS = [
  "heading-32_b",
  "heading-28_b",
  "heading-24_b",
  "title-24_sb",
  "title-20_sb",
];

export function AdminProjectForm({ project }: { project?: Project }) {
  return (
    <form
      action={createOrUpdateProject}
      className="space-y-3 border border-border-soft rounded-2xl p-4 bg-white/80"
    >
      <input type="hidden" name="id" defaultValue={project?.id} />
          {project && (
            <input type="hidden" name="original_slug" defaultValue={project.slug} />
          )}
      <h2 className="title-18_sb mb-2">
        {project ? `Edit: ${project.title}` : "New Project"}
      </h2>

      <label className="block space-y-1">
        <span className="label-14_sb">Slug</span>
        <input
          name="slug"
          required
          defaultValue={project?.slug || ""}
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-14_sb">Title</span>
        <input
          name="title"
          required
          defaultValue={project?.title || ""}
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-14_sb">Subtitle</span>
        <input
          name="subtitle"
          defaultValue={project?.subtitle || ""}
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-14_sb">Period</span>
        <input
          name="period"
          defaultValue={project?.period || ""}
          placeholder="2025.07 – 2025.09"
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <label className="block space-y-1">
          <span className="label-14_sb">Title Typography</span>
          <select
            name="title_typography"
            defaultValue={project?.title_typography || "heading-32_b"}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          >
            {TYPO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Subtitle Typography</span>
          <select
            name="subtitle_typography"
            defaultValue={project?.subtitle_typography || "title-20_sb"}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          >
            {TYPO_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Body Typography</span>
          <select
            name="body_typography"
            defaultValue={project?.body_typography || "body-16_r"}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          >
            <option value="body-16_r">body-16_r</option>
            <option value="body-14_r">body-14_r</option>
          </select>
        </label>
      </div>

      {/* 태그: 콤마로 입력 후 서버에서 split */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="label-14_sb">Type Tags (comma)</span>
          <input
            name="type_tags"
            defaultValue={project?.type_tags?.join(", ") || ""}
            placeholder="Data Engineering, Workflow Orchestration, Data Reliability"
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Tech Stack Tags (comma)</span>
          <input
            name="tech_stack_tags"
            defaultValue={project?.tech_stack_tags?.join(", ") || ""}
            placeholder="Python, Streamlit, BigQuery, GCS, Pandas"
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Theme Tags (comma)</span>
          <input
            name="theme_tags"
            defaultValue={project?.theme_tags?.join(", ") || ""}
            placeholder="Reliability, Automation, Reproducibility"
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Role Tags (comma)</span>
          <input
            name="role_tags"
            defaultValue={project?.role_tags?.join(", ") || ""}
            placeholder="Data Engineer, Workflow Architect"
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
      </div>

      <label className="block space-y-1">
        <span className="label-14_sb">Impact</span>
        <input
          name="impact"
          defaultValue={project?.impact || ""}
          placeholder="Processing time ↓75%, Consistency ↑100%, Dirty Data 0건"
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-14_sb">Keywords (comma)</span>
        <input
          name="keywords"
          defaultValue={project?.keywords?.join(", ") || ""}
          placeholder="DAG, On-demand Batch, Append-only, Parquet, Session State"
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <label className="block space-y-1">
        <span className="label-14_sb">Summary (Markdown)</span>
        <textarea
          name="summary"
          rows={4}
          defaultValue={project?.summary || ""}
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

    <div className="space-y-1">
  <span className="label-14_sb">Body (Markdown, code blocks)</span>
  <ProjectMarkdownEditor
    defaultIntro={project?.body_intro || ""}
    defaultMain={project?.body_main || project?.body || ""}  // 기존 body는 본문으로
    defaultOutro={project?.body_outro || ""}
  />
  <p className="body-13_l text-gray-500 mt-1">
    ```sql, ```python 등 코드블록 문법 그대로 사용하면 상세 페이지에서 하이라이트됩니다.
  </p>
</div>


      {/* 이미지 업로드 */}
      <input
        type="hidden"
        name="cover_image_path"
        defaultValue={project?.cover_image_path || ""}
      />
      <label className="block space-y-1">
        <span className="label-14_sb">Cover Image (Supabase Storage)</span>
        <input
          type="file"
          name="cover_image"
          accept="image/*"
          className="block w-full text-sm"
        />
      </label>

      <div className="flex gap-2">
        <button
          type="submit"
          className="mt-2 px-4 py-2 rounded-lg bg-accent-orange text-black label-14_sb"
        >
          {project ? "Update" : "Create"}
        </button>

        {project && (
          <button
            formAction={deleteProjectAction}
            className="mt-2 px-4 py-2 rounded-lg bg-red-500 text-white label-14_sb"
          >
            Delete
          </button>
        )}
      </div>
    </form>
  );
}
