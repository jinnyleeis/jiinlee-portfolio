import { Tag } from "./Tag";

type Props = {
  type_tags?: string[] | null;
  tech_stack_tags?: string[] | null;
  theme_tags?: string[] | null;
  period?: string | null;
  role_tags?: string[] | null;
  impact?: string | null;
};

export function ProjectMetaTags({
  type_tags,
  tech_stack_tags,
  theme_tags,
  period,
  role_tags,
  impact,
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
            <span className="label-12_sb text-gray-500">Period</span>
            <span className="body-14_r">{period}</span>
          </div>
        )}
        {role_tags && role_tags.length > 0 && (
          <div className="flex gap-2">
            <span className="label-12_sb text-gray-500">Role</span>
            <span className="body-14_r">{role_tags.join(" / ")}</span>
          </div>
        )}
        {impact && (
          <div className="flex gap-2 sm:col-span-2">
            <span className="label-12_sb text-gray-500">Impact</span>
            <span className="body-14_r">{impact}</span>
          </div>
        )}
      </div>
    </div>
  );
}
