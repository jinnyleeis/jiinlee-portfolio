"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function extractText(node: React.ReactNode): string {
  if (typeof node === "string") return node;
  if (Array.isArray(node)) return node.map(extractText).join("");
  if (React.isValidElement(node)) return extractText(node.props.children);
  return "";
}


// Mermaid는 동적 로딩 (SSR 번들 단계에서 window 접근 회피)
let mermaidPromise: Promise<any> | null = null;
function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
      // 전역 기본값: handDrawn 룩 적용 (다이어그램별 init directive가 있으면 그 값이 우선)
      m.default.initialize({
        startOnLoad: false,
        look: "handDrawn",
        handDrawnSeed: 1,
        securityLevel: "loose",
      });
      return m.default;
    });
  }
  return mermaidPromise;
}

// highlight.js 동적 로딩
let hljsPromise: Promise<any> | null = null;
function getHLJS() {
  if (!hljsPromise) {
    hljsPromise = import("highlight.js");
  }
  return hljsPromise;
}

export default function MarkdownRenderer({ value }: { value: string }) {
  return (
    <div className="markdown-body">
      <ReactMarkdown
  remarkPlugins={[remarkGfm]}
  components={{
    h1: ({ children }) => {
      const text = extractText(children);
      const id = slugify(text);
      return (
        <h1 id={id} className="markdown-h1">
          {children}
        </h1>
      );
    },
    h2: ({ children }) => {
      const text = extractText(children);
      const id = slugify(text);
      return (
        <h2 id={id} className="markdown-h2">
          {children}
        </h2>
      );
    },
    blockquote: ({ children }) => {
      const text = extractText(children);
      let variant: "problem" | "design" | "impl" | "result" | "reflection" | null = null;

      if (text.includes("⚠️")) variant = "problem";
      else if (text.includes("🧩")) variant = "design";
      else if (text.includes("⚙️")) variant = "impl";
      else if (text.includes("✅")) variant = "result";
      else if (text.includes("🧠")) variant = "reflection";

      const base = "markdown-callout";
      const extra =
        variant === "problem"
          ? "markdown-callout-problem"
          : variant === "design"
          ? "markdown-callout-design"
          : variant === "impl"
          ? "markdown-callout-impl"
          : variant === "result"
          ? "markdown-callout-result"
          : variant === "reflection"
          ? "markdown-callout-reflection"
          : "";

      return <blockquote className={`${base} ${extra}`}>{children}</blockquote>;
    },
          pre: ((props: any) => {
            const child: any = Array.isArray(props.children)
              ? props.children[0]
              : props.children;
            const className = child?.props?.className || "";
            const raw = String(child?.props?.children || "").trim();
            const langMatch = /language-(\w+)/.exec(className);
            const lang = langMatch?.[1];

            if (lang === "mermaid") {
              return <MermaidDiagram code={raw} />;
            }
            return <CodeBlock raw={raw} language={lang} className={className} />;
          }) as React.ComponentType<any>,
          code: ((args: any) => {
            const { inline, className, children, ...props } = args as {
              inline?: boolean;
              className?: string;
              children?: React.ReactNode;
            } & React.HTMLAttributes<HTMLElement>;

            if (inline) {
              return (
                <code
                  className={className}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            // 블록 코드는 위의 pre 컴포넌트가 처리
            return null as any;
          }) as React.ComponentType<any>,
        }}
      >
        {value}
      </ReactMarkdown>
    </div>
  );
}

function MermaidDiagram({ code }: { code: string }) {
  const id = React.useId().replace(/:/g, "_");
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  React.useEffect(() => {
    if (!ref.current) return;
    let active = true;
    (async () => {
      try {
        const mermaid = await getMermaid();
        const processed = preprocessMermaidCode(code);
        const { svg } = await mermaid.render(id, processed);
        if (active && ref.current) {
          ref.current.innerHTML = svg;
          const svgEl = ref.current.querySelector('svg') as SVGElement | null;
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.maxHeight = '500px';
            // mermaid가 내부에 배경을 넣는 경우 투명화 시도
            (svgEl.style as any).background = 'transparent';
          }
        }
      } catch (e: any) {
        console.error("Mermaid render error", e);
        setError(e?.message || "Mermaid render failed");
      }
    })();
    return () => {
      active = false;
    };
  }, [code, id]);

  return (
    <figure className="my-6">
      <div className="rounded-xl border border-border-soft bg-white/70 backdrop-blur-sm p-4 shadow-sm">
        {error ? (
          <pre className="text-red-600 text-sm whitespace-pre-wrap">Mermaid Error: {error}\n{code}</pre>
        ) : (
          <div ref={ref} className="mermaid" aria-label="Mermaid diagram" />
        )}
      </div>
      <figcaption className="sr-only">Mermaid diagram</figcaption>
    </figure>
  );
}

// --- Helpers ---
// Markdown의 YAML frontmatter(--- ... ---) 안에 config.look, config.theme 등을 지원하고,
// 없는 경우에도 handDrawn 룩을 기본으로 적용하기 위해 init directive를 주입한다.
function preprocessMermaidCode(src: string): string {
  const trimmed = src.trimStart();
  // 1) 이미 handDrawn 룩을 명시한 init 지시문이 있다면 그대로 반환
  if (/%%\{\s*init:[^}]*"look"\s*:\s*"handDrawn"/m.test(trimmed)) {
    return src;
  }

  // 2) 기존 init 지시문이 있으나 handDrawn이 없으면 앞에 우리 기본 init 추가
  if (trimmed.startsWith("%%{") && trimmed.includes("}%%")) {
    const directive = `%%{init: {"look":"handDrawn","handDrawnSeed":1}}%%\n`;
    return directive + src;
  }

  // 3) YAML frontmatter 파싱해서 config 적용, look 없으면 기본값 강제
  if (trimmed.startsWith("---")) {
    const end = trimmed.indexOf("---", 3);
    if (end > 0) {
      const header = trimmed.slice(3, end).trim();
      const rest = trimmed.slice(end + 3);
      const cfg = parseSimpleYaml(header);
      const initObj: Record<string, any> = {};
      const userCfg = (cfg?.config ?? {}) as Record<string, any>;
      if (userCfg) {
        if (userCfg.look) initObj.look = String(userCfg.look);
        if (userCfg.theme) initObj.theme = String(userCfg.theme);
        if (userCfg.handDrawnSeed != null) initObj.handDrawnSeed = Number(userCfg.handDrawnSeed);
      }
      if (!initObj.look) initObj.look = "handDrawn";
      if (!initObj.handDrawnSeed) initObj.handDrawnSeed = 1;
      const directive = `%%{init: ${JSON.stringify(initObj)}}%%\n`;
      return directive + rest.trimStart();
    }
  }

  // 4) 아무것도 없으면 기본 init 항상 prepend
  const directive = `%%{init: {"look":"handDrawn","handDrawnSeed":1}}%%\n`;
  return directive + src;
}

function parseSimpleYaml(text: string): any {
  // 매우 단순한 2단계(depth 1) YAML 파서: key: value 또는 섹션: 다음 줄 들여쓰기 key: value
  const lines = text.split(/\r?\n/);
  const root: any = {};
  let currentKey: string | null = null;
  for (const raw of lines) {
    const line = raw.replace(/\t/g, "  ");
    if (!line.trim()) continue;
    const indent = line.match(/^\s*/)?.[0].length ?? 0;
    if (indent === 0) {
      const m = line.match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
      if (m) {
        const k = m[1];
        const v = m[2];
        if (v === "" || v === undefined) {
          root[k] = {};
          currentKey = k;
        } else {
          root[k] = parseYamlValue(v);
          currentKey = null;
        }
      }
    } else if (indent >= 2 && currentKey) {
      const m = line.trim().match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
      if (m) {
        const k = m[1];
        const v = m[2];
        if (!root[currentKey]) root[currentKey] = {};
        root[currentKey][k] = parseYamlValue(v);
      }
    }
  }
  return root;
}

function parseYamlValue(v: string): any {
  const t = v.trim();
  if (t === "true") return true;
  if (t === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(t)) return Number(t);
  return t.replace(/^['"]|['"]$/g, "");
}
function CodeBlock({
  raw,
  language,
  className,
}: {
  raw: string;
  language?: string;
  className?: string;
}) {
  const codeRef = React.useRef<HTMLElement | null>(null);
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      let highlightedHtml: string | null = null;
      try {
        const hljs = await getHLJS();
        if (language && hljs.getLanguage(language)) {
          const { value } = hljs.highlight(raw, { language });
          highlightedHtml = value;
        } else {
          const { value } = hljs.highlightAuto(raw);
          highlightedHtml = value;
        }
      } catch (e) {
        console.warn("highlight.js failed", e);
      } finally {
        if (codeRef.current) {
          const safe = highlightedHtml ?? escapeHtml(raw);
          codeRef.current.innerHTML = wrapLines(safe);
        }
      }
    })();
  }, [raw, language]);

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(raw);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (e) {
      console.warn("copy failed", e);
    }
  };


  return (
    <div className="group relative bg-[#111] rounded-xl">
      <button
        type="button"
        onClick={onCopy}
        className="absolute top-2 right-2 z-10 px-2 py-1 rounded bg-neutral-700/70 hover:bg-neutral-600 text-neutral-100 text-xs transition-opacity opacity-0 group-hover:opacity-100"
      >
        {copied ? "Copied" : "Copy"}
      </button>
      {/* 줄간격 1.1 적용 */}
      <pre
        className="text-neutral-100 overflow-x-auto"
        style={{ lineHeight: 1.1 }}
      >
        <code
          ref={codeRef}
          className={clsx(
            "block",
            className,
            language ? `language-${language}` : undefined,
            "with-line-numbers"
          )}
        />
      </pre>
      <style jsx global>{`
        /* 줄간격과 높이를 줄이기 위한 스타일 조정 */
        code.with-line-numbers {
          line-height: 1.1;
        }

        code.with-line-numbers span.line-number,
        code.with-line-numbers span.line-content {
          display: inline-block;
          line-height: 1.5;
          padding-top: 0;
          padding-bottom: 0;
        }

        code.with-line-numbers span.line-number {
          color: #9ca3af; /* gray-400 */
          text-align: right;
          padding-right: 0.75rem;
          user-select: none;
          min-width: 2.5rem;
        }
      `}</style>
    </div>
  );
}


function wrapLines(highlightedHtml: string) {
  // 마지막 개행은 보존하지 않도록 제거 후 처리 (필요 시 &nbsp;로 유지)
  const parts = highlightedHtml.replace(/\n$/, "").split(/\n/);
  return parts
    .map((line, i) => {
      const safe = line;
      return `<span class=\"line-number\">${i + 1}</span><span class=\"line-content\">${safe}</span>`;
    })
    .join("\n");
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
