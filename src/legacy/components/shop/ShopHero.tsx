import React from "react";
import { ArrowLeft, BadgePercent, CheckCircle2, CreditCard, Headphones, ShieldCheck, ShoppingBag } from "lucide-react";
interface P { productsCount: number; categoriesCount: number; }
export const ShopHero: React.FC<P> = ({ productsCount, categoriesCount }) => {
  const go = () => document.getElementById("catalog")?.scrollIntoView({ behavior: "smooth" });
  return <section className="shell pt-5 sm:pt-8"><div className="relative overflow-hidden rounded-[2rem] border border-slate-700/50 bg-slate-800/35 shadow-xl">
    <div className="grid items-stretch lg:grid-cols-[1.3fr_.7fr]">
      <div className="relative z-10 px-5 py-9 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
        <span className="inline-flex items-center gap-2 rounded-full bg-rose-500/10 px-3 py-1.5 text-[10px] font-black text-rose-400"><BadgePercent className="h-3.5 w-3.5" />قیمت شفاف، خرید مستقیم</span>
        <h1 className="mt-5 max-w-2xl text-3xl font-black leading-[1.45] tracking-tight text-slate-100 sm:text-5xl">فروشگاه سرویس‌های دیجیتال<br/><span className="text-sky-400">برای کار و زندگی آنلاین</span></h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-slate-400 sm:text-base">اشتراک، لایسنس و ابزارهای دیجیتال را با پلن مشخص انتخاب کنید، آنلاین پرداخت کنید و تحویل را در حساب کاربری‌تان ببینید.</p>
        <div className="mt-7 flex flex-wrap gap-3"><button onClick={go} className="group flex h-12 items-center gap-2 rounded-xl bg-sky-500 px-6 text-sm font-black text-white shadow-lg shadow-sky-500/20 hover:bg-sky-400">شروع خرید <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" /></button><span className="flex h-12 items-center gap-2 px-2 text-xs font-bold text-slate-400"><CheckCircle2 className="h-4 w-4 text-emerald-400" />ضمانت سلامت سرویس</span></div>
        <div className="mt-8 flex flex-wrap items-center gap-5 border-t border-slate-700/50 pt-5 text-[10px] text-slate-500"><span><b className="ml-1 text-lg font-black text-slate-100">{productsCount.toLocaleString("fa-IR")}+</b> محصول</span><span><b className="ml-1 text-lg font-black text-slate-100">{categoriesCount.toLocaleString("fa-IR")}</b> دسته‌بندی</span><span className="flex items-center gap-1.5"><CreditCard className="h-4 w-4 text-sky-400" />پرداخت امن بانکی</span></div>
      </div>
      <div className="relative hidden min-h-full overflow-hidden border-r border-slate-700/50 bg-gradient-to-br from-sky-500/10 via-slate-800/20 to-emerald-500/10 p-8 lg:flex lg:items-center lg:justify-center">
        <div className="absolute h-64 w-64 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="relative w-full max-w-xs space-y-3"><div className="rounded-2xl border border-white/10 bg-slate-900/80 p-5 shadow-2xl backdrop-blur"><div className="flex items-center justify-between"><span className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500 text-white"><ShoppingBag className="h-5 w-5" /></span><span className="rounded-lg bg-emerald-500/10 px-2 py-1 text-[9px] font-bold text-emerald-400">خرید امن</span></div><h3 className="mt-5 text-lg font-black text-slate-100">انتخاب، پرداخت، تحویل</h3><p className="mt-2 text-[11px] leading-6 text-slate-400">همه‌چیز از داخل حساب فروشگاه قابل پیگیری است.</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-3"><ShieldCheck className="h-4 w-4 text-emerald-400"/><b className="mt-2 block text-[10px] text-slate-200">ضمانت خرید</b></div><div className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-3"><Headphones className="h-4 w-4 text-amber-400"/><b className="mt-2 block text-[10px] text-slate-200">پشتیبانی سفارش</b></div></div></div>
      </div>
    </div>
  </div></section>;
};
