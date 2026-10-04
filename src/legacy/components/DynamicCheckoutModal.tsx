import React, { useEffect, useState } from "react";
import { ArrowLeft, LockKeyhole, ShieldCheck, X } from "lucide-react";
import type { CustomFieldDefinition, Product, ProductPlan } from "../types";
import type { WebAccount } from "./WebAuthModal";
import { apiRequest } from "../utils/api";
import { formatPrice } from "../utils/formatters";
import { resolveBackendUrl } from "../utils/media";

interface Props {
  product: Product | null;
  plan: ProductPlan | null;
  onClose: () => void;
  webUser?: WebAccount | null;
  onRequireAuth?: () => void;
}

export const DynamicCheckoutModal: React.FC<Props> = ({ product, plan, onClose, webUser, onRequireAuth }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  useEffect(() => { setFormData({}); setValidationError(null); }, [product?.id, plan?.name]);
  if (!product || !plan) return null;
  const fields: CustomFieldDefinition[] = product.customFields || [];

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!webUser?.token) { onClose(); onRequireAuth?.(); return; }
    for (const field of fields) if (field.required && !formData[field.id]?.trim()) { setValidationError(`فیلد «${field.label}» را کامل کنید.`); return; }
    const customerData = Object.fromEntries(fields.filter((field) => formData[field.id]).map((field) => [field.label, formData[field.id]]));
    setIsSubmitting(true); setValidationError(null);
    const result = await apiRequest<{ orderId: string; paymentUrl: string }>("/api/client/checkout", { method: "POST", body: JSON.stringify({ productId: product.id, planName: plan.name, customerData, webToken: webUser.token }) });
    setIsSubmitting(false);
    if (result.success && result.data?.paymentUrl) window.location.href = resolveBackendUrl(result.data.paymentUrl);
    else setValidationError(result.error || "اتصال به درگاه پرداخت ناموفق بود.");
  };

  return <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-4" onClick={onClose}>
    <div className="w-full max-w-lg overflow-hidden rounded-t-3xl border border-slate-700/60 bg-slate-900 shadow-2xl sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-slate-700/50 p-4"><div><p className="text-[10px] text-sky-400">تکمیل خرید</p><h2 className="text-sm font-black text-slate-100">{product.title}</h2></div><button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-800 text-slate-400"><X className="h-4 w-4" /></button></div>
      <form onSubmit={submit} className="space-y-5 p-5">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/35 p-3"><img src={resolveBackendUrl(product.image)} alt="" className="h-14 w-14 rounded-xl object-cover" /><div className="min-w-0 flex-1"><strong className="block truncate text-xs text-slate-100">{plan.name}</strong><span className="mt-1 block text-sm font-black text-emerald-400">{formatPrice(plan.price)}</span></div></div>
        {!webUser?.token ? <button type="button" onClick={() => { onClose(); onRequireAuth?.(); }} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-black text-white"><LockKeyhole className="h-4 w-4" />ورود یا ساخت حساب برای ادامه</button> : <>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] text-emerald-400"><ShieldCheck className="ml-1 inline h-4 w-4" />خرید با حساب {webUser.email}</div>
          {fields.map((field) => <label key={field.id} className="block"><span className="mb-1.5 block text-[11px] font-bold text-slate-300">{field.label}{field.required && <b className="text-rose-400"> *</b>}</span><input type={field.type === "email" ? "email" : "text"} value={formData[field.id] || ""} onChange={(e) => setFormData((prev) => ({ ...prev, [field.id]: e.target.value }))} placeholder={field.placeholder || field.label} className="h-11 w-full rounded-xl border border-slate-700 bg-slate-800/70 px-3 text-sm text-slate-100 outline-none focus:border-sky-500/60" /></label>)}
          {validationError && <p className="rounded-xl bg-rose-500/10 p-3 text-[11px] text-rose-400">{validationError}</p>}
          <button disabled={isSubmitting} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-sky-500 text-sm font-black text-white transition hover:bg-sky-400 disabled:opacity-60">{isSubmitting ? "در حال اتصال..." : <>پرداخت امن <ArrowLeft className="h-4 w-4" /></>}</button>
        </>}
      </form>
    </div>
  </div>;
};
