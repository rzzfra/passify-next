import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const demoPassword = "PassifyDemo2026!";
const timestamp = BigInt(Date.now());

const categories = [
  {
    id: "demo-ai",
    name: "هوش مصنوعی",
    englishName: "AI Tools",
    icon: "Sparkles",
    description: "ابزارهای هوش مصنوعی برای کار و یادگیری",
    gradient: "from-cyan-500 to-blue-600",
    accentColor: "#22d3ee",
    order: 1,
    isActive: true,
  },
  {
    id: "demo-productivity",
    name: "کار و بهره‌وری",
    englishName: "Productivity",
    icon: "Workflow",
    description: "ابزارهای توسعه و بهره‌وری روزانه",
    gradient: "from-emerald-500 to-teal-600",
    accentColor: "#34d399",
    order: 2,
    isActive: true,
  },
  {
    id: "demo-design",
    name: "طراحی و خلاقیت",
    englishName: "Design",
    icon: "Palette",
    description: "سرویس‌های طراحی و تولید محتوا",
    gradient: "from-rose-500 to-orange-500",
    accentColor: "#fb7185",
    order: 3,
    isActive: true,
  },
];

const products = [
  {
    id: "demo-chatgpt-plus",
    title: "ChatGPT Plus",
    subtitle: "اشتراک یک‌ماهه هوش مصنوعی",
    categoryId: "demo-ai",
    price: 890000,
    originalPrice: 1090000,
    discountPercent: 18,
    image: "/demo/demo-chatgpt-plus.svg",
    badge: "دموی نمایشی",
    rating: 4.9,
    salesCount: 128,
    description:
      "نمونه محصول برای بررسی کاتالوگ، پلن و جزئیات خرید در نسخه دمو.",
    features: [
      "دسترسی یک‌ماهه",
      "تحویل در حساب کاربری",
      "مناسب برای تست فروشگاه",
    ],
    plans: [
      {
        id: "month",
        name: "یک‌ماهه",
        price: 890000,
        originalPrice: 1090000,
        isPopular: true,
      },
    ],
    tags: ["هوش مصنوعی", "اشتراک"],
  },
  {
    id: "demo-claude-pro",
    title: "Claude Pro",
    subtitle: "پلن ماهانه دستیار هوشمند",
    categoryId: "demo-ai",
    price: 940000,
    originalPrice: 1100000,
    discountPercent: 15,
    image: "/demo/demo-claude-pro.svg",
    badge: "دموی نمایشی",
    rating: 4.8,
    salesCount: 86,
    description: "نمونه‌ای نمایشی برای نمایش پلن‌های اشتراک و اطلاعات محصول.",
    features: ["اشتراک یک‌ماهه", "مناسب نوشتن و پژوهش", "داده نمایشی"],
    plans: [
      {
        id: "month",
        name: "یک‌ماهه",
        price: 940000,
        originalPrice: 1100000,
        isPopular: true,
      },
    ],
    tags: ["هوش مصنوعی", "اشتراک"],
  },
  {
    id: "demo-cursor-pro",
    title: "Cursor Pro",
    subtitle: "ابزار توسعه با هوش مصنوعی",
    categoryId: "demo-productivity",
    price: 990000,
    originalPrice: 1190000,
    discountPercent: 17,
    image: "/demo/demo-cursor-pro.svg",
    badge: "دموی نمایشی",
    rating: 4.9,
    salesCount: 74,
    description: "نمونه نمایشی محصول توسعه برای مشاهده کارت و اطلاعات پلن.",
    features: ["پلن یک‌ماهه", "ویژه برنامه‌نویسی", "داده نمایشی"],
    plans: [
      {
        id: "month",
        name: "یک‌ماهه",
        price: 990000,
        originalPrice: 1190000,
        isPopular: true,
      },
    ],
    tags: ["برنامه‌نویسی", "ابزار"],
  },
  {
    id: "demo-github-copilot",
    title: "GitHub Copilot",
    subtitle: "دستیار کدنویسی ماهانه",
    categoryId: "demo-productivity",
    price: 490000,
    originalPrice: 590000,
    discountPercent: 17,
    image: "/demo/demo-github-copilot.svg",
    badge: "دموی نمایشی",
    rating: 4.7,
    salesCount: 61,
    description: "نمونه ساختگی برای نمایش یک محصول نرم‌افزاری در فروشگاه.",
    features: ["اشتراک یک‌ماهه", "مناسب توسعه‌دهندگان", "داده نمایشی"],
    plans: [
      {
        id: "month",
        name: "یک‌ماهه",
        price: 490000,
        originalPrice: 590000,
        isPopular: true,
      },
    ],
    tags: ["برنامه‌نویسی", "اشتراک"],
  },
  {
    id: "demo-canva-pro",
    title: "Canva Pro",
    subtitle: "ابزار طراحی و تولید محتوا",
    categoryId: "demo-design",
    price: 390000,
    originalPrice: 490000,
    discountPercent: 20,
    image: "/demo/demo-canva-pro.svg",
    badge: "دموی نمایشی",
    rating: 4.8,
    salesCount: 93,
    description: "نمونه محصول طراحی برای نمایش فهرست محصولات و جزئیات آن.",
    features: ["پلن یک‌ماهه", "ابزارهای طراحی", "داده نمایشی"],
    plans: [
      {
        id: "month",
        name: "یک‌ماهه",
        price: 390000,
        originalPrice: 490000,
        isPopular: true,
      },
    ],
    tags: ["طراحی", "اشتراک"],
  },
  {
    id: "demo-figma-pro",
    title: "Figma Pro",
    subtitle: "فضای حرفه‌ای طراحی رابط کاربری",
    categoryId: "demo-design",
    price: 550000,
    originalPrice: 650000,
    discountPercent: 15,
    image: "/demo/demo-figma-pro.svg",
    badge: "دموی نمایشی",
    rating: 4.8,
    salesCount: 52,
    description: "محصول نمونه برای نمایش دسته‌بندی طراحی و پلن اشتراک.",
    features: ["پلن یک‌ماهه", "مناسب طراحی محصول", "داده نمایشی"],
    plans: [
      {
        id: "month",
        name: "یک‌ماهه",
        price: 550000,
        originalPrice: 650000,
        isPopular: true,
      },
    ],
    tags: ["طراحی", "ابزار"],
  },
].map((product, index) => ({
  ...product,
  createdAt: timestamp - BigInt(index),
}));

async function seedDemo() {
  await prisma.$transaction(async (tx) => {
    for (const category of categories) {
      await tx.category.upsert({
        where: { id: category.id },
        update: {},
        create: category,
      });
    }

    for (const product of products) {
      const { features, plans, tags, ...record } = product;
      await tx.product.upsert({
        where: { id: product.id },
        update: {},
        create: {
          ...record,
          features: JSON.stringify(features),
          plans: JSON.stringify(plans),
          customFields: "[]",
          tags: JSON.stringify(tags),
        },
      });
    }

    const existingDemoUser = await tx.user.findUnique({
      where: { email: "viewer@example.test" },
    });
    if (existingDemoUser && !existingDemoUser.isDemo) {
      throw new Error("Refusing to overwrite a non-demo user account.");
    }

    const demoUser = await tx.user.upsert({
      where: { email: "viewer@example.test" },
      update: { isDemo: true },
      create: {
        email: "viewer@example.test",
        password: null,
        authProvider: "web",
        isDemo: true,
        username: "demo_viewer",
        firstName: "کاربر",
        lastName: "نمونه",
        photoUrl: null,
        createdAt: timestamp,
      },
    });

    const demoOrders = [
      {
        id: "DEMO-ORD-1001",
        productId: "demo-chatgpt-plus",
        amount: 890000,
        status: "completed",
        daysAgo: 8,
      },
      {
        id: "DEMO-ORD-1002",
        productId: "demo-cursor-pro",
        amount: 990000,
        status: "paid_processing",
        daysAgo: 3,
      },
      {
        id: "DEMO-ORD-1003",
        productId: "demo-canva-pro",
        amount: 390000,
        status: "completed",
        daysAgo: 1,
      },
    ];

    for (const order of demoOrders) {
      const createdAt = timestamp - BigInt(order.daysAgo) * 86400000n;
      await tx.order.upsert({
        where: { id: order.id },
        update: { isDemo: true },
        create: {
          id: order.id,
          userId: demoUser.id,
          telegramId: null,
          isDemo: true,
          productId: order.productId,
          planName: "اشتراک یک‌ماهه",
          amount: order.amount,
          status: order.status,
          paymentRef: `DEMO-${order.id}`,
          customerData: JSON.stringify({
            email: demoUser.email,
            note: "اطلاعات ساختگی",
          }),
          licenseKey:
            order.status === "completed" ? `DEMO-LICENSE-${order.id}` : null,
          telegramMessageId: null,
          createdAt,
          updatedAt: createdAt,
        },
      });
    }

    const existingDemoAdmin = await tx.adminUser.findUnique({
      where: { username: "demo" },
    });
    if (existingDemoAdmin && existingDemoAdmin.role !== "demo") {
      throw new Error("Refusing to overwrite a non-demo admin account.");
    }

    await tx.adminUser.upsert({
      where: { username: "demo" },
      update: {
        name: "ادمین نمایشی",
        role: "demo",
        password: await bcrypt.hash(demoPassword, 10),
      },
      create: {
        username: "demo",
        name: "ادمین نمایشی",
        role: "demo",
        password: await bcrypt.hash(demoPassword, 10),
        createdAt: timestamp,
      },
    });
  });

  console.log("Demo catalog and read-only admin are ready.");
}

seedDemo()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
