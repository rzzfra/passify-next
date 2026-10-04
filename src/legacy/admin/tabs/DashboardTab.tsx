import React, { useEffect, useState } from "react";
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Package,
  Users,
  ArrowUpRight,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { formatPrice, toPersianDigits } from "../../utils/formatters";
import type { Order } from "../../types";

interface DashboardStats {
  totalSalesAmount: number;
  totalOrdersCount: number;
  pendingOrdersCount: number;
  productsCount: number;
  usersCount: number;
}

interface DashboardTabProps {
  token: string;
  onNavigateToTab: (tab: "products" | "orders") => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  token,
  onNavigateToTab,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      const res = await apiRequest<{
        stats: DashboardStats;
        recentOrders: Order[];
      }>("/api/admin/dashboard", {
        token,
      });
      if (res.success && res.data) {
        setStats(res.data.stats);
        setRecentOrders(res.data.recentOrders);
      }
      setLoading(false);
    };

    fetchDashboard();
  }, [token]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-400">
        <span className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></span>
        <span className="text-xs">در حال بارگذاری اطلاعات داشبورد...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ردیف کارت‌های آمار کلیدی */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* درآمد کل */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              درآمد کل فروش
            </span>
            <span className="text-lg font-black text-slate-100">
              {formatPrice(stats?.totalSalesAmount || 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* سفارشات در صف انجام */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              سفارش‌های در انتظار
            </span>
            <span className="text-lg font-black text-amber-400">
              {toPersianDigits(stats?.pendingOrdersCount || 0)} سفارش
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        {/* کل سفارش‌ها */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              کل سفارشات ثبت شده
            </span>
            <span className="text-lg font-black text-slate-100">
              {toPersianDigits(stats?.totalOrdersCount || 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center">
            <ShoppingBag className="w-5 h-5" />
          </div>
        </div>

        {/* کل محصولات فعال */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              تعداد محصولات
            </span>
            <span className="text-lg font-black text-slate-100">
              {toPersianDigits(stats?.productsCount || 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-500/30 text-sky-400 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        {/* کل کاربران ثبت‌شده */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block mb-1">
              مشتریان فروشگاه
            </span>
            <span className="text-lg font-black text-slate-100">
              {toPersianDigits(stats?.usersCount || 0)}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* بنر اقدام سریع در صورت وجود سفارش معلق */}
      {(stats?.pendingOrdersCount || 0) > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-sm text-slate-100 block">
                تعداد {toPersianDigits(stats?.pendingOrdersCount || 0)} سفارش
                پرداخت‌شده در صف تحویل دارید!
              </span>
              <span className="text-xs text-slate-300">
                می‌توانید با ورود به بخش سفارشات، لایسنس یا مشخصات اکانت را
                تحویل دهید تا خودکار به کاربر ارسال شود.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab("orders")}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-colors shrink-0"
          >
            مشاهده و تحویل
          </button>
        </div>
      )}

      {/* جدول سفارشات اخیر */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-sky-400" />
            <h3 className="font-bold text-sm text-slate-100">
              آخرین سفارشات ثبت‌شده
            </h3>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTab("orders")}
            className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-semibold"
          >
            <span>مشاهده همه سفارشات</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            هنوز سفارشی ثبت نشده است.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">کد سفارش</th>
                  <th className="p-3">محصول و پلن</th>
                  <th className="p-3">مشتری</th>
                  <th className="p-3">مبلغ</th>
                  <th className="p-3">وضعیت</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentOrders.map((order) => {
                  const isCompleted = order.status === "completed";
                  const isPending = order.status === "paid_processing";
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3 font-mono text-slate-300 font-bold">
                        {order.id}
                      </td>
                      <td className="p-3">
                        <span className="font-bold text-slate-100 block">
                          {order.product?.title || order.productTitle}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.planName}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">
                        {order.user?.username ? (
                          <span className="font-mono text-sky-300">
                            @{order.user.username}
                          </span>
                        ) : (
                          <span>
                            {order.user?.email || "مشتری فروشگاه"}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-bold text-sky-400">
                        {formatPrice(order.amount)}
                      </td>
                      <td className="p-3">
                        {isCompleted && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            تکمیل شده
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/15 text-amber-300 font-semibold text-[11px]">
                            <Clock className="w-3 h-3 animate-spin" />
                            در انتظار تحویل
                          </span>
                        )}
                        {order.status === "cancelled" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-500/15 text-rose-400 font-semibold text-[11px]">
                            لغو شده
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
