import React, { useState } from "react";
import { X, Check, Star, Zap, ShieldCheck, Send } from "lucide-react";
import type { Product, ProductPlan } from "../types";
import {
  formatPrice,
  toPersianDigits,
  triggerHaptic,
} from "../utils/formatters";
import { resolveBackendUrl } from "../utils/media";

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOrderSuccess?: (product: Product, plan: ProductPlan) => void;
  onProceedToCheckout?: (product: Product, plan: ProductPlan) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOrderSuccess,
  onProceedToCheckout,
}) => {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderedSuccess, setOrderedSuccess] = useState(false);

  if (!product) return null;

  const defaultPlan =
    product.plans?.find((p) => p.isPopular) || product.plans?.[0] || null;
  const selectedPlan =
    product.plans?.find((p) => p.id === selectedPlanId) || defaultPlan;
  const currentPrice = selectedPlan ? selectedPlan.price : product.price;

  const handleSelectPlan = (plan: ProductPlan) => {
    triggerHaptic("selection");
    setSelectedPlanId(plan.id);
  };

  const handleCloseModal = () => {
    triggerHaptic("light");
    setSelectedPlanId(null);
    setOrderedSuccess(false);
    onClose();
  };

  const handleOrder = () => {
    if (!selectedPlan) return;
    triggerHaptic("medium");

    if (onProceedToCheckout) {
      onProceedToCheckout(product, selectedPlan);
      return;
    }

    setIsOrdering(true);

    setTimeout(() => {
      setIsOrdering(false);
      setOrderedSuccess(true);
      triggerHaptic("success");
      if (onOrderSuccess) {
        onOrderSuccess(product, selectedPlan);
      }
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={handleCloseModal}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative w-full max-w-lg lg:max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col scrollbar-none"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "pan-y" }}
      >
        {/* نوار بالایی و دکمه بستن */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <span className="text-xs font-bold text-slate-300">
            مشخصات و ثبت سفارش
          </span>
          <button
            type="button"
            onClick={handleCloseModal}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors active:scale-90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ۴ - تصویر محصول: نمایش کاملاً شفاف و کامل بدون هیچ‌گونه برش یا تاریکی */}
        <div className="relative w-full bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900 border-b border-slate-800/80 p-5 flex items-center justify-center">
          <div className="relative max-w-full flex items-center justify-center">
            <img
              src={resolveBackendUrl(product.image)}
              alt={product.title}
              className="max-h-48 sm:max-h-56 w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800/80 ring-1 ring-white/10"
            />
            {product.badge && (
              <span
                className={`absolute top-2 right-2 px-2.5 py-1 rounded-lg backdrop-blur-md text-[11px] font-black text-white shadow-lg flex items-center gap-1 ${
                  product.badge.includes("دانشجو")
                    ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-purple-500/30"
                    : product.badge.includes("پرفروش")
                      ? "bg-gradient-to-r from-amber-500 to-orange-600 shadow-orange-500/30"
                      : product.badge.includes("ویژه")
                        ? "bg-gradient-to-r from-sky-500 to-blue-600 shadow-sky-500/30"
                        : "bg-sky-500/95"
                }`}
              >
                <Zap className="w-3 h-3" />
                {product.badge}
              </span>
            )}
          </div>
        </div>

        {/* محتوای بدنه */}
        <div className="p-5 space-y-5">
          {/* عنوان محصول و بج تخفیف */}
          <div>
            <div className="flex items-start justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-black text-slate-100 leading-tight">
                {product.title}
              </h2>
              {(product.discountPercent ||
                (product.originalPrice &&
                  product.originalPrice > product.price)) && (
                <span className="px-2.5 py-0.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-rose-400 text-xs font-bold shrink-0">
                  {toPersianDigits(
                    product.discountPercent ||
                      Math.round(
                        ((product.originalPrice! - product.price) /
                          product.originalPrice!) *
                          100,
                      ),
                  )}
                  ٪ تخفیف
                </span>
              )}
            </div>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {product.subtitle}
            </p>
          </div>

          {/* امتیاز و مشخصات سریع */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-xs">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold">
              <Star className="w-4 h-4 fill-amber-400" />
              <span>
                {toPersianDigits(product.rating.toFixed(1))} رضایت خریداران
              </span>
            </div>
            <div className="text-slate-400">
              <span>{toPersianDigits(product.salesCount)} سفارش موفق</span>
            </div>
            <div className="flex items-center gap-1 text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>ضمانت کامل</span>
            </div>
          </div>

          {/* توضیحات محصول */}
          <div>
            <h3 className="text-xs font-bold text-slate-300 mb-2">
              درباره محصول:
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed text-justify bg-slate-800/40 p-3.5 rounded-2xl border border-slate-800">
              {product.description}
            </p>
          </div>

          {/* ویژگی‌ها */}
          {product.features && product.features.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 mb-2">
                ویژگی‌ها و مزایا:
              </h3>
              <div className="space-y-2">
                {product.features.map((feat, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2.5 text-xs text-slate-200"
                  >
                    <div className="flex items-center justify-center w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 mt-0.5 shrink-0">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* انتخاب پلن‌ها */}
          {product.plans && product.plans.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-300 mb-2.5">
                انتخاب دوره و پلن:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.plans.map((plan) => {
                  const isSelected = selectedPlan?.id === plan.id;
                  const planDiscount =
                    plan.originalPrice && plan.originalPrice > plan.price
                      ? Math.round(
                          ((plan.originalPrice - plan.price) /
                            plan.originalPrice) *
                            100,
                        )
                      : null;

                  return (
                    <div
                      key={plan.id}
                      onClick={() => handleSelectPlan(plan)}
                      className={`relative p-3.5 rounded-xl border cursor-pointer transition-all active:scale-[0.98] ${
                        isSelected
                          ? "bg-sky-500/15 border-sky-500 text-sky-200 shadow-md shadow-sky-500/10 ring-1 ring-sky-500/50"
                          : plan.isPopular
                            ? "bg-amber-500/10 border-amber-500/50 hover:bg-amber-500/15 text-slate-200"
                            : "bg-slate-800/70 border-slate-700/60 hover:bg-slate-800 text-slate-300"
                      }`}
                    >
                      {plan.isPopular && (
                        <span className="absolute -top-2.5 left-3 px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-[9px] font-black text-slate-950 shadow-md flex items-center gap-1">
                          <Star className="w-2.5 h-2.5 fill-current" />
                          <span>پیشنهادی</span>
                        </span>
                      )}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold">{plan.name}</span>
                        <div className="text-left">
                          {plan.originalPrice &&
                            plan.originalPrice > plan.price && (
                              <div className="flex items-center gap-1 justify-end">
                                <span className="block text-[10px] text-slate-400 line-through">
                                  {formatPrice(plan.originalPrice)}
                                </span>
                                {planDiscount && (
                                  <span className="text-[9px] text-rose-400 font-bold">
                                    {toPersianDigits(planDiscount)}٪-
                                  </span>
                                )}
                              </div>
                            )}
                          <span className="text-xs font-black text-sky-400">
                            {formatPrice(plan.price)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* پیام موفقیت ثبت سفارش */}
          {orderedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-3 animate-in zoom-in-95">
              <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0">
                <Check className="w-5 h-5 font-black" />
              </div>
              <div>
                <p className="font-bold text-slate-100">
                  سفارش شما با موفقیت ثبت شد!
                </p>
                <p className="text-[11px] text-emerald-400/90 mt-0.5">
                  کد پیگیری در بخش «سفارشات» قابل مشاهده و پیگیری است.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* فوتر چسبیده با دکمه خرید */}
        <div className="sticky bottom-0 z-20 p-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex items-center justify-between gap-3">
          <div>
            <span className="text-[11px] text-slate-400 block">
              مبلغ قابل پرداخت:
            </span>
            <span className="text-base font-black text-sky-400">
              {formatPrice(currentPrice)}
            </span>
          </div>

          <button
            type="button"
            disabled={isOrdering}
            onClick={handleOrder}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 active:scale-98 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all disabled:opacity-60"
          >
            {isOrdering ? (
              <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : orderedSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>ثبت شد - مشاهده در سفارشات</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>خرید و تحویل فوری</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
