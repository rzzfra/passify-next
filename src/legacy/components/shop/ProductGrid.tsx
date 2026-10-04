import React from "react";
import { PackageOpen } from "lucide-react";
import type { Product } from "../../types";
import { ProductCard } from "../ProductCard";

export const ProductGrid: React.FC<{ products: Product[]; onSelect: (p: Product) => void; onAddToCart: (p: Product) => void; }> = ({ products, onSelect, onAddToCart }) => {
  if (!products.length) return <div className="shell py-14 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-800/60 text-slate-500"><PackageOpen className="h-6 w-6" /></div><p className="mt-3 text-sm font-black text-slate-200">چیزی پیدا نکردیم</p><p className="mt-1 text-xs text-slate-500">عبارت جستجو یا فیلترها را تغییر بده.</p></div>;
  return <div className="shell"><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">{products.map(product => <ProductCard key={product.id} product={product} onSelectProduct={onSelect} onAddToCart={onAddToCart} />)}</div></div>;
};
