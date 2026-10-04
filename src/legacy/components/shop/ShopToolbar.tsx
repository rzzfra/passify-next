import React from "react";
import { BadgePercent, LayoutGrid, SlidersHorizontal, X } from "lucide-react";
import type { Category } from "../../types";
import { toPersianDigits, triggerHaptic } from "../../utils/formatters";
import { CategoryIcon } from "./CategoryIcon";

export type SortKey = "newest" | "cheap" | "exp" | "popular" | "discount";
export const SORT_LABELS: Record<SortKey, string> = {
  newest: "جدیدترین",
  cheap: "ارزان‌ترین",
  exp: "گران‌ترین",
  popular: "پرفروش‌ترین",
  discount: "بیشترین تخفیف",
};

interface P {
  title: string;
  count: number;
  sort: SortKey;
  onSort: (s: SortKey) => void;
  onlyDiscount: boolean;
  onToggleDiscount: () => void;
  categories: Category[];
  activeCategory: string | null;
  onCategory: (id: string | null) => void;
}

const sortChip = (active: boolean) =>
  `shrink-0 rounded-lg px-3 py-2 text-[10px] font-bold transition ${
    active
      ? "bg-slate-100 text-slate-900 shadow-sm"
      : "text-slate-500 hover:bg-slate-700/40 hover:text-slate-200"
  }`;

export const ShopToolbar: React.FC<P> = (p) => {
  const chooseCategory = (id: string | null) => {
    triggerHaptic("selection");
    p.onCategory(id);
  };

  return (
    <section className="shell">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="mb-1 text-[10px] font-bold tracking-[.18em] text-sky-400">فروشگاه</p>
          <h2 className="line-clamp-1 text-lg font-black text-slate-100 sm:text-xl">{p.title}</h2>
        </div>
        <span className="shrink-0 rounded-lg bg-slate-800/60 px-2.5 py-1.5 text-[10px] text-slate-500">
          {toPersianDigits(p.count)} محصول
        </span>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/25">
        <div className="rail-scroll flex items-center gap-1.5 overflow-x-auto border-b border-slate-700/45 p-2">
          <span className="mr-1 flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-bold text-slate-400">
            <LayoutGrid className="h-3.5 w-3.5" /> دسته‌بندی
          </span>
          <button type="button" onClick={() => chooseCategory(null)} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-bold transition ${p.activeCategory === null ? "border-sky-500/40 bg-sky-500/10 text-sky-400" : "border-transparent text-slate-500 hover:bg-slate-700/40 hover:text-slate-200"}`}>
            همه
          </button>
          {p.categories.map((category) => {
            const active = p.activeCategory === category.id;
            return (
              <button key={category.id} type="button" onClick={() => chooseCategory(category.id)} className={`flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[10px] font-bold transition ${active ? "border-sky-500/40 bg-sky-500/10 text-sky-400" : "border-transparent text-slate-500 hover:bg-slate-700/40 hover:text-slate-200"}`}>
                <CategoryIcon name={category.icon} className="h-3.5 w-3.5" />
                {category.name}
              </button>
            );
          })}
        </div>

        <div className="rail-scroll flex items-center gap-1 overflow-x-auto p-2">
          <span className="mr-1 flex shrink-0 items-center gap-1.5 px-2 text-[10px] font-bold text-slate-400">
            <SlidersHorizontal className="h-3.5 w-3.5" /> مرتب‌سازی
          </span>
          {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
            <button key={key} type="button" onClick={() => { triggerHaptic("selection"); p.onSort(key); }} className={sortChip(p.sort === key)}>
              {SORT_LABELS[key]}
            </button>
          ))}
          <span className="mx-1 h-5 w-px shrink-0 bg-slate-700/70" />
          <button type="button" onClick={() => { triggerHaptic("selection"); p.onToggleDiscount(); }} className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-3 py-2 text-[10px] font-bold transition ${p.onlyDiscount ? "border-rose-500/35 bg-rose-500/10 text-rose-400" : "border-transparent text-slate-500 hover:bg-slate-700/40 hover:text-slate-200"}`}>
            {p.onlyDiscount ? <X className="h-3.5 w-3.5" /> : <BadgePercent className="h-3.5 w-3.5" />}
            {p.onlyDiscount ? "حذف فیلتر تخفیف" : "فقط تخفیف‌دار"}
          </button>
        </div>
      </div>
    </section>
  );
};
