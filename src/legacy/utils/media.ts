import { API_BASE } from "./config";

const ABSOLUTE_URL = /^(https?:)?\/\//i;
const LOCAL_URL = /^(data:|blob:)/i;

/**
 * آدرس نسبی سرویس‌شده از بک‌اند (مثل «/uploads/xxx» یا «/api/...») را
 * به آدرس کامل بک‌اند تبدیل می‌کند تا وقتی فرانت روی دامنه/پورت دیگری
 * از بک‌اند اجرا می‌شود هم درست کار کند.
 * آدرس‌های مطلق و data/blob دست‌نخورده برمی‌گردند.
 */
export function resolveBackendUrl(url?: string | null): string {
  if (!url) return "";
  if (ABSOLUTE_URL.test(url) || LOCAL_URL.test(url)) return url;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}
