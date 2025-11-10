"use client";

import type { Profile } from "@/lib/types";
import { upsertProfile } from "@/actions/profileActions";
import SummaryMarkdownEditor from "./SummaryMarkdownEditor";

export function AdminProfileForm({ profile }: { profile: Profile | null }) {
  return (
    <form
      action={upsertProfile}
      className="space-y-3 border border-border-soft rounded-2xl p-4 bg-white/80"
    >
      <input type="hidden" name="id" defaultValue={profile?.id} />
      <h2 className="title-20_sb mb-2">Profile</h2>

      <label className="block space-y-1">
        <span className="label-14_sb">Full Name</span>
        <input
          name="full_name"
          defaultValue={profile?.full_name || ""}
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>
      <label className="block space-y-1">
        <span className="label-14_sb">Title</span>
        <input
          name="title"
          defaultValue={profile?.title || ""}
          className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="block space-y-1">
          <span className="label-14_sb">Birth</span>
          <input
            name="contact_birth"
            defaultValue={profile?.contact_birth || ""}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Phone</span>
          <input
            name="contact_phone"
            defaultValue={profile?.contact_phone || ""}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">Email</span>
          <input
            name="contact_email"
            defaultValue={profile?.contact_email || ""}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
        <label className="block space-y-1">
          <span className="label-14_sb">GitHub</span>
          <input
            name="contact_github"
            defaultValue={profile?.contact_github || ""}
            className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
          />
        </label>
      </div>

      <div className="space-y-1">
        <span className="label-14_sb">Summary (Markdown)</span>
        <SummaryMarkdownEditor name="summary" defaultValue={profile?.summary || ""} />
      </div>

      <div className="space-y-1">
        <span className="label-14_sb">Skills (Markdown)</span>
        <SummaryMarkdownEditor name="skills" defaultValue={profile?.skills || ""} placeholder="핵심 스킬을 Markdown으로 정리하세요." />
      </div>

      <button
        type="submit"
        className="mt-2 px-4 py-2 rounded-lg bg-accent-orange text-black label-14_sb"
      >
        저장
      </button>
    </form>
  );
}
