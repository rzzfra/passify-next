import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  Package,
  Calendar,
  CreditCard,
  ShieldCheck,
  Send,
} from "lucide-react";
import type { Order } from "../types";
import { formatPrice } from "../utils/formatters";

interface PaymentReceiptModalProps {
  isOpen: boolean;
  order: Order | null;
  status: "success" | "cancelled" | "failed";
  onClose: () => void;
  onViewOrders: () => void;
}

export const PaymentReceiptModal: React.FC<PaymentReceiptModalProps> = ({
  isOpen,
  order,
  status,
  onClose,
  onViewOrders,
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);

  if (!isOpen) return null;

  const isSuccess = status === "success";

  const handleCopyOrderId = () => {
    if (!order?.id) return;
    navigator.clipboard.writeText(order.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const handleCopyLicense = () => {
    if (!order?.licenseKey) return;
    navigator.clipboard.writeText(order.licenseKey);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-right overflow-hidden flex flex-col max-h-[90vh]">
        {/* افکت نوری پس‌زمینه */}
        <div
          className={`absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-30 pointer-events-none ${
            isSuccess ? "bg-emerald-500" : "bg-rose-500"
          }`}
        />

        {/* آیکون و وضعیت سربرگ */}
        <div className="text-center pt-2 pb-4">
          <div
            className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center shadow-lg mb-3.5 ${
              isSuccess
                ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shadow-emerald-500/10"
                : "bg-rose-500/20 border border-rose-500/40 text-rose-400 shadow-rose-500/10"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-9 h-9 animate-in zoom-in-50 duration-300" />
            ) : (
              <XCircle className="w-9 h-9 animate-in zoom-in-50 duration-300" />
            )}
          </div>

          <h3 className="text-lg font-black text-slate-100">
            {isSuccess ? "پرداخت با موفقیت انجام شد" : "پرداخت انجام نشد"}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isSuccess
              ? "رسید تراکنش بانکی و وضعیت آماده‌سازی سفارش"
              : "عملیات پرداخت توسط شما یا درگاه لغو شد"}
          </p>
        </div>

        {/* بدنه رسید */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-0.5 my-2 text-xs">
          {order ? (
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
              {/* شماره سفارش و پیگیری */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <span className="text-slate-400">کد پیگیری سفارش:</span>
                <button
                  type="button"
                  onClick={handleCopyOrderId}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 font-mono font-bold transition-colors"
                  title="کپی شماره سفارش"
                >
                  <span>{order.orderNumber || order.id}</span>
                  {copiedId ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* نام محصول و پلن */}
              <div className="flex items-start justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <Package className="w-4 h-4 text-sky-400 shrink-0" />
                  <span>محصول:</span>
                </div>
                <div className="text-left">
                  <span className="font-bold text-slate-100 block">
                    {order.product?.title ||
                      order.productTitle ||
                      "محصول دیجیتال"}
                  </span>
                  {(order.planName || order.plan) && (
                    <span className="text-[11px] text-sky-400 block mt-0.5">
                      {order.planName || order.plan}
                    </span>
                  )}
                </div>
              </div>

              {/* مبلغ پرداختی */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <CreditCard className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>مبلغ پرداختی:</span>
                </div>
                <span className="font-black text-sm text-emerald-400">
                  {formatPrice(order.amount)}
                </span>
              </div>

              {/* زمان ثبت */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>تاریخ تراکنش:</span>
                </div>
                <span className="text-slate-300">
                  {order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("fa-IR")
                    : order.date || "هم‌اکنون"}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-center text-slate-400">
              اطلاعات سفارش در حال بازیابی است...
            </div>
          )}

          {/* باکس لایسنس یا وضعیت آماده‌سازی */}
          {isSuccess && (
            <>
              {order?.licenseKey ? (
                <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-500/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      <span>کد لایسنس تحویل شده:</span>
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyLicense}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[11px] font-bold"
                    >
                      {copiedLicense ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>کپی شد</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>کپی لایسنس</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 font-mono text-center text-xs font-bold text-slate-100 tracking-wider select-all">
                    {order.licenseKey}
                  </div>
                  <p className="text-[10px] text-emerald-400/80 leading-relaxed text-center">
                    این اطلاعات همیشه از بخش سفارش‌های حساب شما قابل مشاهده است.
                  </p>
                </div>
              ) : (
                <div className="p-3.5 rounded-2xl bg-sky-950/30 border border-sky-500/30 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0 animate-pulse">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-sky-300 block text-[11px]">
                      سفارش با موفقیت ثبت شد
                    </span>
                    <p className="text-[10px] text-slate-400 leading-relaxed mt-0.5">
                      پس از آماده‌سازی، اطلاعات تحویل در بخش سفارش‌های حساب کاربری شما نمایش داده می‌شود.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* دکمه‌های اقدام */}
        <div className="pt-3 border-t border-slate-800/80 space-y-2">
          {isSuccess ? (
            <>
              <button
                type="button"
                onClick={onViewOrders}
                className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all active:scale-98"
              >
                <Package className="w-4 h-4" />
                <span>مشاهده در بخش سفارشات من</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all active:scale-98"
              >
                بازگشت به فروشگاه
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-98"
              >
                <span>بازگشت و تلاش مجدد</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
