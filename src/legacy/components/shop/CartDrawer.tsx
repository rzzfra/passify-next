import React from "react";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import type { CartItem } from "../../utils/cart";
import type { Product } from "../../types";
import {
  formatPrice,
  toPersianDigits,
  triggerHaptic,
} from "../../utils/formatters";
import { resolveBackendUrl } from "../../utils/media";

interface P {
  isOpen: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onQty: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  onCheckout: (p: Product) => void;
}

export const CartDrawer: React.FC<P> = (p) => {
  if (!p.isOpen) return null;

  const itemsCount = p.items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/70"
      onClick={p.onClose}
    >
      <div
        className="flex h-full w-full max-w-sm flex-col border-r border-slate-700/60 bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر سبد خرید */}
        <div className="flex items-center justify-between border-b border-slate-700/60 px-4 py-3.5">
          <span className="flex items-center gap-2 text-sm font-bold text-slate-100">
            <ShoppingBag className="h-4 w-4 text-sky-400" />
            سبد خرید
            {itemsCount > 0 && (
              <span className="text-[11px] font-normal text-slate-400">
                ({toPersianDigits(itemsCount)} کالا)
              </span>
            )}
          </span>
          <button
            type="button"
            onClick={p.onClose}
            aria-label="بستن سبد خرید"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 text-slate-300 hover:text-slate-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {p.items.length === 0 ? (
          /* حالت سبد خالی */
          <div className="flex flex-1 flex-col items-center justify-center gap-2.5 px-6 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-700/60 bg-slate-800/40 text-slate-500">
              <ShoppingBag className="h-6 w-6" />
            </span>
            <p className="text-xs font-bold text-slate-200">
              سبد خرید شما خالی است
            </p>
            <p className="text-[11px] leading-5 text-slate-500">
              کالای مورد نظرتان را از فروشگاه انتخاب و به سبد اضافه کنید.
            </p>
            <button
              type="button"
              onClick={p.onClose}
              className="mt-1 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400"
            >
              بازگشت به فروشگاه
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
              {p.items.map(({ product, qty }) => (
                <div
                  key={product.id}
                  className="flex gap-3 rounded-2xl border border-slate-700/60 bg-slate-800/40 p-2.5"
                >
                  <img
                    src={resolveBackendUrl(product.image)}
                    alt={product.title}
                    loading="lazy"
                    className="h-16 w-16 shrink-0 rounded-xl bg-slate-900 object-cover"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="line-clamp-2 text-xs font-bold leading-5 text-slate-100">
                        {product.title}
                      </h4>
                      <button
                        type="button"
                        aria-label="حذف از سبد خرید"
                        onClick={() => {
                          triggerHaptic("light");
                          p.onRemove(product.id);
                        }}
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          aria-label="افزایش تعداد"
                          onClick={() => {
                            triggerHaptic("light");
                            p.onQty(product.id, qty + 1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-100">
                          {toPersianDigits(qty)}
                        </span>
                        <button
                          type="button"
                          aria-label="کاهش تعداد"
                          onClick={() => {
                            triggerHaptic("light");
                            p.onQty(product.id, qty - 1);
                          }}
                          className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-700 text-slate-100 hover:bg-slate-600"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <div className="text-left">
                        <span className="block text-xs font-black text-slate-100">
                          {formatPrice(product.price * qty)}
                        </span>
                        {qty > 1 && (
                          <span className="block text-[10px] text-slate-500">
                            {formatPrice(product.price)} ×{" "}
                            {toPersianDigits(qty)}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        triggerHaptic("medium");
                        p.onCheckout(product);
                      }}
                      className="w-full rounded-xl bg-sky-500 py-2 text-[11px] font-bold text-white hover:bg-sky-400"
                    >
                      تکمیل خرید
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* جمع سبد خرید */}
            <div className="border-t border-slate-700/60 bg-slate-900/95 p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">جمع سبد خرید</span>
                <span className="text-sm font-black text-slate-100">
                  {formatPrice(p.total)}
                </span>
              </div>
              <p className="mt-2 text-[10px] leading-4 text-slate-500">
                هر کالا جداگانه ثبت و پرداخت می‌شود؛ برای ادامه روی «تکمیل
                خرید» همان کالا بزنید.
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
