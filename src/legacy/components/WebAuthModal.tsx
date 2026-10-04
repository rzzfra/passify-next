import React, { useState } from "react";
import { X, Mail, Lock, Loader2, ShieldCheck, Globe } from "lucide-react";
import { apiRequest } from "../utils/api";
import { triggerHaptic } from "../utils/formatters";

export interface WebAccount {
  token: string;
  userId: number;
  email: string;
  firstName?: string;
  lastName?: string;
}

interface WebAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (account: WebAccount) => void;
}

export const WebAuthModal: React.FC<WebAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    triggerHaptic("medium");

    const endpoint =
      mode === "login" ? "/api/web-auth/login" : "/api/web-auth/register";

    const body =
      mode === "login"
        ? { email, password }
        : { email, password, firstName, lastName };

    const res = await apiRequest<{
      token: string;
      user: {
        id: number;
        email: string;
        firstName?: string;
        lastName?: string;
      };
    }>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
    });

    setIsSubmitting(false);

    if (res.success && res.data) {
      triggerHaptic("success");
      onSuccess({
        token: res.data.token,
        userId: res.data.user.id,
        email: res.data.user.email,
        firstName: res.data.user.firstName,
        lastName: res.data.user.lastName,
      });
    } else {
      setError(res.error || "خطا در انجام عملیات. دوباره تلاش کنید.");
      triggerHaptic("error");
    }
  };

  const switchMode = (next: "login" | "register") => {
    triggerHaptic("selection");
    setMode(next);
    setError(null);
  };

  // __PART2__
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative w-full max-w-md max-h-[90vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "pan-y" }}
      >
        {/* هدر مودال */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              {mode === "login"
                ? "ورود به حساب کاربری"
                : "ساخت حساب کاربری جدید"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-slate-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* فرم ورود / ثبت‌نام */}
        <form
          onSubmit={handleSubmit}
          className="p-5 overflow-y-auto space-y-4 text-xs scrollbar-none"
        >
          <div className="flex items-center gap-2 p-3 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>
              برای ثبت سفارش، مشاهده اطلاعات تحویل و پیگیری خریدها به یک حساب فروشگاه نیاز دارید.
            </span>
          </div>

          {/* سوییچ بین ورود و ثبت‌نام */}
          <div className="grid grid-cols-2 gap-1 p-1 rounded-xl bg-slate-800/80 border border-slate-700">
            <button
              type="button"
              onClick={() => switchMode("login")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "login"
                  ? "bg-sky-500 text-white shadow"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              ورود
            </button>
            <button
              type="button"
              onClick={() => switchMode("register")}
              className={`py-2 rounded-lg text-xs font-bold transition-all ${
                mode === "register"
                  ? "bg-sky-500 text-white shadow"
                  : "text-slate-300 hover:text-slate-100"
              }`}
            >
              ثبت‌نام
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {mode === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">نام</label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="مثلاً رضا"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  نام خانوادگی
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="اختیاری"
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                />
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-200">ایمیل</label>
            <div className="relative">
              <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                dir="ltr"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-left"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block font-bold text-slate-200">رمز عبور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                minLength={6}
                dir="ltr"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="حداقل ۶ کاراکتر"
                className="w-full pr-9 pl-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-left"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-98 text-slate-950 font-black text-sm shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>در حال پردازش...</span>
              </>
            ) : (
              <span>
                {mode === "login" ? "ورود به حساب" : "ساخت حساب و ادامه خرید"}
              </span>
            )}
          </button>

          <p className="text-[10px] text-slate-500 text-center">
            اطلاعات شما به صورت امن ذخیره می‌شود و سفارشات به این حساب متصل
            خواهد شد.
          </p>
        </form>
      </div>
    </div>
  );
};
