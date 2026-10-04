import type { Product } from "../types";

/**
 * درصد تخفیف واقعی محصول.
 * اولویت با مقدار discountPercent سرور است و در صورت نبود آن،
 * از اختلاف قیمت اصلی و قیمت نهایی محاسبه می‌شود.
 */
export function discountPercentOf(product: Product): number {
  if (product.discountPercent && product.discountPercent > 0) {
    return Math.round(product.discountPercent);
  }
  if (product.originalPrice && product.originalPrice > product.price) {
    return Math.round(
      ((product.originalPrice - product.price) / product.originalPrice) * 100,
    );
  }
  return 0;
}

/** آیا محصول تخفیف دارد؟ */
export function hasDiscount(product: Product): boolean {
  return discountPercentOf(product) > 0;
}
