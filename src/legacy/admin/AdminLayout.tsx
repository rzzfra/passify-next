import React, { useState } from "react";
import {
  BookOpen,
  ExternalLink,
  LayoutDashboard,
  Layers,
  LogOut,
  Menu,
  Moon,
  Package,
  Settings,
  ShoppingBag,
  Sun,
  Users,
  X,
} from "lucide-react";
import type { AdminUser } from "../types";
import { useTheme } from "../context/ThemeContext";

export type AdminTab =
  | "dashboard"
  | "products"
  | "orders"
  | "categories"
  | "blog"
  | "users"
  | "settings";
interface AdminLayoutProps {
  user: AdminUser;
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  onLogout: () => void;
  onGoToStore: () => void;
  children: React.ReactNode;
}

const navItems: {
  id: AdminTab;
  label: string;
  shortLabel: string;
  icon: React.ReactNode;
}[] = [
  {
    id: "dashboard",
    label: "داشبورد و آمار",
    shortLabel: "نمای کلی عملکرد فروشگاه",
    icon: <LayoutDashboard className="h-[18px] w-[18px]" />,
  },
  {
    id: "products",
    label: "محصولات",
    shortLabel: "کالاها، پلن‌ها و موجودی",
    icon: <Package className="h-[18px] w-[18px]" />,
  },
  {
    id: "orders",
    label: "سفارش‌ها",
    shortLabel: "پرداخت و تحویل سفارش",
    icon: <ShoppingBag className="h-[18px] w-[18px]" />,
  },
  {
    id: "categories",
    label: "دسته‌بندی‌ها",
    shortLabel: "ساختار کاتالوگ",
    icon: <Layers className="h-[18px] w-[18px]" />,
  },
  {
    id: "blog",
    label: "مقالات",
    shortLabel: "محتوای راهنمای خرید",
    icon: <BookOpen className="h-[18px] w-[18px]" />,
  },
  {
    id: "users",
    label: "مشتریان",
    shortLabel: "حساب‌های ثبت‌شده فروشگاه",
    icon: <Users className="h-[18px] w-[18px]" />,
  },
  {
    id: "settings",
    label: "تنظیمات",
    shortLabel: "اعلان خرید، پرداخت و فروشگاه",
    icon: <Settings className="h-[18px] w-[18px]" />,
  },
];

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  user,
  activeTab,
  onSelectTab,
  onLogout,
  onGoToStore,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const current = navItems.find((item) => item.id === activeTab)!;

  return (
    <div className="admin-shell app-surface flex min-h-screen bg-slate-900 font-vazir text-slate-100 antialiased">
      <aside
        className={`fixed inset-y-0 right-0 z-40 flex w-60 flex-col border-l border-slate-700/50 bg-slate-900/95 backdrop-blur-xl transition-transform duration-200 md:translate-x-0 ${mobileMenuOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-700/50 px-4">
          <button
            type="button"
            onClick={onGoToStore}
            className="flex items-center gap-2.5 text-right"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-900">
              P
            </span>
            <span>
              <strong className="block text-sm font-black text-slate-100">
                پسیفای
              </strong>
              <small className="block text-[9px] text-slate-500">
                مرکز مدیریت
              </small>
            </span>
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-800 hover:text-slate-100 md:hidden"
            aria-label="بستن منو"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav
          className="flex-1 space-y-1 overflow-y-auto p-3"
          aria-label="منوی مدیریت"
        >
          <p className="px-3 pb-2 pt-1 text-[9px] font-bold tracking-[.16em] text-slate-500">
            مدیریت فروشگاه
          </p>
          {navItems.map((item) => {
            const active = item.id === activeTab;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-right text-xs font-bold transition ${active ? "bg-sky-500/10 text-sky-400" : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-100"}`}
              >
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${active ? "bg-sky-500 text-white" : "bg-slate-800/70"}`}
                >
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {active && (
                  <span className="mr-auto h-1.5 w-1.5 rounded-full bg-sky-400" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-700/50 p-3">
          <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-slate-800/45 p-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50 text-[10px] font-black text-slate-300">
              {user.name?.slice(0, 1) || "A"}
            </span>
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-[11px] text-slate-100">
                {user.name}
              </strong>
              <small className="block truncate text-[9px] text-slate-500">
                @{user.username}
              </small>
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-rose-500/10 hover:text-rose-400"
              title="خروج"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          <button
            type="button"
            onClick={onGoToStore}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-slate-700/60 text-[10px] font-bold text-slate-400 transition hover:bg-slate-800 hover:text-sky-400"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            مشاهده فروشگاه
          </button>
        </div>
      </aside>

      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="بستن منو"
          className="fixed inset-0 z-30 bg-black/55 backdrop-blur-sm md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col md:mr-60">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-700/50 bg-slate-900/85 px-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/70 text-slate-400 md:hidden"
              aria-label="باز کردن منو"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div>
              <h1 className="text-sm font-black text-slate-100">
                {current.label}
              </h1>
              <p className="hidden text-[9px] text-slate-500 sm:block">
                {current.shortLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 text-[10px] font-bold text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              سیستم آنلاین
            </span>
            <button
              type="button"
              onClick={toggleTheme}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-700/60 bg-slate-800/70 text-slate-400 transition hover:text-slate-100"
              aria-label="تغییر پوسته"
            >
              {isDark ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
            <button
              type="button"
              onClick={onGoToStore}
              className="flex h-10 items-center gap-2 rounded-xl bg-sky-500 px-3 text-[10px] font-black text-white transition hover:bg-sky-400"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">فروشگاه</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[90rem]">{children}</div>
        </main>
        {user.role === "demo" && (
          <div className="border-b border-sky-500/20 bg-sky-500/10 px-4 py-2 text-center text-[11px] font-bold text-sky-300">
            حساب نمایشی پسیفای؛ این پنل فقط خواندنی است.
          </div>
        )}
        <main className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-[90rem]">{children}</div>
        </main>
      </div>
    </div>
  );
};
