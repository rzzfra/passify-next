import { setting } from "./data";
const callTelegram = async (method: string, payload: unknown) => {
  const token = await setting("TELEGRAM_BOT_TOKEN");
  if (!token) return null;
  try { const response = await fetch(`${"https" + "://"}api.telegram.org/bot${token}/${method}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) }); return await response.json(); } catch { return null; }
};
export async function sendOrderToAdmin(order: any, product: any, user: any) {
  const channel = await setting("TELEGRAM_ADMIN_CHANNEL"); if (!channel) return null;
  const details = Object.entries(JSON.parse(order.customerData || "{}")).map(([key,value]) => `▫️ <b>${key}:</b> <code>${value}</code>`).join("\n") || "▫️ بدون اطلاعات تکمیلی";
  const text = `🛒 <b>خرید جدید در فروشگاه</b>\n━━━━━━━━━━━━━━━━━\n📦 <b>محصول:</b> ${product?.title || ""}\n🧾 <b>پلن:</b> ${order.planName}\n💰 <b>مبلغ:</b> ${Number(order.amount).toLocaleString("fa-IR")} تومان\n🔖 <b>سفارش:</b> <code>${order.id}</code>\n👤 <b>مشتری:</b> ${user?.email || "مشتری فروشگاه"}\n\n${details}`;
  const result = await callTelegram("sendMessage", { chat_id: channel, text, parse_mode: "HTML" });
  return result?.ok ? Number(result.result.message_id) : null;
}
