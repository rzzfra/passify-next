import React from "react";
import { Moon, Search, ShoppingBag, Sun, User, X } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { toPersianDigits } from "../../utils/formatters";
import type { AccountInfo } from "../AccountModal";

interface P {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  cartCount: number;
  onOpenCart: () => void;
  account: AccountInfo | null;
  onOpenAccount: () => void;
}

const iconButtonClass = "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/80 text-slate-400 transition hover:border-slate-600 hover:text-slate-100 active:scale-95";

export const ShopHeader: React.FC<P> = (p) => {
  const { isDark, toggleTheme } = useTheme();
  const accountName = p.account?.name || p.account?.email || "حساب کاربری";

  const searchField = (
    <div className="relative">
      <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      <input
        type="search"
        value={p.searchQuery}
        onChange={(e) => p.onSearchChange(e.target.value)}
        placeholder="جستجو بین محصولات و سرویس‌ها..."
        aria-label="جستجو در محصولات"
        className="h-10 w-full rounded-xl border border-slate-700/60 bg-slate-800/70 pl-9 pr-10 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10"
      />
      {p.searchQuery && (
        <button type="button" onClick={() => p.onSearchChange("")} aria-label="پاک کردن جستجو" className="absolute left-2.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-700/60 hover:text-slate-200">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-xl">
      <div className="border-b border-slate-700/40 bg-slate-800/35">
        <div className="shell flex h-7 items-center justify-center text-[9px] font-bold text-slate-400 sm:justify-between">
          <span>خرید آنلاین سرویس‌های دیجیتال با تحویل در حساب کاربری</span>
          <span className="hidden text-emerald-400 sm:block">پرداخت امن • ضمانت خرید • پشتیبانی روزانه</span>
        </div>
      </div>
      <div className="border-b border-slate-700/50"><div className="shell">
        <div className="flex h-16 items-center gap-3">
          <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex shrink-0 items-center gap-2.5 text-right" aria-label="صفحه نخست پسیفای">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-900 shadow-sm">
              <span className="text-base font-black">P</span>
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-black tracking-tight text-slate-100">پسیفای</span>
              <span className="hidden text-[9px] text-slate-500 sm:block">فروشگاه سرویس‌های دیجیتال</span>
            </span>
          </button>

          <nav className="mr-5 hidden items-center gap-5 text-xs font-semibold text-slate-400 lg:flex" aria-label="منوی اصلی">
            <button onClick={() => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" })} className="transition hover:text-slate-100">فروشگاه</button>
            <button onClick={() => document.getElementById("articles")?.scrollIntoView({ behavior: "smooth" })} className="transition hover:text-slate-100">راهنمای خرید</button>
          </nav>

          <div className="mx-auto hidden w-full max-w-md lg:block">{searchField}</div>

          <div className="mr-auto flex items-center gap-1.5 lg:mr-0">
            <button type="button" onClick={toggleTheme} className={iconButtonClass} aria-label="تغییر پوسته">
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
            </button>
            <button type="button" onClick={p.onOpenAccount} className={`${iconButtonClass} w-auto max-w-[9rem] gap-2 px-3`} aria-label={accountName}>
              {p.account?.avatarUrl ? <img src={p.account.avatarUrl} alt="" className="h-5 w-5 rounded-full object-cover" /> : <User className="h-4 w-4" />}
              <span className="hidden truncate text-[11px] font-bold sm:inline">{accountName}</span>
            </button>
            <button type="button" onClick={p.onOpenCart} aria-label="سبد خرید" className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500 text-white shadow-lg shadow-sky-500/15 transition hover:bg-sky-400 active:scale-95">
              <ShoppingBag className="h-4 w-4" />
              {p.cartCount > 0 && <span className="absolute -left-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-slate-900 bg-rose-500 px-1 text-[9px] font-black text-white">{toPersianDigits(p.cartCount)}</span>}
            </button>
          </div>
        </div>
        <div className="pb-3 lg:hidden">{searchField}</div>
      </div></div>
    </header>
  );
};
