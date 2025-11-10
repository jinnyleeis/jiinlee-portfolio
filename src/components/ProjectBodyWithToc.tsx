"use client";

import { useEffect, useMemo } from "react";
import MarkdownRenderer from "./MarkdownRenderer";
import { useToc, TocItem } from "./toc/TocContext";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split(/\r?\n/);
  const items: TocItem[] = [];

  for (const line of lines) {
    const m = /^(#{1,2})\s+(.*)$/.exec(line);
    if (!m) continue;
    const level = m[1].length as 1 | 2;
    const text = m[2].trim();
    const id = slugify(text);
    items.push({ level, text, id });
  }

  return items;
}

export function ProjectBodyWithToc({ markdown }: { markdown: string }) {
  const { setItems } = useToc();

  const toc = useMemo(() => extractToc(markdown), [markdown]);

  useEffect(() => {
    setItems(toc);
    return () => setItems([]); // 페이지 떠날 때 TOC 초기화
  }, [toc, setItems]);

  return (
    <article className="markdown-body">
      <MarkdownRenderer value={markdown} />
    </article>
  );
}
