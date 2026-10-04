export function toPersianDigits(n: number | string): string {
  const digits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(n).replace(/\d/g, (x) => digits[Number(x)]);
}
export function formatPrice(price: number): string {
  return `${toPersianDigits(price.toLocaleString("en-US").replace(/,/g, "٬"))} تومان`;
}
export function triggerHaptic(type: "light" | "medium" | "heavy" | "selection" | "success" | "warning" | "error" = "light"): void {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  const patterns: Record<string, number | number[]> = { light: 8, medium: 15, heavy: 25, selection: 6, success: [8, 30, 12], warning: [15, 30, 15], error: [22, 30, 22] };
  navigator.vibrate(patterns[type] || 8);
}
