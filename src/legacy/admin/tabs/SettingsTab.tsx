import React, { useState, useEffect } from "react";
import { Send, CreditCard, Lock, Check, Save } from "lucide-react";
import { apiRequest } from "../../utils/api";
import type { AdminSettings } from "../../types";

interface SettingsTabProps {
  token: string;
}

export const SettingsTab: React.FC<SettingsTabProps> = ({ token }) => {
  const [settings, setSettings] = useState<AdminSettings>({
    TELEGRAM_BOT_TOKEN: "",
    TELEGRAM_ADMIN_CHANNEL: "",
    ZARINPAL_MERCHANT_ID: "",
    NEXTPAY_API_KEY: "",
    ZIBAL_MERCHANT_ID: "zibal",
    PAYMENT_MODE: "sandbox",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // تغییر رمز عبور
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const res = await apiRequest<{ settings: AdminSettings }>(
        "/api/admin/settings",
        { token },
      );
      if (res.success && res.data) {
        setSettings(res.data.settings);
      }
      setLoading(false);
    };

    fetchSettings();
  }, [token]);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    const res = await apiRequest("/api/admin/settings", {
      method: "POST",
      token,
      body: JSON.stringify(settings),
    });

    setSaving(false);
    if (res.success) {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } else {
      alert(res.error || "خطا در ذخیره تنظیمات");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword.length < 6) {
      setPasswordError("رمز جدید باید حداقل ۶ کاراکتر باشد.");
      return;
    }

    const res = await apiRequest("/api/admin/change-password", {
      method: "POST",
      token,
      body: JSON.stringify({ currentPassword, newPassword }),
    });

    if (res.success) {
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setTimeout(() => setPasswordSuccess(false), 4000);
    } else {
      setPasswordError(res.error || "خطا در تغییر رمز عبور");
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-xs text-slate-400">
        در حال بارگذاری تنظیمات...
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      {/* بخش ۱: تنظیم اعلان خرید تلگرام */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Send className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              اعلان خرید در کانال مدیریت
            </h3>
            <p className="text-[11px] text-slate-400">
              پس از پرداخت موفق، فقط یک اعلان خلاصه خرید برای مدیر ارسال می‌شود
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              توکن ربات اعلان خرید
            </label>
            <input
              type="text"
              value={settings.TELEGRAM_BOT_TOKEN}
              onChange={(e) =>
                setSettings({ ...settings, TELEGRAM_BOT_TOKEN: e.target.value })
              }
              placeholder="مثلاً 789123456:AAFlK..."
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              این توکن را از BotFather@ دریافت کرده‌اید.
            </span>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              شناسه کانال اعلان خرید
            </label>
            <input
              type="text"
              value={settings.TELEGRAM_ADMIN_CHANNEL}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  TELEGRAM_ADMIN_CHANNEL: e.target.value,
                })
              }
              placeholder="مثلاً 1001987654321- یا my_orders_channel@"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              ربات را به کانال اضافه کنید؛ هیچ پیام یا دکمه‌ای برای مشتری ارسال نمی‌شود.
            </span>
          </div>
        </div>
      </div>

      {/* بخش ۲: درگاه پرداخت شتابی و تستی */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <CreditCard className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              پیکربندی درگاه‌های پرداخت
            </h3>
            <p className="text-[11px] text-slate-400">
              انتخاب درگاه پرداخت فعال فروشگاه (زرین‌پال، نکست‌پی، زیبال یا
              شبیه‌ساز تستی)
            </p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-2">
              درگاه پرداخت فعال فروشگاه:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* شبیه‌ساز تستی */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  settings.PAYMENT_MODE === "sandbox"
                    ? "bg-amber-500/15 border-amber-500/50 text-amber-300 ring-1 ring-amber-500/30"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={settings.PAYMENT_MODE === "sandbox"}
                  onChange={() =>
                    setSettings({ ...settings, PAYMENT_MODE: "sandbox" })
                  }
                  className="hidden"
                />
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                  {settings.PAYMENT_MODE === "sandbox" && (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs block">
                      🧪 درگاه تستی (Sandbox)
                    </span>
                    {settings.PAYMENT_MODE === "sandbox" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold">
                        فعال
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    شبیه‌ساز ۱۰۰٪ پرداخت بدون نیاز به کارت واقعی
                  </span>
                </div>
              </label>

              {/* زرین‌پال */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  settings.PAYMENT_MODE === "zarinpal"
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 ring-1 ring-emerald-500/30"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={settings.PAYMENT_MODE === "zarinpal"}
                  onChange={() =>
                    setSettings({ ...settings, PAYMENT_MODE: "zarinpal" })
                  }
                  className="hidden"
                />
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                  {settings.PAYMENT_MODE === "zarinpal" && (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs block">
                      🟡 درگاه زرین‌پال (ZarinPal)
                    </span>
                    {settings.PAYMENT_MODE === "zarinpal" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                        فعال
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    درگاه پرداخت آنلاین شتابی رسمی زرین‌پال
                  </span>
                </div>
              </label>

              {/* نکست‌پی */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  settings.PAYMENT_MODE === "nextpay"
                    ? "bg-sky-500/15 border-sky-500/50 text-sky-300 ring-1 ring-sky-500/30"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={settings.PAYMENT_MODE === "nextpay"}
                  onChange={() =>
                    setSettings({ ...settings, PAYMENT_MODE: "nextpay" })
                  }
                  className="hidden"
                />
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                  {settings.PAYMENT_MODE === "nextpay" && (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs block">
                      🔵 درگاه نکست‌پی (NextPay)
                    </span>
                    {settings.PAYMENT_MODE === "nextpay" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-sky-500/20 text-sky-300 font-bold">
                        فعال
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    پرداخت‌یار نکست‌پی با پشتیبانی از سوئیچ هوشمند شاپرک
                  </span>
                </div>
              </label>

              {/* زیبال */}
              <label
                className={`p-3 rounded-xl border cursor-pointer flex items-center gap-2.5 transition-all ${
                  settings.PAYMENT_MODE === "zibal"
                    ? "bg-indigo-500/15 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30"
                    : "bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={settings.PAYMENT_MODE === "zibal"}
                  onChange={() =>
                    setSettings({ ...settings, PAYMENT_MODE: "zibal" })
                  }
                  className="hidden"
                />
                <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center shrink-0">
                  {settings.PAYMENT_MODE === "zibal" && (
                    <span className="w-2 h-2 rounded-full bg-current" />
                  )}
                </span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs block">
                      🟢 درگاه زیبال (Zibal)
                    </span>
                    {settings.PAYMENT_MODE === "zibal" && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-bold">
                        فعال
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    درگاه پرداخت زیبال با تسویه سریع و حالت تستی
                  </span>
                </div>
              </label>
            </div>
          </div>

          {/* فیلدهای اختصاصی کلیدها */}
          <div className="grid grid-cols-1 gap-3.5 pt-2 border-t border-slate-800">
            {/* زرین‌پال */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${settings.PAYMENT_MODE === "zarinpal" ? "bg-emerald-500/5 border-emerald-500/30" : "bg-slate-850/50 border-slate-800"}`}
            >
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>کد مرچنت زرین‌پال (ZarinPal Merchant ID)</span>
                {settings.PAYMENT_MODE === "zarinpal" && (
                  <span className="text-[10px] text-emerald-400 font-bold">
                    درگاه انتخابی فعلی
                  </span>
                )}
              </label>
              <input
                type="text"
                value={settings.ZARINPAL_MERCHANT_ID || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ZARINPAL_MERCHANT_ID: e.target.value,
                  })
                }
                placeholder="مثلاً xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                مرچنت کد ۳۶ رقمی دریافت‌شده از پنل زرین‌پال
              </span>
            </div>

            {/* نکست‌پی */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${settings.PAYMENT_MODE === "nextpay" ? "bg-sky-500/5 border-sky-500/30" : "bg-slate-850/50 border-slate-800"}`}
            >
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>کلید اختصاصی API نکست‌پی (NextPay API Key)</span>
                {settings.PAYMENT_MODE === "nextpay" && (
                  <span className="text-[10px] text-sky-400 font-bold">
                    درگاه انتخابی فعلی
                  </span>
                )}
              </label>
              <input
                type="text"
                value={settings.NEXTPAY_API_KEY || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    NEXTPAY_API_KEY: e.target.value,
                  })
                }
                placeholder="مثلاً xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-sky-500/50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                کلید API اختصاصی ایجاد شده در پنل کاربری نکست‌پی
              </span>
            </div>

            {/* زیبال */}
            <div
              className={`p-3.5 rounded-xl border transition-all ${settings.PAYMENT_MODE === "zibal" ? "bg-indigo-500/5 border-indigo-500/30" : "bg-slate-850/50 border-slate-800"}`}
            >
              <label className="block font-bold text-slate-300 mb-1 flex items-center justify-between">
                <span>کد مرچنت زیبال (Zibal Merchant ID)</span>
                {settings.PAYMENT_MODE === "zibal" && (
                  <span className="text-[10px] text-indigo-400 font-bold">
                    درگاه انتخابی فعلی
                  </span>
                )}
              </label>
              <input
                type="text"
                value={settings.ZIBAL_MERCHANT_ID || ""}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    ZIBAL_MERCHANT_ID: e.target.value,
                  })
                }
                placeholder="کد مرچنت شما (یا zibal برای تست)"
                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                برای حالت تستی و آزمایش درگاه زیبال، می‌توانید کلمه{" "}
                <code className="text-indigo-300">zibal</code> را قرار دهید.
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          {saveSuccess && (
            <span className="text-emerald-400 font-bold text-xs flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>تنظیمات با موفقیت ذخیره شدند!</span>
            </span>
          )}
          <button
            type="button"
            disabled={saving}
            onClick={handleSaveSettings}
            className="mr-auto flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-lg shadow-sky-500/20"
          >
            <Save className="w-4 h-4" />
            <span>
              {saving ? "در حال ذخیره..." : "ذخیره تنظیمات فروشگاه"}
            </span>
          </button>
        </div>
      </div>

      {/* بخش ۳: تغییر رمز عبور ادمین */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">
              تغییر کلمه عبور ورود به پنل ادمین
            </h3>
            <p className="text-[11px] text-slate-400">
              افزایش امنیت دسترسی به داشبورد مستقل وب
            </p>
          </div>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
            {passwordError}
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            <span>کلمه عبور با موفقیت به‌روزرسانی شد.</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              کلمه عبور فعلی
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              کلمه عبور جدید (حداقل ۶ کاراکتر)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold border border-slate-700 transition-colors"
            >
              به‌روزرسانی رمز عبور
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
