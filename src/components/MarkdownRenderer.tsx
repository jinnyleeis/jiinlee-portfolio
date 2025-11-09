"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

export default function MarkdownRenderer({ value }: { value: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code: (({
            inline,
            className,
            children,
            ...props
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          } & React.HTMLAttributes<HTMLElement>) => {
            if (inline) {
              return (
                <code
                  className={clsx(
                    "bg-neutral-100 rounded px-1 py-0.5 font-mono text-sm",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          }) as unknown as React.ComponentType<any>,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}
