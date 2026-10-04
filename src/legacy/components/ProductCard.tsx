import React, { useState } from "react";
import { ArrowLeft, Plus, Star } from "lucide-react";
import type { Product } from "../types";
import { formatPrice, toPersianDigits, triggerHaptic } from "../utils/formatters";
import { resolveBackendUrl } from "../utils/media";
import { discountPercentOf } from "../utils/products";

interface ProductCardProps { product: Product; onSelectProduct: (product: Product) => void; onAddToCart?: (product: Product) => void; }

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct, onAddToCart }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const discount = discountPercentOf(product);
  const hasOldPrice = Boolean(product.originalPrice) && (product.originalPrice as number) > product.price;
  const handleClick = () => { triggerHaptic("light"); onSelectProduct(product); };
  const handleAdd = (e: React.MouseEvent) => { e.stopPropagation(); triggerHaptic("medium"); onAddToCart ? onAddToCart(product) : onSelectProduct(product); };

  return (
    <article onClick={handleClick} onKeyDown={(e) => e.key === "Enter" && handleClick()} role="button" tabIndex={0} className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 outline-none transition duration-300 hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-800/60 hover:shadow-xl focus-visible:ring-2 focus-visible:ring-sky-500/50">
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-800">
        {!imageLoaded && <div className="absolute inset-0 animate-pulse bg-slate-700/40" />}
        <img src={resolveBackendUrl(product.image)} alt={product.title} loading="lazy" onLoad={() => setImageLoaded(true)} onError={() => setImageLoaded(true)} className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.025] ${imageLoaded ? "opacity-100" : "opacity-0"}`} />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-slate-900/50 to-transparent" />
        <div className="absolute right-2.5 top-2.5 flex flex-wrap gap-1.5">
          {discount > 0 && <span className="rounded-lg bg-rose-500 px-2 py-1 text-[9px] font-black text-white shadow-sm">{toPersianDigits(discount)}٪ تخفیف</span>}
          {product.badge && <span className="rounded-lg border border-white/10 bg-slate-900/75 px-2 py-1 text-[9px] font-bold text-white backdrop-blur-md">{product.badge}</span>}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center gap-2 text-[9px] text-slate-500">
          {product.rating > 0 && <span className="flex items-center gap-1 font-bold text-amber-400"><Star className="h-3 w-3 fill-current" />{toPersianDigits(product.rating.toFixed(1))}</span>}
          {product.salesCount > 0 && <><span className="h-1 w-1 rounded-full bg-slate-600" /><span>{toPersianDigits(product.salesCount)} خرید موفق</span></>}
        </div>
        <h3 className="line-clamp-2 text-xs font-black leading-5 text-slate-100 sm:text-[13px] sm:leading-6">{product.title}</h3>
        {product.subtitle && <p className="mt-1 line-clamp-1 text-[10px] text-slate-500">{product.subtitle}</p>}

        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <div className="min-w-0">
            {hasOldPrice && <span className="block text-[9px] text-slate-500 line-through">{formatPrice(product.originalPrice as number)}</span>}
            <span className="block truncate text-xs font-black text-slate-100 sm:text-sm">{formatPrice(product.price)}</span>
          </div>
          <button type="button" aria-label={`افزودن ${product.title} به سبد`} onClick={handleAdd} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-700/70 bg-slate-700/30 text-slate-300 transition hover:border-sky-500 hover:bg-sky-500 hover:text-white active:scale-90">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-3 hidden items-center gap-1 border-t border-slate-700/45 pt-3 text-[10px] font-bold text-sky-400 sm:flex">مشاهده جزئیات <ArrowLeft className="h-3 w-3 transition group-hover:-translate-x-1" /></div>
      </div>
    </article>
  );
};

export const ProductCardSkeleton: React.FC = () => (
  <div className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30" aria-hidden="true">
    <div className="aspect-[4/3] w-full animate-pulse bg-slate-700/35" />
    <div className="space-y-2.5 p-4"><div className="h-3 w-4/5 animate-pulse rounded-full bg-slate-700/50" /><div className="h-3 w-3/5 animate-pulse rounded-full bg-slate-700/30" /><div className="mt-5 flex justify-between"><div className="h-4 w-20 animate-pulse rounded-full bg-slate-700/45" /><div className="h-9 w-9 animate-pulse rounded-xl bg-slate-700/45" /></div></div>
  </div>
);
