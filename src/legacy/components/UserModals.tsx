import React, { useState } from "react";
import {
  X,
  CreditCard,
  ShoppingBag,
  Headphones,
  CheckCircle2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  ChevronDown,
  Bot,
  Send,
  Music,
  MessageCircle,
  XCircle,
  CalendarDays,
  UserRound,
} from "lucide-react";
import type {
  ActiveModalType,
  Subscription,
  Order,
  SupportInfo,
} from "../types";
import {
  formatPrice,
  toPersianDigits,
  triggerHaptic,
} from "../utils/formatters";
import { formatDateFa } from "../utils/subscriptions";

interface UserModalsProps {
  activeModal: ActiveModalType;
  onClose: () => void;
  subscriptions: Subscription[];
  orders: Order[];
  supportInfo: SupportInfo;
}

export const UserModals: React.FC<UserModalsProps> = ({
  activeModal,
  onClose,
  subscriptions,
  orders,
  supportInfo,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  if (!activeModal) return null;

  // نرمال‌سازی فیلدهای سفارش: هم دیتای سرور (product.title/planName/createdAt) و هم ماک پشتیبانی می‌شود
  const getOrderTitle = (order: Order) =>
    order.productTitle || order.product?.title || "محصول";
  const getOrderPlan = (order: Order) => order.plan || order.planName || "—";
  const getOrderDate = (order: Order) =>
    order.date || (order.createdAt ? formatDateFa(order.createdAt) : "—");
  const getTrackNo = (order: Order) => order.orderNumber || order.id;

  const handleCopy = (text: string, id: string) => {
    triggerHaptic("light");
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleFaq = (id: string) => {
    triggerHaptic("selection");
    setOpenFaq(openFaq === id ? null : id);
  };

  const getServiceIcon = (icon: string) => {
    switch (icon) {
      case "Bot":
        return <Bot className="w-5 h-5 text-purple-400" />;
      case "Send":
        return <Send className="w-5 h-5 text-sky-400" />;
      case "Music":
        return <Music className="w-5 h-5 text-emerald-400" />;
      default:
        return <CreditCard className="w-5 h-5 text-sky-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        triggerHaptic("light");
        onClose();
      }}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative w-full max-w-lg lg:max-w-xl max-h-[88vh] bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "pan-y" }}
      >
        {/* هدر مودال */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2">
            {activeModal === "subscriptions" && (
              <>
                <CreditCard className="w-5 h-5 text-sky-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  اشتراک‌های فعال من
                </h2>
              </>
            )}
            {activeModal === "orders" && (
              <>
                <ShoppingBag className="w-5 h-5 text-purple-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  تاریخچه سفارشات
                </h2>
              </>
            )}
            {activeModal === "support" && (
              <>
                <Headphones className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-bold text-slate-100">
                  پشتیبانی و ارتباط با ما
                </h2>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onClose();
            }}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* محتوای مودال بر اساس نوع تب انتخاب شده */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 scrollbar-none">
          {/* ۱) تب اشتراک‌های من */}
          {activeModal === "subscriptions" && (
            <div className="space-y-3">
              <p className="text-xs leading-5 text-slate-400">
                وضعیت و جزئیات سرویس‌های فعال شما در یک نگاه
              </p>

              {subscriptions.length === 0 && (
                <div className="p-6 text-center rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                  <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">
                    هنوز اشتراک فعالی ندارید
                  </p>
                  <p className="text-[11px] text-slate-500">
                    پس از خرید اولین اشتراک، وضعیت و روزهای باقی‌مانده آن در
                    اینجا نمایش داده می‌شود.
                  </p>
                </div>
              )}

              {subscriptions.map((sub) => {
                const percent = Math.min(
                  100,
                  Math.max(0, Math.round((sub.daysLeft / sub.totalDays) * 100)),
                );
                const isExpiring = sub.status === "expiring";

                return (
                  <article
                    key={sub.id}
                    className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-800/80 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-700 bg-slate-900">
                          {getServiceIcon(sub.icon)}
                        </div>
                        <div className="min-w-0">
                          <h4 className="truncate text-sm font-black text-slate-100">
                            {sub.serviceName}
                          </h4>
                          <p className="mt-0.5 truncate text-[11px] text-slate-400">
                            {sub.plan}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-lg border px-2 py-1 text-[10px] font-bold ${
                          isExpiring
                            ? "border-amber-500/35 bg-amber-500/15 text-amber-300"
                            : "border-emerald-500/30 bg-emerald-500/15 text-emerald-300"
                        }`}
                      >
                        {isExpiring ? "نزدیک به انقضا" : "فعال"}
                      </span>
                    </div>

                    <div className="mx-4 h-1.5 overflow-hidden rounded-full bg-slate-700/80">
                      <div
                        className={`h-full rounded-full ${
                          isExpiring ? "bg-amber-400" : "bg-emerald-400"
                        }`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-4">
                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/45 p-3">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                          <Clock className="h-3.5 w-3.5" />
                          زمان باقی‌مانده
                        </div>
                        <p className={`text-sm font-black ${isExpiring ? "text-amber-300" : "text-slate-100"}`}>
                          {toPersianDigits(sub.daysLeft)} روز
                        </p>
                      </div>
                      <div className="rounded-xl border border-slate-700/50 bg-slate-900/45 p-3">
                        <div className="mb-1.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5" />
                          تاریخ انقضا
                        </div>
                        <p className="text-xs font-bold text-slate-200">{sub.expireDate}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-slate-700/50 px-4 py-3 text-[11px] text-slate-400">
                      <UserRound className="h-3.5 w-3.5 text-slate-500" />
                      <span>حساب:</span>
                      <span className="min-w-0 truncate font-medium text-slate-300">
                        {sub.accountEmail}
                      </span>
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {/* ۲) تب سفارشات */}
          {activeModal === "orders" && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                سفارشات اخیر و کدهای فعال‌سازی اختصاصی شما:
              </p>

              {orders.length === 0 && (
                <div className="p-6 text-center rounded-2xl bg-slate-800/50 border border-slate-700/50 space-y-2">
                  <ShoppingBag className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-400 font-bold">
                    هنوز سفارشی ثبت نکرده‌اید
                  </p>
                  <p className="text-[11px] text-slate-500">
                    سفارشات و کدهای فعال‌سازی شما پس از خرید در اینجا نمایش داده
                    می‌شوند.
                  </p>
                </div>
              )}

              {orders.map((order) => (
                <div
                  key={order.id}
                  className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      کد پیگیری: {getTrackNo(order)}
                    </span>
                    {order.status === "completed" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        تکمیل شده
                      </span>
                    ) : order.status === "cancelled" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10px] font-bold">
                        <XCircle className="w-3 h-3" />
                        لغو شده
                      </span>
                    ) : order.status === "pending_payment" ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-500/15 border border-slate-500/30 text-slate-300 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        در انتظار پرداخت
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px] font-bold">
                        <Clock className="w-3 h-3 animate-spin" />
                        در حال تحویل
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100">
                        {getOrderTitle(order)}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {getOrderPlan(order)}
                      </p>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-black text-sky-400">
                        {formatPrice(order.amount)}
                      </span>
                      <span className="block text-[10px] text-slate-500 mt-0.5">
                        {getOrderDate(order)}
                      </span>
                    </div>
                  </div>

                  {order.licenseKey && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/40 flex items-center justify-between bg-slate-900/60 p-2.5 rounded-xl">
                      <div className="truncate">
                        <span className="text-[10px] text-slate-400 block">
                          لایسنس / گیفت تحویلی:
                        </span>
                        <span className="font-mono text-xs text-emerald-300 select-all font-bold">
                          {order.licenseKey}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(order.licenseKey || "", order.id)
                        }
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition-colors shrink-0"
                        title="کپی کد"
                      >
                        {copiedKey === order.id ? (
                          <Check className="w-4 h-4 text-emerald-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* ۳) تب پشتیبانی */}
          {activeModal === "support" && (
            <div className="space-y-4">
              {/* ارتباط مستقیم با پشتیبانی فروشگاه */}
              <div className="rounded-2xl border border-sky-500/25 bg-sky-500/5 p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-white"><MessageCircle className="h-5 w-5" /></div>
                  <div><h4 className="text-sm font-bold text-slate-100">پشتیبانی سفارش‌ها</h4><p className="text-xs text-slate-400">{supportInfo.responseTime}</p></div>
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <a href={`mailto:${supportInfo.email}`} className="flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-3 py-2.5 text-xs font-bold text-white"><Send className="h-3.5 w-3.5" />ارسال ایمیل</a>
                  <a href={`tel:${supportInfo.phone.replace(/[^0-9+]/g, "")}`} className="flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-xs text-slate-200"><ExternalLink className="h-3.5 w-3.5" />تماس با پشتیبانی</a>
                </div>
              </div>

              {/* ساعات کاری و تماس */}
              <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">ساعات کاری:</span>
                  <span>{supportInfo.workingHours}</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="text-slate-400">تلفن پیگیری:</span>
                  <span className="font-mono">{supportInfo.phone}</span>
                </div>
              </div>

              {/* سوالات متداول */}
              <div>
                <h4 className="text-xs font-bold text-slate-300 mb-2">
                  پرسش‌های پرتکرار:
                </h4>
                <div className="space-y-2">
                  {supportInfo.faq.map((item) => {
                    const isOpen = openFaq === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-xl bg-slate-800/70 border border-slate-700/50 overflow-hidden"
                      >
                        <button
                          type="button"
                          onClick={() => toggleFaq(item.id)}
                          className="w-full flex items-center justify-between p-3 text-right text-xs font-semibold text-slate-200 hover:text-slate-100"
                        >
                          <span>{item.question}</span>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${
                              isOpen ? "rotate-180 text-sky-400" : ""
                            }`}
                          />
                        </button>
                        {isOpen && (
                          <div className="px-3 pb-3 pt-1 text-xs text-slate-400 leading-relaxed border-t border-slate-700/40">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
