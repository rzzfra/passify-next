"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { SUPPORT_INFO } from "./data/support";
import { AlertTriangle, PackageOpen, RefreshCw } from "lucide-react";
import type {
  Product,
  Category,
  ActiveModalType,
  ProductPlan,
  Order,
  BlogPost,
} from "./types";
import { ShopHeader } from "./components/shop/ShopHeader";
import { ShopHero } from "./components/shop/ShopHero";
import { ShopToolbar, type SortKey } from "./components/shop/ShopToolbar";
import { ProductGrid } from "./components/shop/ProductGrid";
import { ShopBlog } from "./components/shop/ShopBlog";
import { ShopFooter } from "./components/shop/ShopFooter";
import { CartDrawer } from "./components/shop/CartDrawer";
import { BlogDrawer } from "./components/shop/BlogDrawer";
import { ProductCardSkeleton } from "./components/ProductCard";
import { ArticleDetailModal } from "./components/ArticleDetailModal";
import { ProductDetailModal } from "./components/ProductDetailModal";
import { UserModals } from "./components/UserModals";
import { Toast } from "./components/Toast";
import { DynamicCheckoutModal } from "./components/DynamicCheckoutModal";
import { PaymentReceiptModal } from "./components/PaymentReceiptModal";
import { WebAuthModal, type WebAccount } from "./components/WebAuthModal";
import { AccountModal, type AccountInfo } from "./components/AccountModal";
import { AdminApp } from "./admin/AdminApp";
import { apiRequest } from "./utils/api";
import { deriveSubscriptions } from "./utils/subscriptions";
import { useCart } from "./utils/cart";
import { discountPercentOf, hasDiscount } from "./utils/products";

function App() {
  // روتینگ بین پنل مدیریت و فروشگاه
  const [isAdminRoute, setIsAdminRoute] = useState<boolean>(() => {
    return (
      window.location.pathname.startsWith("/admin") ||
      window.location.hash.includes("admin") ||
      new URLSearchParams(window.location.search).get("view") === "admin"
    );
  });

  // محتوای فروشگاه فقط از API می‌آید؛ در خطا یا پاسخ خالی، دیتای نمایشی ساختگی نداریم.
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [catalogStatus, setCatalogStatus] = useState<
    "loading" | "ready" | "error"
  >("loading");
  const [catalogError, setCatalogError] = useState("");
  const [catalogRetryKey, setCatalogRetryKey] = useState(0);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [activeUserModal, setActiveUserModal] = useState<ActiveModalType>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  // فروشگاه واقعی: فیلتر دسته + مرتب‌سازی + فقط تخفیف‌دار + سبد + وبلاگ جدا
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("newest");
  const [onlyDiscount, setOnlyDiscount] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [blogOpen, setBlogOpen] = useState(false);
  const cart = useCart();
  const gridRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [checkoutTarget, setCheckoutTarget] = useState<{
    product: Product;
    plan: ProductPlan;
  } | null>(null);
  // سفارشات واقعی کاربر از سرور (بدون دیتای ساختگی)
  const [orders, setOrders] = useState<Order[]>([]);
  // حساب مشتری فروشگاه — در localStorage نگهداری می‌شود
  const [webUser, setWebUser] = useState<WebAccount | null>(() => {
    try {
      const saved = localStorage.getItem("web_user");
      return saved ? (JSON.parse(saved) as WebAccount) : null;
    } catch {
      return null;
    }
  });
  const [webAuthOpen, setWebAuthOpen] = useState(false);
  // مودال مدیریت حساب کاربری (وضعیت ورود + امکانات حساب)
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "info" | "error";
  } | null>(null);
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    order: Order | null;
    status: "success" | "cancelled" | "failed";
  }>({
    isOpen: false,
    order: null,
    status: "success",
  });

  const showToast = useCallback(
    (message: string, type: "success" | "info" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => {
        setToast(null);
      }, 4000);
    },
    [],
  );

  const accountLabel = webUser?.firstName || webUser?.email || "—";

  const accountInfo: AccountInfo | null = useMemo(() => {
    if (!webUser) return null;
    const fullName = [webUser.firstName, webUser.lastName].filter(Boolean).join(" ").trim();
    return { provider: "web", name: fullName || webUser.email, email: webUser.email };
  }, [webUser]);

  // اشتراک‌های فعال به صورت زنده از روی سفارشات واقعی محاسبه می‌شوند (بدون دیتای ماک)
  const subscriptions = useMemo(
    () => deriveSubscriptions(orders, accountLabel),
    [orders, accountLabel],
  );

  // کاتالوگ مستقل از هویت کاربر فقط یک بار (یا با تلاش مجدد) دریافت می‌شود.
  useEffect(() => {
    const controller = new AbortController();

    const fetchCatalog = async () => {
      setCatalogStatus("loading");
      setCatalogError("");

      const res = await apiRequest<{
        categories?: Category[];
        products?: Product[];
        posts?: BlogPost[];
      }>("/api/client/bootstrap", { signal: controller.signal });

      if (controller.signal.aborted) return;

      if (!res.success || !res.data) {
        setCategories([]);
        setProducts([]);
        setPosts([]);
        setCatalogError(res.error || "دریافت اطلاعات فروشگاه ناموفق بود.");
        setCatalogStatus("error");
        return;
      }

      // آرایه خالی از سمت سرور نیز معتبر است و نباید با دیتای ماک جایگزین شود.
      setCategories(
        Array.isArray(res.data.categories) ? res.data.categories : [],
      );
      setProducts(Array.isArray(res.data.products) ? res.data.products : []);
      setPosts(Array.isArray(res.data.posts) ? res.data.posts : []);
      setCatalogStatus("ready");
    };

    void fetchCatalog();
    return () => controller.abort();
  }, [catalogRetryKey]);

  // باز کردن و بستن مقاله همراه با همگام‌سازی پارامتر آدرس بار (?post=slug)
  const handleOpenPost = useCallback((post: BlogPost) => {
    setSelectedPost(post);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("post", post.slug || post.id);
      window.history.replaceState({}, "", url.toString());
    }
  }, []);

  const handleClosePost = useCallback(() => {
    setSelectedPost(null);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      if (url.searchParams.has("post")) {
        url.searchParams.delete("post");
        window.history.replaceState({}, "", url.toString());
      }
    }
  }, []);

  // شناسایی لینک اشتراک‌گذاری مستقیم مقاله (?post=slug_or_id) پس از لود کاتالوگ
  useEffect(() => {
    if (catalogStatus !== "ready" || posts.length === 0 || selectedPost) return;
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    const postKey = params.get("post");
    if (!postKey) return;

    const matched = posts.find(
      (p) => p.slug === postKey || p.id === postKey,
    );
    if (matched) {
      setSelectedPost(matched);
    }
  }, [catalogStatus, posts, selectedPost]);

  // سفارش‌های حساب وب پس از ورود دریافت می‌شوند.
  useEffect(() => {
    const controller = new AbortController();
    const fetchOrders = async () => {
      if (!webUser?.token) { setOrders([]); return; }
      const result = await apiRequest<{ orders: Order[] }>("/api/client/web-orders", { token: webUser.token, signal: controller.signal });
      if (controller.signal.aborted) return;
      if (result.success && Array.isArray(result.data?.orders)) setOrders(result.data.orders);
      else if (result.error?.includes("منقضی")) {
        setWebUser(null); localStorage.removeItem("web_user"); setOrders([]);
      } else setOrders([]);
    };
    void fetchOrders();
    return () => controller.abort();
  }, [webUser?.token]);

  // بررسی کالبک درگاه پرداخت پس از بازگشت و نمایش فاکتور و رسید رسمی
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    // اولویت با پارامتر صریح وضعیت است تا لغو پرداخت (payment=return + status=cancelled) اشتباه تفسیر نشود
    const paymentStatus = params.get("status") || params.get("payment");
    const orderId = params.get("orderId");
    // فقط در صورتی که پارامتر وضعیت پرداخت برگشتی وجود داشته باشد، مودال فعال می‌شود
    if (!paymentStatus) {
      if (window.location.pathname.startsWith("/api")) {
        window.history.replaceState({}, "", "/");
      }
      return;
    }

    const isSuccess = paymentStatus === "success" || paymentStatus === "return";

    // پس از بازگشت موفق از درگاه، سبد ذخیره‌شده و وضعیت نمایشی هر دو پاک می‌شوند.
    if (isSuccess) cart.clear();

    if (orderId) {
      apiRequest<{ order: Order }>(`/api/client/order/${orderId}`).then(
        (res) => {
          if (res.success && res.data?.order) {
            const freshOrder = res.data.order;
            setReceiptData({
              isOpen: true,
              order: freshOrder,
              status: isSuccess ? "success" : "cancelled",
            });
            setOrders((prev) => [
              freshOrder,
              ...prev.filter((o) => o.id !== orderId),
            ]);
          } else {
            const existing = orders.find(
              (o) => o.id === orderId || o.orderNumber === orderId,
            );
            setReceiptData({
              isOpen: true,
              order: existing || {
                id: orderId,
                orderNumber: orderId,
                productTitle: "سفارش ثبت شده",
                amount: 0,
                status: isSuccess ? "paid_processing" : "cancelled",
              },
              status: isSuccess ? "success" : "cancelled",
            });
          }
        },
      );
    } else if (isSuccess) {
      showToast("پرداخت با موفقیت انجام شد.", "success");
    } else {
      showToast("پرداخت سفارش لغو شد.", "error");
    }

    // پاکسازی کامل آدرس بار و بازگشت به صفحه اصلی فروشگاه
    window.history.replaceState({}, "", "/");
  }, [orders, showToast, cart.clear]);

  // وضعیت باز بودن هر یک از مودال‌ها برای قفل اسکرول
  const isAnyModalOpen = Boolean(
    selectedProduct ||
    activeUserModal ||
    checkoutTarget ||
    receiptData.isOpen ||
    selectedPost ||
    accountModalOpen ||
    webAuthOpen ||
    cartOpen ||
    blogOpen,
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
      };
    }
  }, [isAnyModalOpen]);

  // لیست فروشگاهی: دسته + جستجو + تخفیف + مرتب‌سازی
  const shopProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = [...products];
    if (activeCategory) list = list.filter((p) => p.categoryId === activeCategory);
    if (query)
      list = list.filter(
        (product) =>
          product.title.toLowerCase().includes(query) ||
          product.subtitle.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query)),
      );
    if (onlyDiscount) list = list.filter(hasDiscount);
    if (sortKey === "cheap") list.sort((a, b) => a.price - b.price);
    if (sortKey === "exp") list.sort((a, b) => b.price - a.price);
    if (sortKey === "popular") list.sort((a, b) => b.salesCount - a.salesCount);
    if (sortKey === "discount")
      list.sort((a, b) => discountPercentOf(b) - discountPercentOf(a));
    return list;
  }, [searchQuery, products, activeCategory, onlyDiscount, sortKey]);

  const isSearching = searchQuery.trim().length > 0;
  const activeCategoryName =
    categories.find((category) => category.id === activeCategory)?.name || "";

  // انتخاب دسته‌بندی و پرش نرم به ابتدای کاتالوگ
  const handleSelectCategory = useCallback((id: string | null) => {
    setActiveCategory(id);
    if (id !== null) {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // انتقال به مرحله دریافت فیلدهای داینامیک و درگاه پرداخت
  const handleProceedToCheckout = (product: Product, plan: ProductPlan) => {
    setSelectedProduct(null);
    setCheckoutTarget({ product, plan });
  };

  // اگر روت ادمین باشد، پنل مدیریت مستقل رندر می‌شود
  if (isAdminRoute) {
    return (
      <AdminApp
        onBackToStore={() => {
          window.history.pushState({}, "", "/");
          setIsAdminRoute(false);
        }}
      />
    );
  }

  return (
    <div className="app-surface flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-slate-900 font-vazir text-slate-100 antialiased">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <ShopHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartCount={cart.count}
        onOpenCart={() => setCartOpen(true)}
        account={accountInfo}
        onOpenAccount={() => setAccountModalOpen(true)}
      />

      {/* بدنه فروشگاه: معرفی، فیلتر یکپارچه، کاتالوگ و مقالات */}
      <div className="flex flex-1 flex-col gap-8 pb-10 sm:gap-10">
        {!isSearching && catalogStatus === "ready" && (
          <ShopHero productsCount={products.length} categoriesCount={categories.length} />
        )}

        <ShopToolbar
          title={
            isSearching
              ? `نتایج جستجو برای «${searchQuery.trim()}»`
              : activeCategoryName || "همه محصولات"
          }
          count={shopProducts.length}
          sort={sortKey}
          onSort={setSortKey}
          onlyDiscount={onlyDiscount}
          onToggleDiscount={() => setOnlyDiscount((v) => !v)}
          categories={categories}
          activeCategory={activeCategory}
          onCategory={handleSelectCategory}
        />

        <main id="catalog" ref={gridRef} className="w-full scroll-mt-28">
          {catalogStatus === "loading" && (
            <div className="shell grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          )}

          {catalogStatus === "error" && (
            <div className="mx-auto max-w-md px-4">
              <div className="rounded-2xl border border-rose-500/25 bg-rose-500/5 px-5 py-8 text-center">
                <AlertTriangle className="mx-auto mb-3 h-9 w-9 text-rose-400" />
                <p className="text-sm font-black text-slate-100">
                  ارتباط با فروشگاه برقرار نشد
                </p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-6 text-slate-400">
                  {catalogError}
                </p>
                <button
                  type="button"
                  onClick={() => setCatalogRetryKey((key) => key + 1)}
                  className="mx-auto mt-4 flex items-center gap-2 rounded-xl bg-sky-500 px-4 py-2 text-xs font-bold text-white hover:bg-sky-400"
                >
                  <RefreshCw className="h-4 w-4" />
                  تلاش دوباره
                </button>
              </div>
            </div>
          )}

          {catalogStatus === "ready" && products.length === 0 && (
            <div className="mx-auto max-w-md px-4">
              <div className="rounded-2xl border border-slate-700/60 bg-slate-800/40 px-5 py-10 text-center">
                <PackageOpen className="mx-auto mb-3 h-9 w-9 text-slate-500" />
                <p className="text-sm font-black text-slate-200">
                  هنوز محصولی منتشر نشده است
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  محصولات جدید به‌زودی اینجا نمایش داده می‌شوند.
                </p>
              </div>
            </div>
          )}

          {catalogStatus === "ready" && products.length > 0 && (
            <ProductGrid
              products={shopProducts}
              onSelect={(p) => setSelectedProduct(p)}
              onAddToCart={(p) => {
                cart.add(p);
                showToast(`${p.title} به سبد خرید اضافه شد.`, "success");
              }}
            />
          )}
        </main>

        {!isSearching && catalogStatus === "ready" && posts.length > 0 && (
          <ShopBlog
            posts={posts}
            onSelect={handleOpenPost}
            onOpenAll={() => setBlogOpen(true)}
          />
        )}
      </div>

      <ShopFooter
        supportInfo={SUPPORT_INFO}
        onOpenOrders={() => setActiveUserModal("orders")}
        onOpenSupport={() => setActiveUserModal("support")}
        onOpenBlog={() => setBlogOpen(true)}
      />

      <CartDrawer
        isOpen={cartOpen}
        items={cart.items}
        total={cart.total}
        onClose={() => setCartOpen(false)}
        onQty={cart.setQty}
        onRemove={cart.remove}
        onCheckout={(p) => {
          setCartOpen(false);
          setSelectedProduct(p);
        }}
      />

      <BlogDrawer
        isOpen={blogOpen}
        posts={posts}
        onClose={() => setBlogOpen(false)}
        onSelect={(post) => {
          setBlogOpen(false);
          handleOpenPost(post);
        }}
      />

      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      {/* مودال دریافت فیلدهای داینامیک و هدایت به درگاه */}
      <DynamicCheckoutModal
        product={checkoutTarget?.product || null}
        plan={checkoutTarget?.plan || null}
        onClose={() => setCheckoutTarget(null)}
        webUser={webUser}
        onRequireAuth={() => setWebAuthOpen(true)}
      />

      {/* مودال‌های هدر (اشتراک‌ها، سفارشات، پشتیبانی) */}
      <UserModals
        activeModal={activeUserModal}
        onClose={() => setActiveUserModal(null)}
        subscriptions={subscriptions}
        orders={orders}
        supportInfo={SUPPORT_INFO}
      />

      {/* فاکتور و رسید پرداخت */}
      <PaymentReceiptModal
        isOpen={receiptData.isOpen}
        order={receiptData.order}
        status={receiptData.status}
        onClose={() => {
          setReceiptData((prev) => ({ ...prev, isOpen: false }));
          if (window.location.search.includes("payment")) {
            window.history.replaceState({}, "", window.location.pathname);
          }
        }}
        onViewOrders={() => {
          setReceiptData((prev) => ({ ...prev, isOpen: false }));
          if (window.location.search.includes("payment")) {
            window.history.replaceState({}, "", window.location.pathname);
          }
          setActiveUserModal("orders");
        }}
      />

      {/* مطالعه مقاله */}
      <ArticleDetailModal
        post={selectedPost}
        products={products}
        onClose={handleClosePost}
        onSelectProduct={(product) => {
          handleClosePost();
          setSelectedProduct(product);
        }}
      />

      {/* ورود / ثبت‌نام وب */}
      <WebAuthModal
        isOpen={webAuthOpen}
        onClose={() => setWebAuthOpen(false)}
        onSuccess={(account) => {
          setWebUser(account);
          setWebAuthOpen(false);
          localStorage.setItem("web_user", JSON.stringify(account));
          showToast(
            `خوش آمدید ${account.firstName || account.email}! اکنون می‌توانید سفارش ثبت کنید.`,
            "success",
          );
        }}
      />
      {/* مدیریت حساب */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        account={accountInfo}
        ordersCount={orders.length}
        subscriptionsCount={subscriptions.length}
        webToken={webUser?.token ?? null}
        onLogin={() => setWebAuthOpen(true)}
        onLogout={() => {
          setWebUser(null);
          setOrders([]);
          localStorage.removeItem("web_user");
          showToast("از حساب کاربری خارج شدید.", "info");
        }}
        onOpenOrders={() => {
          setAccountModalOpen(false);
          setActiveUserModal("orders");
        }}
        onOpenSubscriptions={() => {
          setAccountModalOpen(false);
          setActiveUserModal("subscriptions");
        }}
        onOpenSupport={() => {
          setAccountModalOpen(false);
          setActiveUserModal("support");
        }}
        onProfileUpdated={({ firstName, lastName }) => {
          setWebUser((prev) => {
            if (!prev) return prev;
            const next = { ...prev, firstName, lastName };
            localStorage.setItem("web_user", JSON.stringify(next));
            return next;
          });
        }}
        onNotify={showToast}
      />
    </div>
  );
}

export default App;
