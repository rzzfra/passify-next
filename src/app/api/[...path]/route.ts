import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { db } from "@/lib/db";
import {
  ApiError,
  bearer,
  decodeToken,
  hashPassword,
  requireAdmin,
  requireWebUser,
  signToken,
  verifyPassword,
} from "@/lib/auth";
import {
  jsonSafe,
  now,
  orderDto,
  parseJson,
  productDto,
  randomId,
  setting,
} from "@/lib/data";
import {
  createPayment,
  finalizeOrder,
  verifyNextpay,
  verifyZarinpal,
  verifyZibal,
} from "@/lib/payments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ path: string[] }> };
const ok = (data: Record<string, unknown> = {}) =>
  NextResponse.json({ success: true, ...jsonSafe(data) });
const fail = (error: string, status = 400) =>
  NextResponse.json({ success: false, error }, { status });
const body = async (request: Request) => request.json().catch(() => ({}));
const redirectTo = (base: string, values: Record<string, string>) => {
  const url = new URL(base);
  Object.entries(values).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url, 303);
};
const productWithCategory = async (product: any) => ({
  ...productDto(product),
  category: await db.category.findUnique({ where: { id: product.categoryId } }),
});

async function publicRoutes(
  request: NextRequest,
  route: string,
  method: string,
) {
  if (route === "client/bootstrap" && method === "GET") {
    const [categories, products, posts, paymentMode] = await Promise.all([
      db.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
      }),
      db.product.findMany({
        where: { isActive: true },
        orderBy: { createdAt: "desc" },
      }),
      db.post.findMany({
        where: { isPublished: true },
        orderBy: { createdAt: "desc" },
      }),
      setting("PAYMENT_MODE", "sandbox"),
    ]);
    return ok({
      categories,
      products: products.map(productDto),
      posts: posts.map((p) => ({
        ...jsonSafe(p),
        tags: parseJson(p.tags, []),
      })),
      activeGateway: paymentMode,
    });
  }
  if (route === "client/posts" && method === "GET") {
    const posts = await db.post.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      posts: posts.map((p) => ({
        ...jsonSafe(p),
        tags: parseJson(p.tags, []),
      })),
    });
  }
  if (route.startsWith("client/posts/") && method === "GET") {
    const id = decodeURIComponent(route.slice(13));
    const post = await db.post.findFirst({
      where: { OR: [{ id }, { slug: id }], isPublished: true },
    });
    if (!post) return fail("مقاله یافت نشد.", 404);
    await db.post.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    });
    return ok({
      post: {
        ...jsonSafe(post),
        views: post.views + 1,
        tags: parseJson(post.tags, []),
      },
    });
  }
  if (route === "client/checkout" && method === "POST") {
    const input = await body(request);
    const product = await db.product.findUnique({
      where: { id: String(input.productId || "") },
    });
    if (!product?.isActive || !input.webToken)
      return fail("برای خرید وارد حساب فروشگاه شوید.", 401);
    const token = await decodeToken(String(input.webToken));
    if (!token?.userId) return fail("نشست شما منقضی شده است.", 401);
    const user = await db.user.findUnique({
      where: { id: Number(token.userId) },
    });
    const telegramId: string | null = null;
    if (!user) return fail("حساب کاربری یافت نشد.", 401);
    const plans = parseJson<any[]>(product.plans, []);
    const selectedPlan = plans.find((p) => p.name === input.planName);
    const amount = Number(selectedPlan?.price ?? product.price);
    let id = randomId("WB");
    while (await db.order.findUnique({ where: { id } })) id = randomId("WB");
    const order = await db.order.create({
      data: {
        id,
        userId: user.id,
        telegramId,
        productId: product.id,
        planName: String(input.planName || "استاندارد"),
        amount,
        status: "pending_payment",
        paymentRef: null,
        customerData: JSON.stringify(input.customerData || {}),
        licenseKey: null,
        telegramMessageId: null,
        createdAt: now(),
        updatedAt: now(),
      },
    });
    const frontend = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
    const returnUrl = `${frontend}/?payment=return&orderId=${id}`;
    try {
      const payment = await createPayment(
        order,
        `خرید ${product.title} (${order.planName})`,
        returnUrl,
        request.nextUrl.origin,
      );
      if (!payment.success || !payment.paymentUrl) {
        await db.order.update({ where: { id }, data: { status: "cancelled" } });
        return fail(payment.error || "ساخت لینک پرداخت ناموفق بود.", 502);
      }
      return ok({ orderId: id, paymentUrl: payment.paymentUrl });
    } catch {
      await db.order.update({ where: { id }, data: { status: "cancelled" } });
      return fail("اتصال به درگاه پرداخت ناموفق بود.", 502);
    }
  }
  if (route === "client/web-orders" && method === "GET") {
    const user = await requireWebUser(request);
    const orders = await db.order.findMany({
      where: { userId: Number(user.userId) },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders: await Promise.all(orders.map(orderDto)) });
  }
  if (/^client\/order\//.test(route) && method === "GET") {
    const order = await db.order.findUnique({
      where: { id: decodeURIComponent(route.slice("client/order/".length)) },
    });
    return order
      ? ok({ order: await orderDto(order) })
      : fail("سفارش یافت نشد.", 404);
  }
  return null;
}

async function authRoutes(request: NextRequest, route: string, method: string) {
  if (route === "auth/login" && method === "POST") {
    const input = await body(request);
    const admin = await db.adminUser.findUnique({
      where: {
        username: String(input.username || "")
          .trim()
          .toLowerCase(),
      },
    });
    if (
      !admin ||
      !(await verifyPassword(String(input.password || ""), admin.password))
    )
      return fail("نام کاربری یا رمز عبور اشتباه است.", 401);
    const user = {
      userId: admin.id,
      username: admin.username,
      name: admin.name,
      role: admin.role,
    };
    return ok({ token: await signToken(user, 7 * 86400), user });
  }
  if (route === "auth/me" && method === "GET") {
    const admin = await requireAdmin(request);
    return ok({ user: admin });
  }
  if (route === "web-auth/register" && method === "POST") {
    const input = await body(request);
    const email = String(input.email || "")
      .trim()
      .toLowerCase();
    const password = String(input.password || "");
    if (!email || password.length < 6)
      return fail("ایمیل معتبر و رمز حداقل ۶ کاراکتری الزامی است.");
    if (await db.user.findUnique({ where: { email } }))
      return fail("این ایمیل قبلاً ثبت شده است.", 409);
    const user = await db.user.create({
      data: {
        email,
        password: await hashPassword(password),
        authProvider: "web",
        telegramId: null,
        username: email.split("@")[0],
        firstName: String(input.firstName || "").trim() || null,
        lastName: String(input.lastName || "").trim() || null,
        photoUrl: null,
        createdAt: now(),
      },
    });
    const info = {
      id: user.id,
      email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return ok({
      token: await signToken(
        { userId: user.id, email, firstName: user.firstName },
        30 * 86400,
      ),
      user: info,
    });
  }
  if (route === "web-auth/login" && method === "POST") {
    const input = await body(request);
    const email = String(input.email || "")
      .trim()
      .toLowerCase();
    const user = await db.user.findUnique({ where: { email } });
    if (
      !user ||
      !(await verifyPassword(String(input.password || ""), user.password))
    )
      return fail("ایمیل یا رمز عبور اشتباه است.", 401);
    const info = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return ok({
      token: await signToken(
        { userId: user.id, email: user.email, firstName: user.firstName },
        30 * 86400,
      ),
      user: info,
    });
  }
  if (route === "web-auth/me" && method === "GET") {
    const session = await requireWebUser(request);
    const user = await db.user.findUnique({
      where: { id: Number(session.userId) },
    });
    if (!user) return fail("کاربر یافت نشد.", 404);
    return ok({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
      },
    });
  }
  if (route === "web-auth/profile" && method === "PUT") {
    const session = await requireWebUser(request);
    const input = await body(request);
    const user = await db.user.update({
      where: { id: Number(session.userId) },
      data: {
        firstName: String(input.firstName || "").trim() || null,
        lastName: String(input.lastName || "").trim() || null,
      },
    });
    return ok({
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    });
  }
  if (route === "web-auth/password" && method === "PUT") {
    const session = await requireWebUser(request);
    const input = await body(request);
    const user = await db.user.findUnique({
      where: { id: Number(session.userId) },
    });
    if (
      !user ||
      !(await verifyPassword(
        String(input.currentPassword || ""),
        user.password,
      ))
    )
      return fail("رمز عبور فعلی نادرست است.");
    if (String(input.newPassword || "").length < 6)
      return fail("رمز جدید کوتاه است.");
    await db.user.update({
      where: { id: user.id },
      data: { password: await hashPassword(String(input.newPassword)) },
    });
    return ok();
  }
  return null;
}

async function adminRoutes(
  request: NextRequest,
  route: string,
  method: string,
) {
  if (!route.startsWith("admin/")) return null;
  const admin = await requireAdmin(request);
  const demoScope = admin.role === "demo" ? { isDemo: true } : {};
  const sub = route.slice(6);
  if (sub === "dashboard" && method === "GET") {
    const [orders, pending, productsCount, usersCount, recent] =
      await Promise.all([
        db.order.findMany({
          where: {
            ...demoScope,
            status: { in: ["paid_processing", "completed"] },
          },
          select: { amount: true },
        }),
        db.order.count({ where: { ...demoScope, status: "paid_processing" } }),
        db.product.count(),
        db.user.count({ where: { authProvider: "web", ...demoScope } }),
        db.order.findMany({
          where: demoScope,
          orderBy: { createdAt: "desc" },
          take: 6,
        }),
      ]);
    return ok({
      stats: {
        totalSalesAmount: orders.reduce((s, o) => s + o.amount, 0),
        totalOrdersCount: orders.length,
        pendingOrdersCount: pending,
        productsCount,
        usersCount,
      },
      recentOrders: await Promise.all(recent.map(orderDto)),
    });
  }
  if (sub === "products" && method === "GET") {
    const rows = await db.product.findMany({ orderBy: { createdAt: "desc" } });
    return ok({ products: await Promise.all(rows.map(productWithCategory)) });
  }
  if (sub === "products" && method === "POST") {
    const i = await body(request);
    const id = String(i.id || `product-${Date.now()}`);
    const row = await db.product.create({
      data: {
        id,
        title: String(i.title || ""),
        subtitle: String(i.subtitle || ""),
        categoryId: String(i.categoryId || ""),
        price: Number(i.price || 0),
        originalPrice: i.originalPrice ? Number(i.originalPrice) : null,
        discountPercent: i.discountPercent ? Number(i.discountPercent) : null,
        image: String(i.image || ""),
        badge: i.badge || null,
        rating: Number(i.rating || 5),
        salesCount: Number(i.salesCount || 0),
        description: String(i.description || ""),
        features: JSON.stringify(i.features || []),
        plans: JSON.stringify(i.plans || []),
        customFields: JSON.stringify(i.customFields || []),
        tags: JSON.stringify(i.tags || []),
        isActive: i.isActive !== false,
        createdAt: now(),
      },
    });
    return ok({ product: await productWithCategory(row) });
  }
  const productMatch = sub.match(/^products\/([^/]+)(?:\/(toggle))?$/);
  if (productMatch) {
    const id = decodeURIComponent(productMatch[1]);
    if (method === "DELETE") {
      await db.product.delete({ where: { id } });
      return ok();
    }
    if (method === "PATCH" && productMatch[2]) {
      const old = await db.product.findUnique({ where: { id } });
      if (!old) return fail("محصول یافت نشد.", 404);
      return ok({
        product: productDto(
          await db.product.update({
            where: { id },
            data: { isActive: !old.isActive },
          }),
        ),
      });
    }
    if (method === "PUT") {
      const i = await body(request);
      const data: any = { ...i };
      ["features", "plans", "customFields", "tags"].forEach((k) => {
        if (k in data) data[k] = JSON.stringify(data[k] || []);
      });
      [
        "price",
        "originalPrice",
        "discountPercent",
        "rating",
        "salesCount",
      ].forEach((k) => {
        if (k in data)
          data[k] = data[k] === null || data[k] === "" ? null : Number(data[k]);
      });
      delete data.id;
      delete data.category;
      const row = await db.product.update({ where: { id }, data });
      return ok({ product: await productWithCategory(row) });
    }
  }
  if (sub === "categories" && method === "GET") {
    const categories = await db.category.findMany({
      orderBy: { order: "asc" },
    });
    const out = await Promise.all(
      categories.map(async (c) => ({
        ...c,
        _count: {
          products: await db.product.count({ where: { categoryId: c.id } }),
        },
      })),
    );
    return ok({ categories: out });
  }
  if (sub === "categories" && method === "POST") {
    const i = await body(request);
    const row = await db.category.create({
      data: {
        id: String(i.id || `cat-${Date.now()}`),
        name: String(i.name || ""),
        englishName: i.englishName || null,
        icon: String(i.icon || "Layers"),
        description: i.description || null,
        gradient: i.gradient || null,
        accentColor: i.accentColor || null,
        order: Number(i.order || 0),
        isActive: i.isActive !== false,
      },
    });
    return ok({ category: row });
  }
  const categoryMatch = sub.match(/^categories\/([^/]+)$/);
  if (categoryMatch) {
    const id = decodeURIComponent(categoryMatch[1]);
    if (method === "DELETE") {
      await db.category.delete({ where: { id } });
      return ok();
    }
    if (method === "PUT") {
      const i = await body(request);
      delete i.id;
      const row = await db.category.update({
        where: { id },
        data: { ...i, order: Number(i.order || 0) },
      });
      return ok({ category: row });
    }
  }
  if (sub === "posts" && method === "GET") {
    const posts = await db.post.findMany({
      where: admin.role === "demo" ? { isPublished: true } : {},
      orderBy: { createdAt: "desc" },
    });
    return ok({
      posts: posts.map((p) => ({
        ...jsonSafe(p),
        tags: parseJson(p.tags, []),
      })),
    });
  }
  if (sub === "posts" && method === "POST") {
    const i = await body(request);
    const stamp = now();
    const row = await db.post.create({
      data: {
        id: String(i.id || `post-${Date.now()}`),
        title: String(i.title || ""),
        slug: String(i.slug || `post-${Date.now()}`),
        summary: String(i.summary || ""),
        content: String(i.content || ""),
        coverImage: String(i.coverImage || ""),
        tags: JSON.stringify(i.tags || []),
        readingTime: String(i.readingTime || "۳ دقیقه"),
        relatedProductId: i.relatedProductId || null,
        views: Number(i.views || 0),
        isPublished: i.isPublished !== false,
        createdAt: stamp,
        updatedAt: stamp,
      },
    });
    return ok({ post: { ...jsonSafe(row), tags: parseJson(row.tags, []) } });
  }
  const postMatch = sub.match(/^posts\/([^/]+)(?:\/(toggle))?$/);
  if (postMatch) {
    const id = decodeURIComponent(postMatch[1]);
    if (method === "DELETE") {
      await db.post.delete({ where: { id } });
      return ok();
    }
    if (method === "PATCH" && postMatch[2]) {
      const old = await db.post.findUnique({ where: { id } });
      if (!old) return fail("مقاله یافت نشد.", 404);
      const row = await db.post.update({
        where: { id },
        data: { isPublished: !old.isPublished, updatedAt: now() },
      });
      return ok({ post: jsonSafe(row) });
    }
    if (method === "PUT") {
      const i = await body(request);
      delete i.id;
      if (i.tags) i.tags = JSON.stringify(i.tags);
      i.updatedAt = now();
      const row = await db.post.update({ where: { id }, data: i });
      return ok({ post: { ...jsonSafe(row), tags: parseJson(row.tags, []) } });
    }
  }
  if (sub === "orders" && method === "GET") {
    const status = request.nextUrl.searchParams.get("status");
    const rows = await db.order.findMany({
      where: {
        ...demoScope,
        ...(status && status !== "all" ? { status } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return ok({ orders: await Promise.all(rows.map(orderDto)) });
  }
  const orderMatch = sub.match(/^orders\/([^/]+)\/(complete|cancel)$/);
  if (orderMatch && method === "PATCH") {
    const id = decodeURIComponent(orderMatch[1]);
    const input = await body(request);
    let order = await db.order.findUnique({ where: { id } });
    if (!order) return fail("سفارش یافت نشد.", 404);
    order = await db.order.update({
      where: { id },
      data:
        orderMatch[2] === "complete"
          ? {
              status: "completed",
              licenseKey: String(input.licenseKey || order.licenseKey || ""),
              updatedAt: now(),
            }
          : { status: "cancelled", updatedAt: now() },
    });
    return ok({ order: jsonSafe(order) });
  }
  if (sub === "users" && method === "GET") {
    const users = await db.user.findMany({
      where: { authProvider: "web", ...demoScope },
      orderBy: { createdAt: "desc" },
    });
    return ok({
      users: await Promise.all(
        users.map(async (u) => ({
          ...jsonSafe(u),
          password: undefined,
          _count: {
            orders: await db.order.count({
              where: { userId: u.id, ...demoScope },
            }),
          },
        })),
      ),
    });
  }
  if (sub === "settings" && method === "GET") {
    const keys = [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_ADMIN_CHANNEL",
      "ZARINPAL_MERCHANT_ID",
      "NEXTPAY_API_KEY",
      "ZIBAL_MERCHANT_ID",
      "PAYMENT_MODE",
    ];
    return ok({
      settings: Object.fromEntries(
        await Promise.all(
          keys.map(async (k) => [
            k,
            admin.role === "demo"
              ? k === "PAYMENT_MODE"
                ? "sandbox"
                : ""
              : await setting(
                  k,
                  k === "PAYMENT_MODE"
                    ? "sandbox"
                    : k === "ZIBAL_MERCHANT_ID"
                      ? "zibal"
                      : "",
                ),
          ]),
        ),
      ),
    });
  }
  if (sub === "settings" && method === "POST") {
    const i = await body(request);
    for (const key of [
      "TELEGRAM_BOT_TOKEN",
      "TELEGRAM_ADMIN_CHANNEL",
      "ZARINPAL_MERCHANT_ID",
      "NEXTPAY_API_KEY",
      "ZIBAL_MERCHANT_ID",
      "PAYMENT_MODE",
    ])
      await db.setting.upsert({
        where: { key },
        create: { key, value: String(i[key] || "") },
        update: { value: String(i[key] || "") },
      });
    return ok({ message: "تنظیمات ذخیره شد." });
  }
  if (sub === "change-password" && method === "POST") {
    const session = await requireAdmin(request);
    const i = await body(request);
    const admin = await db.adminUser.findUnique({
      where: { id: Number(session.userId) },
    });
    if (
      !admin ||
      !(await verifyPassword(String(i.currentPassword || ""), admin.password))
    )
      return fail("رمز فعلی نادرست است.");
    if (String(i.newPassword || "").length < 6)
      return fail("رمز جدید کوتاه است.");
    await db.adminUser.update({
      where: { id: admin.id },
      data: { password: await hashPassword(String(i.newPassword)) },
    });
    return ok();
  }
  return fail("مسیر مدیریت یافت نشد.", 404);
}

async function paymentRoutes(
  request: NextRequest,
  route: string,
  method: string,
) {
  const sub = route.startsWith("payment/")
    ? route.slice(8)
    : route.startsWith("client/")
      ? route.slice(7)
      : route;
  if (sub === "mock-gateway" && method === "GET") {
    const q = request.nextUrl.searchParams;
    const html = `<!doctype html><html lang="fa" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font-family:Tahoma;background:#0f172a;color:#fff;display:grid;place-items:center;min-height:100vh}.box{width:min(90%,420px);background:#1e293b;padding:28px;border-radius:20px;border:1px solid #334155}button{width:100%;padding:12px;border:0;border-radius:12px;margin-top:10px;font-weight:bold}.ok{background:#10b981}.no{background:#f43f5e;color:#fff}</style><div class="box"><h2>درگاه آزمایشی پسیفای</h2><p>مبلغ: ${Number(q.get("amount") || 0).toLocaleString("fa-IR")} تومان</p><form method="post" action="/api/payment/mock-gateway/action"><input type="hidden" name="orderId" value="${q.get("orderId") || ""}"><input type="hidden" name="authority" value="${q.get("authority") || ""}"><input type="hidden" name="callback" value="${q.get("callback") || ""}"><button class="ok" name="action" value="success">پرداخت موفق</button><button class="no" name="action" value="cancel">لغو پرداخت</button></form></div></html>`;
    return new NextResponse(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
  if (sub === "mock-gateway/action" && method === "POST") {
    const f = await request.formData();
    const id = String(f.get("orderId") || "");
    const callback = String(
      f.get("callback") ||
        process.env.NEXT_PUBLIC_APP_URL ||
        request.nextUrl.origin,
    );
    const success = f.get("action") === "success";
    if (success) await finalizeOrder(id, String(f.get("authority") || "MOCK"));
    else
      await db.order
        .update({
          where: { id },
          data: { status: "cancelled", updatedAt: now() },
        })
        .catch(() => null);
    return redirectTo(callback, {
      payment: "return",
      orderId: id,
      status: success ? "success" : "cancelled",
    });
  }
  if (
    ["zarinpal/callback", "nextpay/callback", "zibal/callback"].includes(sub)
  ) {
    const q = request.nextUrl.searchParams;
    const id = q.get("orderId") || "";
    const frontend =
      q.get("frontend") ||
      process.env.NEXT_PUBLIC_APP_URL ||
      request.nextUrl.origin;
    let success = false;
    if (sub.startsWith("zarinpal") && q.get("Status") === "OK")
      success = await verifyZarinpal(id, q.get("Authority") || "");
    if (sub.startsWith("nextpay")) {
      const f = method === "POST" ? await request.formData() : null;
      const trans = String(q.get("trans_id") || f?.get("trans_id") || "");
      success = Boolean(trans && (await verifyNextpay(id, trans)));
    }
    if (sub.startsWith("zibal")) {
      const f =
        method === "POST" ? await request.formData().catch(() => null) : null;
      const track = String(q.get("trackId") || f?.get("trackId") || "");
      const state = String(
        q.get("success") ||
          f?.get("success") ||
          q.get("status") ||
          f?.get("status") ||
          "",
      );
      success = Boolean(
        track && ["1", "2"].includes(state) && (await verifyZibal(id, track)),
      );
    }
    if (!success && id)
      await db.order
        .update({
          where: { id },
          data: { status: "cancelled", updatedAt: now() },
        })
        .catch(() => null);
    return redirectTo(frontend, {
      payment: "return",
      orderId: id,
      status: success ? "success" : "cancelled",
    });
  }
  return null;
}

async function uploadRoute(
  request: NextRequest,
  route: string,
  method: string,
) {
  if (route !== "upload" || method !== "POST") return null;
  await requireAdmin(request);
  const form = await request.formData();
  const file = form.get("image");
  if (!(file instanceof File)) return fail("فایل تصویر ارسال نشده است.");
  if (file.size > 8 * 1024 * 1024 || !file.type.startsWith("image/"))
    return fail("فایل تصویر نامعتبر یا بزرگ‌تر از ۸ مگابایت است.");
  const ext =
    file.name
      .split(".")
      .pop()
      ?.replace(/[^a-z0-9]/gi, "") || "webp";
  const name = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(
    path.join(dir, name),
    Buffer.from(await file.arrayBuffer()),
  );
  return ok({ url: `/uploads/${name}` });
}

async function handler(request: NextRequest, context: Context) {
  try {
    const route = (await context.params).path.join("/");
    const method = request.method.toUpperCase();
    return (
      (await uploadRoute(request, route, method)) ||
      (await paymentRoutes(request, route, method)) ||
      (await authRoutes(request, route, method)) ||
      (await publicRoutes(request, route, method)) ||
      (await adminRoutes(request, route, method)) ||
      fail("مسیر API یافت نشد.", 404)
    );
  } catch (error) {
    if (error instanceof ApiError) return fail(error.message, error.status);
    console.error(error);
    return fail("خطای داخلی سرور.", 500);
  }
}
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
