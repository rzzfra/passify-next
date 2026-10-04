import React, { useState } from "react";
import {
  Lock,
  User,
  ArrowLeft,
  KeyRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { apiRequest } from "../utils/api";
import type { AdminUser } from "../types";

interface AdminLoginProps {
  onLoginSuccess: (token: string, user: AdminUser) => void;
  onBackToStore: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({
  onLoginSuccess,
  onBackToStore,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("لطفاً نام کاربری و رمز عبور را وارد کنید.");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await apiRequest<{ token: string; user: AdminUser }>(
      "/api/auth/login",
      {
        method: "POST",
        body: JSON.stringify({ username, password }),
      },
    );

    setLoading(false);

    if (res.success && res.data) {
      onLoginSuccess(res.data.token, res.data.user);
    } else {
      setError(res.error || "نام کاربری یا رمز عبور اشتباه است.");
    }
  };

  return (
    <div className="app-surface flex min-h-screen items-center justify-center bg-slate-900 p-4 font-vazir text-slate-100">
      <div className="w-full max-w-sm">
        <div className="mb-7 flex items-center justify-between">
          <button type="button" onClick={onBackToStore} className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 transition hover:text-sky-400">
            <ArrowLeft className="h-4 w-4" /> بازگشت به فروشگاه
          </button>
          <span className="text-[10px] text-slate-500">ورود امن مدیریت</span>
        </div>

        <div className="rounded-2xl border border-slate-700/50 bg-slate-800/35 p-6 shadow-xl sm:p-8">
          <div className="mb-7">
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-base font-black text-slate-900">P</span>
            <h1 className="text-xl font-black text-slate-100">خوش آمدید</h1>
            <p className="mt-1.5 text-[11px] leading-5 text-slate-500">برای مدیریت محصولات و سفارش‌ها وارد حساب ادمین شوید.</p>
          </div>

          {error && <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-[11px] text-rose-400"><KeyRound className="h-4 w-4 shrink-0" /><span>{error}</span></div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="admin-username" className="mb-1.5 block text-[11px] font-bold text-slate-300">نام کاربری</label>
              <div className="relative"><User className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input id="admin-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" placeholder="نام کاربری ادمین" className="h-11 w-full rounded-xl border border-slate-700/60 bg-slate-900/50 pl-4 pr-10 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10" required /></div>
            </div>
            <div>
              <label htmlFor="admin-password" className="mb-1.5 block text-[11px] font-bold text-slate-300">رمز عبور</label>
              <div className="relative"><Lock className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" /><input id="admin-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" placeholder="رمز عبور" className="h-11 w-full rounded-xl border border-slate-700/60 bg-slate-900/50 px-10 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10" required /><button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-200" aria-label={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div>
            </div>
            <button type="submit" disabled={loading} className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-black text-white transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> : "ورود به پنل"}
            </button>
          </form>
        </div>
        <p className="mt-4 text-center text-[9px] leading-5 text-slate-600">اطلاعات ورود پیش‌فرض در رابط کاربری نمایش داده نمی‌شود. رمز ادمین را پس از راه‌اندازی تغییر دهید.</p>
      </div>
    </div>
  );
};
