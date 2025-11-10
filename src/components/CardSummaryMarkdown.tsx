"use client";
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// 카드 요약 전용: 제한된 마크다운만 (이미지/거대한 블록 제거)로 높이 안정성 유지
// 허용: p, strong, em, inline code, a, blockquote (간단 콜아웃 느낌)

export function CardSummaryMarkdown({ value }: { value: string }) {
  if (!value) return null;
  return (
    <div className="text-gray-700 text-sm leading-relaxed  card-summary-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <span className="block mb-1 last:mb-0">{children}</span>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          code: ((props: any) => props.inline ? (
            <code className="px-1 py-[1px] rounded bg-neutral-200 text-[12px]">{props.children}</code>
          ) : null) as any,
          a: ({ href, children }) => (
            <span className="underline text-accent-blue" title={href}>{children}</span>
          ),
          blockquote: ({ children }) => (
            <span className="block pl-2 border-l-2 border-border-soft text-gray-600 mb-1">{children}</span>
          ),
          img: () => null,
          pre: () => null,
          h1: ({ children }) => <span className="font-semibold">{children}</span>,
          h2: ({ children }) => <span className="font-semibold">{children}</span>,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}

export default CardSummaryMarkdown;
