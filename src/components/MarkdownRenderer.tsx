"use client";

import React from "react";
import { createPortal } from "react-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import clsx from "clsx";

/** 라이트박스에 띄울 컨텐츠 타입 */
type LightboxContent =
  | { kind: "img"; src: string; alt?: string }
  | { kind: "svg"; svg: string; alt?: string };

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

/* ===================== */
/*  mermaid / highlight  */
/* ===================== */

// Mermaid 동적 로딩
let mermaidPromise: Promise<any> | null = null;
function getMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then((m) => {
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

/* ===================== */
/*   메인 컴포넌트       */
/* ===================== */

export default function MarkdownRenderer({ value }: { value: string }) {
  const [lightbox, setLightbox] = React.useState<LightboxContent | null>(null);
  const [theme, setTheme] = React.useState<"dark" | "light">("light");

  // CoverZoom 등 외부에서 이미지 열기용 이벤트 리스너
  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ src?: string }>).detail;
      if (!detail?.src) return;
      setLightbox({ kind: "img", src: detail.src });
    };

    if (typeof window !== "undefined") {
      window.addEventListener("open-lightbox-external", handler as EventListener);
      return () =>
        window.removeEventListener(
          "open-lightbox-external",
          handler as EventListener
        );
    }
  }, []);

  // ESC 등 키보드 처리
  React.useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      else if (e.key.toLowerCase() === "t") {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox]);

  const openImage = React.useCallback((src: string, alt?: string) => {
    setLightbox({ kind: "img", src, alt });
  }, []);

  const openSvg = React.useCallback((svg: string) => {
    if (!svg) return;
    setLightbox({ kind: "svg", svg });
  }, []);

  const closeLightbox = React.useCallback(() => setLightbox(null), []);

  return (
    <div className="markdown-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => {
            const s = typeof src === "string" ? src : "";
            return (
              <ZoomableThumb onOpen={() => openImage(s, alt)}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s}
                  alt={alt || ""}
                  className="max-w-full h-auto rounded-lg"
                />
              </ZoomableThumb>
            );
          },
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
            let variant:
              | "problem"
              | "design"
              | "impl"
              | "result"
              | "reflection"
              | null = null;

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

            return (
              <blockquote className={`${base} ${extra}`}>{children}</blockquote>
            );
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
              return <MermaidDiagram code={raw} onOpen={openSvg} />;
            }
            return (
              <CodeBlock raw={raw} language={lang} className={className} />
            );
          }) as React.ComponentType<any>,
          code: ((args: any) => {
            const { inline, className, children, ...props } = args as {
              inline?: boolean;
              className?: string;
              children?: React.ReactNode;
            } & React.HTMLAttributes<HTMLElement>;

            if (inline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
            // 블록 코드는 pre에서 처리
            return null as any;
          }) as React.ComponentType<any>,
        }}
      >
        {value}
      </ReactMarkdown>

      {lightbox && (
        <Lightbox
          content={lightbox}
          theme={theme}
          onClose={closeLightbox}
          onToggleTheme={() =>
            setTheme((t) => (t === "dark" ? "light" : "dark"))
          }
        />
      )}
    </div>
  );
}

/* ===================== */
/*   Mermaid Diagram     */
/* ===================== */

function MermaidDiagram({
  code,
  onOpen,
}: {
  code: string;
  onOpen?: (svg: string) => void;
}) {
  const id = React.useId().replace(/:/g, "_");
  const ref = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const svgCache = React.useRef<string>("");

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
          svgCache.current = svg;
          const svgEl = ref.current.querySelector(
            "svg"
          ) as SVGElement | null;
          if (svgEl) {
            svgEl.style.maxWidth = "100%";
            svgEl.style.maxHeight = "500px";
            (svgEl.style as any).background = "transparent";
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
      <div
        className="group relative rounded-xl border border-border-soft bg-white/70 backdrop-blur-sm p-4 shadow-sm cursor-zoom-in"
        onClick={() => svgCache.current && onOpen?.(svgCache.current)}
      >
        {error ? (
          <pre className="text-red-600 text-sm whitespace-pre-wrap">
            Mermaid Error: {error}
            {"\n"}
            {code}
          </pre>
        ) : (
          <>
            <div
              ref={ref}
              className="mermaid"
              aria-label="Mermaid diagram"
            />
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="rounded-full bg-black/60 text-white px-3 py-1 text-xs">
                클릭하여 확대
              </span>
            </div>
          </>
        )}
      </div>
      <figcaption className="sr-only">Mermaid diagram</figcaption>
    </figure>
  );
}

/* ===================== */
/*   Mermaid helper      */
/* ===================== */

function preprocessMermaidCode(src: string): string {
  const trimmed = src.trimStart();
  if (
    /%%\{\s*init:[^}]*"look"\s*:\s*"handDrawn"/m.test(trimmed)
  ) {
    return src;
  }

  if (trimmed.startsWith("%%{") && trimmed.includes("}%%")) {
    const directive =
      '%%{init: {"look":"handDrawn","handDrawnSeed":1}}%%\n';
    return directive + src;
  }

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
        if (userCfg.handDrawnSeed != null)
          initObj.handDrawnSeed = Number(userCfg.handDrawnSeed);
      }
      if (!initObj.look) initObj.look = "handDrawn";
      if (!initObj.handDrawnSeed) initObj.handDrawnSeed = 1;
      const directive = `%%{init: ${JSON.stringify(
        initObj
      )}}%%\n`;
      return directive + rest.trimStart();
    }
  }

  const directive =
    '%%{init: {"look":"handDrawn","handDrawnSeed":1}}%%\n';
  return directive + src;
}

function parseSimpleYaml(text: string): any {
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
      const m = line
        .trim()
        .match(/^([A-Za-z0-9_\-]+)\s*:\s*(.*)$/);
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

/* ===================== */
/*   코드블록 하이라이트 */
/* ===================== */

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
          color: #9ca3af;
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
  const parts = highlightedHtml.replace(/\n$/, "").split(/\n/);
  return parts
    .map((line, i) => {
      const safe = line;
      return `<span class="line-number">${i + 1}</span><span class="line-content">${safe}</span>`;
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

/* ===================== */
/*   Lightbox & Thumb    */
/* ===================== */

function Lightbox({
  content,
  theme,
  onClose,
  onToggleTheme,
}: {
  content: LightboxContent;
  theme: "dark" | "light";
  onClose: () => void;
  onToggleTheme: () => void;
}) {
  if (typeof window === "undefined") return null;

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-[100] flex items-center justify-center p-4",
        theme === "dark" ? "bg-black/90" : "bg-white"
      )}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 px-3 py-1 rounded-md bg-black/60 text-white text-xs hover:bg-black/80"
      >
        닫기 (ESC)
      </button>
      <button
        onClick={onToggleTheme}
        className="absolute top-4 left-4 px-3 py-1 rounded-md bg-black/60 text-white text-xs hover:bg-black/80"
      >
        테마: {theme === "dark" ? "Dark" : "Light"}
      </button>

      <div className="cursor-zoom-out" onClick={onClose}>
        {content.kind === "img" ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={content.src}
            alt={content.alt || "preview"}
            className="max-w-[95vw] max-h-[95vh] object-contain rounded-lg shadow-2xl"
          />
        ) : (
          <div
            className="max-w-[95vw] max-h-[95vh] [&>svg]:w-full [&>svg]:h-auto"
            dangerouslySetInnerHTML={{ __html: content.svg }}
          />
        )}
      </div>
    </div>,
    document.body
  );
}

function ZoomableThumb({
  children,
  onOpen,
}: {
  children: React.ReactNode;
  onOpen: () => void;
}) {
  return (
    <div className="group relative cursor-zoom-in">
      <button
        type="button"
        className="block w-full text-left"
        onClick={onOpen}
      >
        {children}
      </button>
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="rounded-full bg-black/60 text-white px-3 py-1 text-xs">
          클릭하여 확대
        </span>
      </div>
    </div>
  );
}
