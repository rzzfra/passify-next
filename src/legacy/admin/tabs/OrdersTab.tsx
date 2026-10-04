import React, { useState, useEffect } from "react";
import {
  Search,
  CheckCircle2,
  Clock,
  Send,
  Check,
  X,
  FileText,
  Mail,
  PackageOpen,
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { formatPrice, toPersianDigits } from "../../utils/formatters";
import type { Order } from "../../types";

interface OrdersTabProps {
  token: string;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ token }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // مودال تکمیل سفارش و صدور لایسنس
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [licenseKeyInput, setLicenseKeyInput] = useState("");
  const [completing, setCompleting] = useState(false);

  const fetchOrders = React.useCallback(async () => {
    setLoading(true);
    const res = await apiRequest<{ orders: Order[] }>(
      `/api/admin/orders?status=${statusFilter}`,
      {
        token,
      },
    );
    if (res.success && res.data) {
      setOrders(res.data.orders);
    }
    setLoading(false);
  }, [token, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter((o) => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return true;
    const matchId = o.id.toLowerCase().includes(query);
    const matchProduct = (o.product?.title || o.productTitle || "")
      .toLowerCase()
      .includes(query);
    const matchUser = [
      o.user?.username,
      o.user?.email,
      o.user?.firstName,
      o.user?.lastName,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(query);
    return matchId || matchProduct || matchUser;
  });

  const handleOpenCompleteModal = (order: Order) => {
    setSelectedOrder(order);
    setLicenseKeyInput(order.licenseKey || "");
    setCompleteModalOpen(true);
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    setCompleting(true);
    const res = await apiRequest(
      `/api/admin/orders/${selectedOrder.id}/complete`,
      {
        method: "PATCH",
        token,
        body: JSON.stringify({ licenseKey: licenseKeyInput }),
      },
    );

    setCompleting(false);
    if (res.success) {
      setCompleteModalOpen(false);
      fetchOrders();
    } else {
      alert(res.error || "خطا در ثبت و ارسال وضعیت سفارش");
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm("آیا از لغو این سفارش و اطلاع به کاربر اطمینان دارید؟"))
      return;

    const res = await apiRequest(`/api/admin/orders/${orderId}/cancel`, {
      method: "PATCH",
      token,
    });

    if (res.success) {
      fetchOrders();
    } else {
      alert(res.error || "خطا در لغو سفارش");
    }
  };

  return (
    <div className="space-y-6 font-vazir">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[.14em] text-sky-400">مدیریت فروش</p>
          <h2 className="mt-1 text-xl font-black text-slate-100">سفارش‌ها</h2>
          <p className="mt-1 text-[11px] text-slate-500">بررسی پرداخت، اطلاعات خریدار و ثبت تحویل سفارش</p>
        </div>
        <div className="relative w-full xl:max-w-sm">
          <Search className="absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input type="search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="کد سفارش، محصول، ایمیل یا نام کاربری..." className="h-11 w-full rounded-xl border border-slate-700/60 bg-slate-800/40 pl-4 pr-10 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10" />
        </div>
      </div>

      <div className="rail-scroll flex gap-1.5 overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-800/25 p-1.5">
        {[
          { id: "all", label: "همه" },
          { id: "paid_processing", label: "در انتظار تحویل" },
          { id: "completed", label: "تکمیل‌شده" },
          { id: "cancelled", label: "لغوشده" },
        ].map((filter) => (
          <button key={filter.id} type="button" onClick={() => setStatusFilter(filter.id)} className={`h-9 shrink-0 rounded-lg px-4 text-[10px] font-bold transition ${statusFilter === filter.id ? "bg-slate-100 text-slate-900 shadow-sm" : "text-slate-500 hover:bg-slate-700/40 hover:text-slate-200"}`}>{filter.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-xs text-slate-500"><span className="h-7 w-7 animate-spin rounded-full border-2 border-sky-500/20 border-t-sky-500" />در حال دریافت سفارش‌ها...</div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-700/60 bg-slate-800/20 text-center"><PackageOpen className="h-8 w-8 text-slate-600" /><p className="mt-3 text-sm font-bold text-slate-300">سفارشی پیدا نشد</p><p className="mt-1 text-[10px] text-slate-500">فیلتر یا عبارت جستجو را تغییر دهید.</p></div>
      ) : (
        <div className="grid gap-3">
          {filteredOrders.map((order) => {
            const isCompleted = order.status === "completed";
            const isPending = order.status === "paid_processing";
            const buyerName = [order.user?.firstName, order.user?.lastName].filter(Boolean).join(" ") || order.user?.email || "مشتری فروشگاه";
            const buyerIdentity = order.user?.email || "حساب وب";

            let customerDataObj: Record<string, string> = {};
            try { customerDataObj = typeof order.customerData === "string" ? JSON.parse(order.customerData) : order.customerData || {}; } catch { customerDataObj = {}; }

            return (
              <article key={order.id} className="overflow-hidden rounded-2xl border border-slate-700/50 bg-slate-800/30 transition hover:border-slate-600">
                <div className="flex flex-col gap-3 border-b border-slate-700/45 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400"><Mail className="h-4 w-4" /></span>
                    <div><div className="flex items-center gap-2"><strong className="font-mono text-xs text-slate-100">{order.id}</strong><span className="rounded-md bg-sky-500/10 px-1.5 py-0.5 text-[8px] font-bold text-sky-400">فروشگاه</span></div><time className="mt-0.5 block text-[9px] text-slate-500">{order.createdAt ? new Date(order.createdAt).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" }) : "امروز"}</time></div>
                  </div>
                  <span className={`inline-flex w-fit items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[9px] font-black ${isCompleted ? "bg-emerald-500/10 text-emerald-400" : isPending ? "bg-amber-500/10 text-amber-400" : order.status === "cancelled" ? "bg-rose-500/10 text-rose-400" : "bg-slate-700/50 text-slate-400"}`}>{isCompleted ? <CheckCircle2 className="h-3.5 w-3.5" /> : isPending ? <Clock className="h-3.5 w-3.5" /> : null}{isCompleted ? "تکمیل‌شده" : isPending ? "آماده تحویل" : order.status === "cancelled" ? "لغوشده" : "در انتظار پرداخت"}</span>
                </div>

                <div className="grid gap-5 p-4 md:grid-cols-[1.25fr_1fr_auto] md:items-center">
                  <div><span className="text-[9px] font-bold text-slate-500">محصول</span><strong className="mt-1 block text-xs leading-5 text-slate-100">{order.product?.title || order.productTitle}</strong><span className="mt-0.5 block text-[10px] text-sky-400">{order.planName}</span></div>
                  <div><span className="text-[9px] font-bold text-slate-500">خریدار</span><strong className="mt-1 block text-xs text-slate-200">{buyerName}</strong><span dir="ltr" className="mt-0.5 block w-fit text-[10px] text-slate-500">{buyerIdentity}</span></div>
                  <div className="md:text-left"><span className="text-[9px] font-bold text-slate-500">مبلغ پرداختی</span><strong className="mt-1 block whitespace-nowrap text-sm font-black text-slate-100">{formatPrice(order.amount)}</strong></div>
                </div>

                {Object.keys(customerDataObj).length > 0 && <div className="mx-4 mb-4 rounded-xl border border-slate-700/45 bg-slate-900/35 p-3"><p className="mb-2 flex items-center gap-1.5 text-[9px] font-bold text-slate-500"><FileText className="h-3.5 w-3.5" />اطلاعات ثبت‌شده توسط خریدار</p><div className="grid gap-2 sm:grid-cols-2">{Object.entries(customerDataObj).map(([key, value]) => <div key={key} className="flex items-center justify-between gap-3 rounded-lg bg-slate-800/50 px-3 py-2 text-[10px]"><span className="text-slate-500">{key}</span><span className="select-all text-left font-mono font-bold text-slate-200">{value}</span></div>)}</div></div>}

                {order.licenseKey && <div className="mx-4 mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-2.5"><span className="block text-[9px] text-emerald-500">اطلاعات تحویل‌شده</span><span className="mt-1 block select-all whitespace-pre-wrap font-mono text-[10px] font-bold text-emerald-300">{order.licenseKey}</span></div>}

                <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-700/45 px-4 py-3">
                  {order.status !== "cancelled" && <button type="button" onClick={() => handleCancelOrder(order.id)} className="h-9 rounded-lg px-3 text-[10px] font-bold text-slate-500 transition hover:bg-rose-500/10 hover:text-rose-400">لغو سفارش</button>}
                  <button type="button" onClick={() => handleOpenCompleteModal(order)} className="flex h-9 items-center gap-1.5 rounded-lg bg-sky-500 px-4 text-[10px] font-black text-white transition hover:bg-sky-400"><Send className="h-3.5 w-3.5" />{isCompleted ? "ویرایش تحویل" : "ثبت و تکمیل سفارش"}</button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {completeModalOpen && selectedOrder && (() => {
        return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setCompleteModalOpen(false)}><div className="w-full max-w-md rounded-2xl border border-slate-700/60 bg-slate-900 p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="mb-5 flex items-start justify-between"><div><h3 className="text-sm font-black text-slate-100">ثبت اطلاعات تحویل</h3><p className="mt-1 font-mono text-[9px] text-slate-500">{selectedOrder.id}</p></div><button type="button" onClick={() => setCompleteModalOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-slate-500 hover:text-slate-100"><X className="h-4 w-4" /></button></div>
          <form onSubmit={handleCompleteOrder} className="space-y-4"><p className="rounded-xl bg-slate-800/45 p-3 text-[10px] leading-5 text-slate-400">پس از تأیید، وضعیت سفارش در حساب مشتری به‌روزرسانی می‌شود و اطلاعات تحویل در بخش سفارش‌های او قابل مشاهده خواهد بود.</p><div><label className="mb-1.5 block text-[10px] font-bold text-slate-300">لایسنس، مشخصات حساب یا توضیحات تحویل</label><textarea required rows={5} value={licenseKeyInput} onChange={(e) => setLicenseKeyInput(e.target.value)} placeholder="اطلاعاتی که خریدار باید دریافت کند..." className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800/70 p-3 font-vazir text-xs leading-6 text-slate-100 outline-none focus:border-sky-500/50 focus:ring-4 focus:ring-sky-500/10" /></div><div className="flex justify-end gap-2"><button type="button" onClick={() => setCompleteModalOpen(false)} className="h-10 rounded-xl px-4 text-[10px] font-bold text-slate-500 hover:bg-slate-800">انصراف</button><button type="submit" disabled={completing} className="flex h-10 items-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-[10px] font-black text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50">{completing ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950/25 border-t-slate-950" /> : <Check className="h-4 w-4" />}تأیید و تکمیل</button></div></form>
        </div></div>;
      })()}
    </div>
  );
};
