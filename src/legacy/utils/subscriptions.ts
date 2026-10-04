import type { Order, Subscription } from "../types";

// تخمین مدت اشتراک بر اساس نام پلن
function estimatePlanDays(planName: string): number {
  if (/سالانه|سال|۱2|12/.test(planName)) return 365;
  if (/۶|6\s*ماه/.test(planName)) return 180;
  if (/۳|3\s*ماه/.test(planName)) return 90;
  return 30;
}

// فرمت تاریخ شمسی از ISO
export function formatDateFa(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("fa-IR");
  } catch {
    return "—";
  }
}

// حدس آیکون سرویس بر اساس نام محصول
function guessServiceIcon(title: string): string {
  const t = title.toLowerCase();
  if (t.includes("spotify") || t.includes("اسپاتیفای") || t.includes("موسیقی") || t.includes("music")) return "Music";
  if (t.includes("telegram") || t.includes("تلگرام")) return "Send";
  if (t.includes("chatgpt") || t.includes("claude") || t.includes("gpt") || t.includes("هوش مصنوعی") || t.includes("cursor") || t.includes("copilot")) return "Bot";
  return "CreditCard";
}

// ساخت اشتراک‌های فعال کاربر از روی سفارشات واقعی (به‌جای دیتای ماک)
// ⚠️ فقط سفارشات «تکمیل شده» توسط ادمین به اشتراک فعال تبدیل می‌شوند؛
// سفارشات پرداخت‌شده (paid_processing) تا زمان تایید ادمین اشتراک محسوب نمی‌شوند.
export function deriveSubscriptions(
  orders: Order[],
  accountLabel?: string,
): Subscription[] {
  const DAY_MS = 24 * 60 * 60 * 1000;

  return orders
    .filter((o) => o.status === "completed")
    .map((o) => {
      const totalDays = estimatePlanDays(o.planName || o.plan || "");
      const createdIso = o.createdAt || o.date || null;
      const createdMs = createdIso ? new Date(createdIso).getTime() : Date.now();
      const daysLeft = Math.max(
        0,
        Math.ceil((createdMs + totalDays * DAY_MS - Date.now()) / DAY_MS),
      );

      return {
        id: `sub-${o.id}`,
        serviceName: o.productTitle || o.product?.title || "سرویس خریداری‌شده",
        plan: o.planName || o.plan || "پلن استاندارد",
        accountEmail: accountLabel || "—",
        purchaseDate: formatDateFa(createdIso),
        expireDate: formatDateFa(new Date(createdMs + totalDays * DAY_MS).toISOString()),
        daysLeft,
        totalDays,
        status: daysLeft <= 3 ? ("expiring" as const) : ("active" as const),
        icon: guessServiceIcon(o.productTitle || o.product?.title || ""),
      };
    })
    .filter((sub) => sub.daysLeft > 0);
}
