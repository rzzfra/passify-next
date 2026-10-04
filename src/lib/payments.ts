import { db } from "./db";
import { setting } from "./data";
import { sendOrderToAdmin } from "./telegram";
export type PaymentResult = { success: boolean; paymentUrl?: string; authority?: string; error?: string };
const appUrl = (requestOrigin: string) => (process.env.APP_URL || requestOrigin).replace(/\/$/, "");
const postJson = async (url: string, body: unknown) => { const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }); return await res.json(); };
export async function finalizeOrder(orderId: string, refId: string) {
  const claimed = await db.order.updateMany({ where: { id: orderId, status: "pending_payment" }, data: { status: "paid_processing", paymentRef: refId, updatedAt: BigInt(Date.now()) } });
  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order || claimed.count === 0) return order;
  const product = await db.product.update({ where: { id: order.productId }, data: { salesCount: { increment: 1 } } }).catch(() => null);
  const user = order.userId ? await db.user.findUnique({ where: { id: order.userId } }) : null;
  await sendOrderToAdmin(order, product, user);
  return order;
}
export async function createPayment(order: any, description: string, returnUrl: string, requestOrigin: string): Promise<PaymentResult> {
  const mode = await setting("PAYMENT_MODE", "sandbox");
  const backend = appUrl(requestOrigin);
  if (mode === "zarinpal") {
    const merchant = await setting("ZARINPAL_MERCHANT_ID"); if (!merchant) return { success: false, error: "مرچنت زرین‌پال تنظیم نشده است." };
    const callback = `${backend}/api/payment/zarinpal/callback?orderId=${encodeURIComponent(order.id)}&frontend=${encodeURIComponent(returnUrl)}`;
    const data = await postJson(`${"https" + "://"}payment.zarinpal.com/pg/v4/payment/request.json`, { merchant_id: merchant, amount: order.amount * 10, description, callback_url: callback });
    if (data?.data?.code === 100 && data.data.authority) { const authority = data.data.authority; await db.order.update({ where: { id: order.id }, data: { paymentRef: authority } }); return { success: true, authority, paymentUrl: `${"https" + "://"}payment.zarinpal.com/pg/StartPay/${authority}` }; }
    return { success: false, error: "ساخت تراکنش زرین‌پال ناموفق بود." };
  }
  if (mode === "nextpay") {
    const key = await setting("NEXTPAY_API_KEY"); if (!key) return { success: false, error: "کلید نکست‌پی تنظیم نشده است." };
    const callback = `${backend}/api/payment/nextpay/callback?orderId=${encodeURIComponent(order.id)}&frontend=${encodeURIComponent(returnUrl)}`;
    const data = await postJson(`${"https" + "://"}nextpay.org/nx/db/token`, { api_key: key, order_id: order.id, amount: order.amount, currency: "IRT", callback_uri: callback });
    if (data?.code === -1 && data.trans_id) { const authority = String(data.trans_id); await db.order.update({ where: { id: order.id }, data: { paymentRef: authority } }); return { success: true, authority, paymentUrl: `${"https" + "://"}nextpay.org/nx/db/payment/${authority}` }; }
    return { success: false, error: data?.message || "ساخت تراکنش نکست‌پی ناموفق بود." };
  }
  if (mode === "zibal") {
    const merchant = await setting("ZIBAL_MERCHANT_ID", "zibal");
    const callback = `${backend}/api/payment/zibal/callback?orderId=${encodeURIComponent(order.id)}&frontend=${encodeURIComponent(returnUrl)}`;
    const data = await postJson(`${"https" + "://"}gateway.zibal.ir/v1/request`, { merchant, amount: order.amount * 10, callbackUrl: callback, description, orderId: order.id });
    if (data?.result === 100 && data.trackId) { const authority = String(data.trackId); await db.order.update({ where: { id: order.id }, data: { paymentRef: authority } }); return { success: true, authority, paymentUrl: `${"https" + "://"}gateway.zibal.ir/start/${authority}` }; }
    return { success: false, error: data?.message || `خطای زیبال (${data?.result || "نامشخص"})` };
  }
  const authority = `MOCK-${Date.now()}`;
  await db.order.update({ where: { id: order.id }, data: { paymentRef: authority } });
  return { success: true, authority, paymentUrl: `${backend}/api/payment/mock-gateway?orderId=${encodeURIComponent(order.id)}&amount=${order.amount}&authority=${authority}&callback=${encodeURIComponent(returnUrl)}` };
}
export async function verifyZarinpal(orderId: string, authority: string) {
  const order = await db.order.findUnique({ where: { id: orderId } }); if (!order) return false;
  const merchant = await setting("ZARINPAL_MERCHANT_ID"); const data = await postJson(`${"https" + "://"}payment.zarinpal.com/pg/v4/payment/verify.json`, { merchant_id: merchant, amount: order.amount * 10, authority });
  if ([100,101].includes(data?.data?.code)) { await finalizeOrder(orderId, String(data.data.ref_id || authority)); return true; } return false;
}
export async function verifyNextpay(orderId: string, transId: string) {
  const order = await db.order.findUnique({ where: { id: orderId } }); if (!order) return false;
  const key = await setting("NEXTPAY_API_KEY"); const data = await postJson(`${"https" + "://"}nextpay.org/nx/db/verify`, { api_key: key, trans_id: transId, amount: order.amount, currency: "IRT" });
  if (data?.code === 0) { await finalizeOrder(orderId, String(data.Shaparak_Ref_Id || transId)); return true; } return false;
}
export async function verifyZibal(orderId: string, trackId: string) {
  const merchant = await setting("ZIBAL_MERCHANT_ID", "zibal"); const data = await postJson(`${"https" + "://"}gateway.zibal.ir/v1/verify`, { merchant, trackId: /^\d+$/.test(trackId) ? Number(trackId) : trackId });
  if ([100,201].includes(data?.result)) { await finalizeOrder(orderId, String(data.refNumber || trackId)); return true; } return false;
}
