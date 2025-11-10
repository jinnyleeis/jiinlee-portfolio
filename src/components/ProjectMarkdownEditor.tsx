"use client";

import { useState, useMemo, useRef } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { uploadFile } from "@/actions/storageActions";
import { getImageUrl } from "@/lib/supabase/storage";

const CALLOUT_PRESETS = [
  {
    id: "problem",
    label: "⚠️ Problem",
    snippet: `> ⚠️ **Problem**  
> Excel 병합에 4시간 소요, Dirty Data 다수 발생`,
  },
  {
    id: "design",
    label: "🧩 Design",
    snippet: `> 🧩 **Design**  
> 데이터·UI·오케스트레이션 레이어 분리`,
  },
  {
    id: "impl",
    label: "⚙️ Implementation",
    snippet: `> ⚙️ **Implementation**  
> Streamlit session_state로 DAG 구현`,
  },
  {
    id: "result",
    label: "✅ Result",
    snippet: `> ✅ **Result**  
> 처리시간 75% 단축, Dirty Data 0건`,
  },
  {
    id: "reflection",
    label: "🧠 Reflection",
    snippet: `> 🧠 **Reflection**  
> 데이터 신뢰성은 재현 가능한 구조에서 나온다.`,
  },
];

const EMOJI_OPTIONS = [
  "⚠️",
  "🧩",
  "⚙️",
  "✅",
  "🧠",
  "💡",
  "📊",
  "📌",
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

type Props = {
  defaultIntro?: string;
  defaultMain?: string;
  defaultOutro?: string;
};

export function ProjectMarkdownEditor({
  defaultIntro = "",
  defaultMain = "",
  defaultOutro = "",
}: Props) {
  const [intro, setIntro] = useState(defaultIntro);
  const [main, setMain] = useState(defaultMain);
  const [outro, setOutro] = useState(defaultOutro);
  const [activeTab, setActiveTab] = useState<"intro" | "main" | "outro">("intro");
  const activeRef = useRef<HTMLTextAreaElement | null>(null);
  const [selectedEmoji, setSelectedEmoji] = useState("💡");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const combined = useMemo(
    () =>
      [intro, main, outro]
        .map((s) => s.trim())
        .filter(Boolean)
        .join("\n\n---\n\n"),
    [intro, main, outro]
  );

  const toc = useMemo(() => {
    const lines = combined.split(/\r?\n/);
    const items: { level: 1 | 2; text: string; id: string }[] = [];
    for (const line of lines) {
      const m = /^(#{1,2})\s+(.*)$/.exec(line);
      if (!m) continue;
      const level = m[1].length as 1 | 2;
      const text = m[2].trim();
      items.push({ level, text, id: slugify(text) });
    }
    return items;
  }, [combined]);

  function handleInsertSnippet(snippet: string) {
    if (!activeRef.current) return;
    const ta = activeRef.current;
    const value =
      activeTab === "intro" ? intro : activeTab === "main" ? main : outro;

    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;

    const next =
      value.slice(0, start) + (start ? "\n\n" : "") + snippet + "\n\n" + value.slice(end);

    if (activeTab === "intro") setIntro(next);
    else if (activeTab === "main") setMain(next);
    else setOutro(next);

    // selection은 대충 맨 끝으로
    requestAnimationFrame(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + snippet.length + 2;
    });
  }

  function handleInsertTable() {
    const snippet = `| 구분 | 내용 |\n| --- | --- |\n| 항목1 | 설명 |\n| 항목2 | 설명 |\n`;
    handleInsertSnippet(snippet);
  }

  function handleInsertEmoji() {
    handleInsertSnippet(selectedEmoji + " ");
  }

  async function handleSelectImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    try {
      const fd = new FormData();
      files.forEach((f, idx) => fd.append(`file${idx}`, f));
      const results: any[] = await uploadFile(fd);
      const paths: string[] = results
        .map((r: any) => (r?.path ? r.path : r?.data?.path))
        .filter(Boolean);
      if (paths.length === 0) return;

      const snippets = paths
        .map((p) => `![image](${getImageUrl(p)})`)
        .join("\n\n");
      handleInsertSnippet(snippets);
    } catch (err) {
      console.error(err);
      alert("이미지 업로드에 실패했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function triggerImagePicker() {
    fileInputRef.current?.click();
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* 좌측: 편집 + TOC */}
      <div className="space-y-3">
        {/* 탭 */}
        <div className="inline-flex rounded-xl bg-cream border border-border-soft p-1 text-xs">
          {[
            { id: "intro", label: "본문 - 서론" },
            { id: "main", label: "본문 - 본문" },
            { id: "outro", label: "본문 - 결론" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1 rounded-lg ${
                activeTab === tab.id ? "bg-white shadow-sm" : "text-gray-500"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 툴바 */}
        <div className="flex flex-wrap gap-2 items-center border border-border-soft rounded-xl bg-white/80 px-3 py-2">
          <span className="label-12_sb text-gray-500 mr-1">Blocks</span>
          {CALLOUT_PRESETS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleInsertSnippet(c.snippet)}
              className="px-2 py-1 rounded-lg bg-[#FFF9EB] hover:bg-[#FFE9B5] text-xs"
            >
              {c.label}
            </button>
          ))}
          <button
            type="button"
            onClick={handleInsertTable}
            className="px-2 py-1 rounded-lg bg-[#E7F8E5] hover:bg-[#d1f2d0] text-xs"
          >
            📊 Table
          </button>

          {/* 이미지 업로드 */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleSelectImages}
            className="hidden"
          />
          <button
            type="button"
            onClick={triggerImagePicker}
            className="px-2 py-1 rounded-lg bg-[#E6F0FF] hover:bg-[#d6e7ff] text-xs"
          >
            🖼️ Image
          </button>

          {/* 이모티콘 선택 */}
          <div className="flex items-center gap-1 ml-auto">
            <select
              value={selectedEmoji}
              onChange={(e) => setSelectedEmoji(e.target.value)}
              className="border border-border-soft rounded-lg px-1 py-0.5 text-xs bg-cream"
            >
              {EMOJI_OPTIONS.map((e) => (
                <option key={e} value={e}>
                  {e}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={handleInsertEmoji}
              className="px-2 py-1 rounded-lg bg-[#FFF1C9] hover:bg-[#FFE3A1] text-xs"
            >
              Insert Emoji
            </button>
          </div>
        </div>

        {/* 실제 textarea 3개 + 숨겨진 form 필드 */}
        {["intro", "main", "outro"].map((id) => {
          const visible = activeTab === id;
          const value =
            id === "intro" ? intro : id === "main" ? main : outro;
          const onChange =
            id === "intro"
              ? (e: any) => setIntro(e.target.value)
              : id === "main"
              ? (e: any) => setMain(e.target.value)
              : (e: any) => setOutro(e.target.value);

          const name =
            id === "intro" ? "body_intro" : id === "main" ? "body_main" : "body_outro";

          return (
            <div key={id} className={visible ? "block" : "hidden"}>
              <textarea
                ref={visible ? activeRef : undefined}
                name={name}
                value={value}
                onChange={onChange}
                rows={12}
                className="w-full min-h-[1000px] border border-border-soft rounded-lg px-2 py-1 body-14_r bg-cream"
              />
            </div>
          );
        })}

        {/* TOC */}
        {toc.length > 0 && (
          <div className="mt-2 border border-border-soft rounded-xl bg-white/80 p-3">
            <div className="label-12_sb text-gray-500 mb-2 flex items-center gap-1">
              <span>목차 (H1/H2)</span>
            </div>
            <ul className="space-y-1 text-sm">
              {toc.map((item) => (
                <li
                  key={item.id}
                  className={item.level === 2 ? "ml-4 text-gray-600" : ""}
                >
                  <a href={`#${item.id}`} className="hover:underline text-accent-blue">
                    {item.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* 우측: Preview */}
      <div className="border border-border-soft rounded-2xl bg-white/90 px-4 py-3 overflow-y-auto max-h-[1300px]">
        <MarkdownRenderer value={combined || "_(미리보기 내용이 없습니다)_"}/>
      </div>
    </div>
  );
}
