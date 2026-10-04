import { db } from "./db";
export const now = () => BigInt(Date.now());
export function parseJson<T>(value: string | null | undefined, fallback: T): T { try { return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
export function jsonSafe<T>(value: T): T { return JSON.parse(JSON.stringify(value, (_, item) => typeof item === "bigint" ? Number(item) : item)); }
export function productDto(product: any) { return jsonSafe({ ...product, features: parseJson(product.features, []), plans: parseJson(product.plans, []), customFields: parseJson(product.customFields, []), tags: parseJson(product.tags, []) }); }
export async function orderDto(order: any) {
  const [product, user] = await Promise.all([
    db.product.findUnique({ where: { id: order.productId } }),
    order.userId ? db.user.findUnique({ where: { id: order.userId } }) : null,
  ]);
  return jsonSafe({ ...order, product: product ? productDto(product) : null, user: user ? { ...user, password: undefined } : null });
}
export async function setting(key: string, fallback = "") { return (await db.setting.findUnique({ where: { key } }))?.value || process.env[key] || fallback; }
export function randomId(prefix: string) { return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`; }
