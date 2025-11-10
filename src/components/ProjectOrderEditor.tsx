"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { updateProjectOrder } from "@/actions/projectActions";

export type OrderItem = {
  id: string;
  title: string;
  slug: string;
  sort_order: number | null;
};

function sortItems(items: OrderItem[]) {
  // nulls last, then by id to stabilize
  return [...items].sort((a, b) => {
    const av = a.sort_order ?? Number.POSITIVE_INFINITY;
    const bv = b.sort_order ?? Number.POSITIVE_INFINITY;
    if (av !== bv) return av - bv;
    return a.id.localeCompare(b.id);
  });
}

export default function ProjectOrderEditor({ items }: { items: OrderItem[] }) {
  const initial = useMemo(() => sortItems(items), [items]);
  const [list, setList] = useState<OrderItem[]>(initial);

  const move = (index: number, delta: number) => {
    setList((prev) => {
      const next = [...prev];
      const target = index + delta;
      if (target < 0 || target >= next.length) return prev;
      const tmp = next[index];
      next[index] = next[target];
      next[target] = tmp;
      return next;
    });
  };

  return (
    <form action={updateProjectOrder} className="space-y-3">
      <div className="border border-border-soft rounded-2xl bg-white/80 divide-y">
        {list.map((p, idx) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            {/* 순서 표시 */}
            <div className="w-10 text-center label-14_sb">{idx + 1}</div>

            {/* 서버로 전송할 hidden input (id, 계산된 sort_order) */}
            <input
              type="hidden"
              name="order_item"
              value={JSON.stringify({ id: p.id, sort_order: idx + 1 })}
            />

            {/* 정보 */}
            <div className="flex-1">
              <div className="title-16_sb">{p.title}</div>
              <div className="body-13_l text-gray-600">slug: {p.slug}</div>
            </div>

            {/* 조작 버튼 */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                className="px-2 py-1 rounded border border-border-soft bg-white hover:bg-cream disabled:opacity-40 label-12_sb"
                aria-label="위로"
                title="위로"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(idx, +1)}
                disabled={idx === list.length - 1}
                className="px-2 py-1 rounded border border-border-soft bg-white hover:bg-cream disabled:opacity-40 label-12_sb"
                aria-label="아래로"
                title="아래로"
              >
                ↓
              </button>
              <Link href={`/admin/projects/${p.id}`} className="px-2 py-1 rounded bg-neutral-800 text-white label-12_sb">
                편집
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button type="submit" className="px-4 py-2 rounded-lg bg-neutral-800 text-white label-14_sb">
          정렬 저장
        </button>
      </div>
    </form>
  );
}
