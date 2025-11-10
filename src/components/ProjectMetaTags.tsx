"use client";

import { Tag } from "./Tag";

type Props = {
  type_tags?: string[] | null;
  tech_stack_tags?: string[] | null;
  theme_tags?: string[] | null;
  period?: string | null;
  role_tags?: string[] | null;
  impact?: string | null;
  link?: string | null;
};

export function ProjectMetaTags({
  type_tags,
  tech_stack_tags,
  theme_tags,
  period,
  role_tags,
  impact,
  link,
}: Props) {
  return (
    <div className="flex flex-col gap-3 body-14_r">
      <div className="flex flex-wrap gap-2">
        {type_tags?.map((t) => (
          <Tag key={t} variant={1}>
            {t}
          </Tag>
        ))}
        {tech_stack_tags?.map((t) => (
          <Tag key={t} variant={2}>
            {t}
          </Tag>
        ))}
        {theme_tags?.map((t) => (
          <Tag key={t} variant={3}>
            {t}
          </Tag>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 rounded-xl border border-border-soft bg-white/60 p-3">
        {period && (
          <div className="flex gap-2">
            <span className="label-14_sb text-gray-500">Period</span>
            <span className="body-16_r">{period}</span>
          </div>
        )}
        {role_tags && role_tags.length > 0 && (
          <div className="flex gap-2">
            <span className="label-14_sb text-gray-500">Role</span>
            <span className="body-16_r">{role_tags.join(" / ")}</span>
          </div>
        )}
        {link && (
          <div className="flex gap-2 sm:col-span-2">
            <span className="label-14_sb text-gray-500">Link</span>
            <a
              href={link}
              target="_blank"
              rel="noopener noreferrer"
              className="body-16_r text-accent-blue underline inline-flex items-center gap-1 max-w-full truncate"
              title={link}
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{link.replace(/^https?:\/\//, "")}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5 opacity-80"
              >
                <path d="M5 4a1 1 0 0 0-1 1v2a1 1 0 1 0 2 0V6h2a1 1 0 1 0 0-2H5Zm6 0a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0V5a1 1 0 0 0-1-1h-3Zm-7 7a1 1 0 0 1 1 1v2h2a1 1 0 1 1 0 2H5a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1Zm11 0a1 1 0 0 0-1 1v2h-2a1 1 0 1 0 0 2h3a1 1 0 0 0 1-1v-3a1 1 0 0 0-1-1Z" />
              </svg>
            </a>
          </div>
        )}
        {impact && (
          <div className="flex gap-2 sm:col-span-2">
            <span className="label-14_sb text-gray-500">Impact</span>
            <span className="body-16_r whitespace-pre-wrap break-words">{impact}</span>
          </div>
        )}
      </div>
    </div>
  );
}
