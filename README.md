# Passify

فروشگاه فول‌استک فارسی برای فروش محصولات و اشتراک‌های دیجیتال. این پروژه با Next.js، React، TypeScript و Prisma ساخته شده و فروشگاه مشتریان، پنل مدیریت و API را در یک برنامه ارائه می‌کند.

## امکانات

- مرور محصولات و دسته‌بندی‌ها، جست‌وجو، وبلاگ و سبد خرید
- ثبت‌نام و ورود مشتری با ایمیل
- ثبت سفارش و پرداخت با حالت Sandbox یا درگاه‌های زرین‌پال، نکست‌پی و زیبال
- پنل مدیریت محصولات، دسته‌بندی‌ها، سفارش‌ها، مشتریان، نوشته‌ها و تنظیمات
- اعلان یک‌طرفه سفارش موفق برای مدیر از طریق تلگرام؛ تلگرام برای ورود یا پیام‌رسانی به مشتری استفاده نمی‌شود
- ذخیره‌سازی داده‌ها با PostgreSQL و API یکپارچه در Next.js

## فناوری‌ها

- Next.js 16 App Router و React 19
- TypeScript و Tailwind CSS 4
- Prisma ORM و PostgreSQL
- JWT و bcrypt برای احراز هویت

## پیش‌نیازها

- Node.js نسخه ۲۰٫۹ یا جدیدتر
- npm
- PostgreSQL محلی یا یک آدرس دیتابیس PostgreSQL

## راه‌اندازی محلی

```bash
git clone https://github.com/rzzfra/passify-next.git
cd passify-next
npm ci
```

فایل محیط را از نمونه بسازید.

در PowerShell:

```powershell
Copy-Item .env.example .env
```

در macOS یا Linux:

```bash
cp .env.example .env
```

در `.env` مقدار `JWT_SECRET` را با یک کلید تصادفی جایگزین کنید. برای تولید کلید:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

مقدار `DATABASE_URL` را هم به آدرس PostgreSQL محلی خود تنظیم کنید. نمونه‌ی آن در `.env.example` قرار دارد.

دیتابیس را بسازید، مدیر اولیه را تعریف کنید و برنامه را اجرا کنید:

```bash
npm run db:push
npm run db:admin:create
npm run dev
```

دستور ساخت مدیر، نام کاربری، نام نمایشی و رمز را در ترمینال می‌پرسد؛ رمز هنگام ورود نمایش داده نمی‌شود. فروشگاه در `http://localhost:3000` و پنل مدیریت در `http://localhost:3000/admin` در دسترس است. پس از ورود، محصولات و دسته‌بندی‌ها را از پنل مدیریت اضافه کنید.

## پیکربندی

تنظیمات اصلی در `.env`:

| متغیر                    | کاربرد                                            |
| ------------------------ | ------------------------------------------------- |
| `DATABASE_URL`           | آدرس اتصال PostgreSQL                             |
| `JWT_SECRET`             | کلید امضای نشست‌ها؛ در محیط واقعی حتماً تغییر کند |
| `NEXT_PUBLIC_APP_URL`    | آدرس عمومی فروشگاه برای بازگشت از پرداخت          |
| `APP_URL`                | آدرس برنامه در سمت سرور                           |
| `PAYMENT_MODE`           | حالت پرداخت؛ برای توسعه از `sandbox` استفاده کنید |
| `ZARINPAL_MERCHANT_ID`   | شناسه پذیرنده زرین‌پال، در صورت استفاده           |
| `NEXTPAY_API_KEY`        | کلید نکست‌پی، در صورت استفاده                     |
| `ZIBAL_MERCHANT_ID`      | شناسه پذیرنده زیبال، در صورت استفاده              |
| `TELEGRAM_BOT_TOKEN`     | اختیاری؛ توکن ربات اعلان مدیر                     |
| `TELEGRAM_ADMIN_CHANNEL` | اختیاری؛ شناسه کانال یا گفت‌وگوی مدیر             |

درگاه پرداخت و اعلان تلگرام را فقط پس از تنظیم اطلاعات معتبر فعال کنید. مقادیر محرمانه را در Git یا کد سمت کاربر قرار ندهید.

## فرمان‌ها

| فرمان                     | کاربرد                                 |
| ------------------------- | -------------------------------------- |
| `npm run dev`             | اجرای توسعه                            |
| `npm run build`           | ساخت نسخه تولید                        |
| `npm run vercel-build`    | همگام‌سازی schema و ساخت برای Vercel   |
| `npm start`               | اجرای نسخه ساخته‌شده                   |
| `npm run typecheck`       | تولید Prisma Client و بررسی TypeScript |
| `npm run db:push`         | همگام‌سازی schema با دیتابیس           |
| `npm run db:admin:create` | ساخت مدیر اولیه                        |
| `npm run db:studio`       | بازکردن Prisma Studio                  |

## استقرار و نگهداری داده

برای اجرای نسخه‌ی تولید:

```bash
npm run build
npm start
```

در Vercel، مخزن را Import و Prisma Postgres را متصل کنید. پیشوند integration باید `DATABASE` باشد تا متغیر `DATABASE_URL` ساخته شود. تنظیم [`vercel.json`](vercel.json) فرمان `npm run vercel-build` را اجرا می‌کند و schema را پیش از build همگام می‌کند. `JWT_SECRET` را به‌صورت Secret تنظیم و `NEXT_PUBLIC_APP_URL` را روی دامنه‌ی نهایی قرار دهید. دیتابیس تازه خالی است؛ داده‌های دیتابیس محلی خودکار منتقل نمی‌شوند.

آپلودهای `public/uploads` روی Vercel ماندگار نیستند؛ آپلود از پنل مدیریت به Object Storage نیاز دارد. تا آن زمان از URL تصاویر میزبانی‌شده‌ی بیرونی استفاده کنید. فایل `.env` و آپلودهای محلی عمداً در Git نادیده گرفته می‌شوند.

## مجوز

در حال حاضر مجوز متن‌بازی برای این مخزن تعیین نشده است.
