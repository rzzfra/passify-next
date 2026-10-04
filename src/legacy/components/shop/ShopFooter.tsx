import React from "react";
import { BookOpen, Headphones, ShieldCheck, ShoppingBag } from "lucide-react";
import type { SupportInfo } from "../../types";
interface P { supportInfo: SupportInfo; onOpenOrders: () => void; onOpenSupport: () => void; onOpenBlog: () => void; }
export const ShopFooter: React.FC<P> = (p) => (
  <footer className="mt-6 border-t border-slate-700/50 bg-slate-900/55">
    <div className="shell py-10 sm:py-12">
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-2.5"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-sm font-black text-slate-900">P</span><span><strong className="block text-sm font-black text-slate-100">پسیفای</strong><small className="text-[9px] text-slate-500">دنیای سرویس‌های دیجیتال</small></span></div>
          <p className="mt-4 max-w-sm text-[11px] leading-6 text-slate-400">اشتراک و لایسنس قانونی با قیمت شفاف، تحویل سریع و ضمانتی که تا پایان سرویس کنارت می‌ماند.</p>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-2.5 py-1.5 text-[10px] font-bold text-emerald-400"><ShieldCheck className="h-3.5 w-3.5" />پرداخت امن بانکی</p>
        </div>
        <div><h4 className="mb-4 text-xs font-black text-slate-200">دسترسی سریع</h4><div className="space-y-3 text-[11px] text-slate-400"><button type="button" onClick={p.onOpenOrders} className="flex items-center gap-2 transition hover:text-sky-400"><ShoppingBag className="h-3.5 w-3.5" />سفارش‌های من</button><button type="button" onClick={p.onOpenBlog} className="flex items-center gap-2 transition hover:text-sky-400"><BookOpen className="h-3.5 w-3.5" />راهنمای خرید</button></div></div>
        <div><h4 className="mb-4 text-xs font-black text-slate-200">نیاز به کمک داری؟</h4><button type="button" onClick={p.onOpenSupport} className="flex items-center gap-2 text-[11px] font-bold text-sky-400 transition hover:text-sky-300"><Headphones className="h-4 w-4" />گفتگو با پشتیبانی</button><p className="mt-3 text-[10px] leading-5 text-slate-500">{p.supportInfo.workingHours}<br />{p.supportInfo.responseTime}</p></div>
      </div>
      <div className="mt-9 flex flex-col gap-2 border-t border-slate-700/50 pt-5 text-[9px] text-slate-500 sm:flex-row sm:items-center sm:justify-between"><span>© پسیفای — تمامی حقوق محفوظ است.</span><span dir="ltr">{p.supportInfo.email}</span></div>
    </div>
  </footer>
);
