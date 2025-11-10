"use client";

import React, { useState, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { uploadFile } from "@/actions/storageActions";
import { getImageUrl } from "@/lib/supabase/storage";

const CALLOUT_PRESETS = [
  { id: "problem", label: "⚠️ Problem", snippet: `> ⚠️ **Problem**  \n> 문제 상황 요약` },
  { id: "design", label: "🧩 Design", snippet: `> 🧩 **Design**  \n> 설계 핵심 요약` },
  { id: "result", label: "✅ Result", snippet: `> ✅ **Result**  \n> 성과 지표 요약` },
  { id: "reflection", label: "🧠 Reflection", snippet: `> 🧠 **Reflection**  \n> 회고 한 줄` },
];

const EMOJI_OPTIONS = ["⚠️","🧩","✅","🧠","💡","📌","📊"];

interface Props {
  name?: string;
  defaultValue?: string;
  placeholder?: string;
}

export function SummaryMarkdownEditor({ name = "summary", defaultValue = "", placeholder }: Props) {
  const [value, setValue] = useState(defaultValue);
  const [selectedEmoji, setSelectedEmoji] = useState("💡");
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  function insert(snippet: string) {
    if (!textareaRef.current) return;
    const ta = textareaRef.current;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const after = value.slice(end);
    const next = before + (before ? "\n\n" : "") + snippet + (after ? "\n\n" : "");
    setValue(next + after);
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + snippet.length + 2;
    });
  }

  function handleInsertEmoji() {
    insert(selectedEmoji + " ");
  }

  function triggerImagePicker() {
    fileInputRef.current?.click();
  }

  async function handleSelectImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    try {
      const fd = new FormData();
      files.forEach((f, i) => fd.append(`file${i}`, f));
      const results: any[] = await uploadFile(fd);
      const paths: string[] = results.map((r: any) => (r?.path ? r.path : r?.data?.path)).filter(Boolean);
      if (!paths.length) return;
      const md = paths.map((p) => `![summary-image](${getImageUrl(p)})`).join("\n\n");
      insert(md);
    } catch (err) {
      console.error(err);
      alert("이미지 업로드 실패. 다시 시도해주세요.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 items-center border border-border-soft rounded-xl bg-white/80 px-3 py-2">
        <span className="label-12_sb text-gray-500 mr-1">Summary</span>
        {CALLOUT_PRESETS.map((c) => (
          <button key={c.id} type="button" onClick={() => insert(c.snippet)} className="px-2 py-1 rounded-lg bg-[#FFF9EB] hover:bg-[#FFE9B5] text-xs">
            {c.label}
          </button>
        ))}
        <button type="button" onClick={handleInsertEmoji} className="px-2 py-1 rounded-lg bg-[#FFF1C9] hover:bg-[#FFE3A1] text-xs">Emoji</button>
        <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleSelectImages} className="hidden" />
        <button type="button" onClick={triggerImagePicker} className="px-2 py-1 rounded-lg bg-[#E6F0FF] hover:bg-[#d6e7ff] text-xs">🖼️ Image</button>
        <select value={selectedEmoji} onChange={(e) => setSelectedEmoji(e.target.value)} className="border border-border-soft rounded-lg px-1 py-0.5 text-xs bg-cream ml-auto">
          {EMOJI_OPTIONS.map((e) => <option key={e}>{e}</option>)}
        </select>
        <button type="button" onClick={() => setShowPreview(p => !p)} className="px-2 py-1 rounded-lg bg-[#E7F8E5] hover:bg-[#d1f2d0] text-xs">
          {showPreview ? "Hide Preview" : "Show Preview"}
        </button>
      </div>
      <textarea
        ref={textareaRef}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
        className="w-full border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
        placeholder={placeholder || "프로젝트 요약을 Markdown으로 작성하세요."}
      />
      {showPreview && (
        <div className="border border-border-soft rounded-xl p-3 bg-white/90 body-13_r max-h-64 overflow-y-auto [&_.markdown-h1]:text-base [&_.markdown-h1]:mt-2 [&_.markdown-h2]:text-sm">
          <MarkdownRenderer value={value || "_(요약 미리보기 없음)_"} />
        </div>
      )}
    </div>
  );
}

export default SummaryMarkdownEditor;
