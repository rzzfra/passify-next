# نقشه مهاجرت نسخه ۳

| نسخه ۳ | نسخه Next.js |
|---|---|
| Vite `src/App.tsx` | `src/legacy/App.tsx` در Client Boundary |
| FastAPI routers | `src/app/api/[...path]/route.ts` |
| SQLAlchemy models | `prisma/schema.prisma` |
| FastAPI security | `src/lib/auth.ts` |
| payment.py | `src/lib/payments.ts` |
| telegram_bot.py | `src/lib/telegram.ts` |
| dev.db | `prisma/dev.db` |
| uploads | `public/uploads` |

APIها عمداً با همان URLهای نسخه ۳ نگه داشته شده‌اند تا رابط کاربری و جریان‌های موجود بدون تغییر قرارداد کار کنند.
