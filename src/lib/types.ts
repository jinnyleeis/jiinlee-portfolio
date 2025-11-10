// 실제 프로젝트에서는 Supabase에서 types 가져와 쓰면 더 안전
export type Profile = {
  id: string;
  full_name: string | null;
  title: string | null;
  summary: string | null; // Markdown
  contact_birth: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  contact_github: string | null;
  skills: string | null; // Markdown
};

export type Project = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  period: string | null;
  summary: string | null; // 상단 요약 (Markdown)
  body: string | null;    // 본문 (Markdown, 코드블록 포함)

  body_intro: string | null;
  body_main: string | null;
  body_outro: string | null;

  cover_image_path: string | null;

  // 정렬용
  sort_order: number | null;

  type_tags: string[] | null;
  tech_stack_tags: string[] | null;
  theme_tags: string[] | null;
  impact: string | null;
  role_tags: string[] | null;
  keywords: string[] | null;
  link: string | null; // 프로젝트 외부 링크 (Demo / GitHub 등)

  title_typography: string | null;
  subtitle_typography: string | null;
  body_typography: string | null;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile>;
        Update: Partial<Profile>;
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: Partial<Project>;
        Update: Partial<Project>;
        Relationships: [];
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
