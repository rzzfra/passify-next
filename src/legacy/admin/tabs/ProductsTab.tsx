import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  PlusCircle,
  ToggleLeft,
  ToggleRight,
  Package,
  Star,
  Upload,
  Loader2,
  Image as ImageIcon,
  FileText,
  CreditCard,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { uploadImage } from "../../utils/upload";
import { formatPrice } from "../../utils/formatters";
import { resolveBackendUrl } from "../../utils/media";
import type {
  Product,
  Category,
  CustomFieldDefinition,
  ProductPlan,
} from "../../types";

const BADGE_PRESETS = [
  { label: "دانشجویی 🎓", value: "دانشجویی" },
  { label: "پرفروش 🔥", value: "پرفروش" },
  { label: "ویژه ⭐", value: "ویژه" },
  { label: "تخفیف شگفت‌انگیز 🏷️", value: "تخفیف شگفت‌انگیز" },
  { label: "تحویل آنی ⚡", value: "تحویل آنی" },
  { label: "قانونی و اختصاصی 🔒", value: "قانونی و اختصاصی" },
];

const calculateDiscount = (price: number, originalPrice: number): number => {
  if (originalPrice && originalPrice > price && price > 0) {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  }
  return 0;
};

interface ProductsTabProps {
  token: string;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({ token }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // مودال افزودن / ویرایش محصول
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(
    null,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<
    "basic" | "media" | "content" | "plans" | "fields"
  >("basic");

  // استیت فرم ادیتور
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    subtitle: "",
    categoryId: "",
    price: 0,
    originalPrice: 0,
    discountPercent: 0,
    image: "",
    badge: "",
    description: "",
    featuresText: "",
    plans: [] as ProductPlan[],
    customFields: [] as CustomFieldDefinition[],
    tagsText: "",
    isActive: true,
  });

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    const [prodRes, catRes] = await Promise.all([
      apiRequest<{ products: Product[] }>("/api/admin/products", { token }),
      apiRequest<{ categories: Category[] }>("/api/admin/categories", {
        token,
      }),
    ]);

    if (prodRes.success && prodRes.data) {
      // اطمینان از پارس بودن فیلدهای جیسون
      const list = prodRes.data.products.map((p) => ({
        ...p,
        features:
          typeof p.features === "string"
            ? JSON.parse(p.features)
            : p.features || [],
        plans:
          typeof p.plans === "string" ? JSON.parse(p.plans) : p.plans || [],
        customFields:
          typeof p.customFields === "string"
            ? JSON.parse(p.customFields)
            : p.customFields || [],
        tags: typeof p.tags === "string" ? JSON.parse(p.tags) : p.tags || [],
      }));
      setProducts(list);
    }

    if (catRes.success && catRes.data) {
      setCategories(catRes.data.categories);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // فیلتر محصولات
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // باز کردن مودال برای محصول جدید
  const handleOpenNew = () => {
    setEditingProduct(null);
    setFormData({
      id: "",
      title: "",
      subtitle: "",
      categoryId: categories[0]?.id || "",
      price: 100000,
      originalPrice: 120000,
      discountPercent: 15,
      image:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80",
      badge: "تحویل فوری",
      description: "",
      featuresText: "تحویل فوری و تضمینی\nفعال‌سازی قانونی",
      plans: [
        { id: "1m", name: "۱ ماهه استاندارد", price: 100000, isPopular: true },
      ],
      customFields: [
        {
          id: "account_email",
          label: "ایمیل اکانت جهت فعال‌سازی",
          type: "email",
          placeholder: "user@gmail.com",
          required: true,
        },
      ],
      tagsText: "سرویس دیجیتال, اشتراک",
      isActive: true,
    });
    setModalTab("basic");
    setEditorOpen(true);
  };

  // باز کردن مودال برای ویرایش
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      id: p.id,
      title: p.title,
      subtitle: p.subtitle,
      categoryId: p.categoryId,
      price: p.price,
      originalPrice: p.originalPrice || 0,
      discountPercent: p.discountPercent || 0,
      image: p.image,
      badge: p.badge || "",
      description: p.description,
      featuresText: (p.features || []).join("\n"),
      plans: p.plans || [],
      customFields: p.customFields || [],
      tagsText: (p.tags || []).join(", "),
      isActive: p.isActive ?? true,
    });
    setModalTab("basic");
    setEditorOpen(true);
  };

  // تغییر آنی وضعیت فعال/غیرفعال
  const handleToggleActive = async (productId: string) => {
    const res = await apiRequest<{ isActive: boolean }>(
      `/api/admin/products/${productId}/toggle`,
      {
        method: "PATCH",
        token,
      },
    );
    if (res.success && res.data) {
      setProducts((prev) =>
        prev.map((item) =>
          item.id === productId
            ? { ...item, isActive: res.data!.isActive }
            : item,
        ),
      );
    }
  };

  // حذف محصول
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm("آیا از حذف این محصول اطمینان دارید؟")) return;
    const res = await apiRequest(`/api/admin/products/${productId}`, {
      method: "DELETE",
      token,
    });
    if (res.success) {
      setProducts((prev) => prev.filter((item) => item.id !== productId));
    }
  };

  // ذخیره محصول (ایجاد یا به‌روزرسانی)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      id: formData.id || undefined,
      title: formData.title,
      subtitle: formData.subtitle,
      categoryId: formData.categoryId,
      price: Number(formData.price),
      originalPrice: formData.originalPrice
        ? Number(formData.originalPrice)
        : null,
      discountPercent: formData.discountPercent
        ? Number(formData.discountPercent)
        : null,
      image: formData.image,
      badge: formData.badge || null,
      description: formData.description,
      features: formData.featuresText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      plans: formData.plans,
      customFields: formData.customFields,
      tags: formData.tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      isActive: formData.isActive,
    };

    if (editingProduct?.id) {
      // ویرایش
      const res = await apiRequest(`/api/admin/products/${editingProduct.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setEditorOpen(false);
        fetchData();
      } else {
        alert(res.error || "خطا در ذخیره محصول");
      }
    } else {
      // افزودن
      const res = await apiRequest("/api/admin/products", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setEditorOpen(false);
        fetchData();
      } else {
        alert(res.error || "خطا در ایجاد محصول");
      }
    }
  };

  // مدیریت فیلدهای داینامیک محصول
  const handleAddCustomField = () => {
    const newField: CustomFieldDefinition = {
      id: `field_${Date.now().toString().substring(8)}`,
      label: "فیلد جدید (مثلاً ایمیل یا نام کاربری)",
      type: "text",
      placeholder: "",
      required: true,
    };
    setFormData((prev) => ({
      ...prev,
      customFields: [...prev.customFields, newField],
    }));
  };

  const handleUpdateCustomField = (
    index: number,
    updated: Partial<CustomFieldDefinition>,
  ) => {
    setFormData((prev) => {
      const copy = [...prev.customFields];
      copy[index] = { ...copy[index], ...updated };
      return { ...prev, customFields: copy };
    });
  };

  const handleRemoveCustomField = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index),
    }));
  };

  // مدیریت پلن‌های محصول
  const handleAddPlan = () => {
    const newPlan: ProductPlan = {
      id: `plan_${Date.now().toString().substring(8)}`,
      name: "پلن جدید",
      price: formData.price || 100000,
      originalPrice: 0,
      isPopular: formData.plans.length === 0,
    };
    setFormData((prev) => ({ ...prev, plans: [...prev.plans, newPlan] }));
  };

  const handleUpdatePlan = (index: number, updated: Partial<ProductPlan>) => {
    setFormData((prev) => {
      const copy = [...prev.plans];
      copy[index] = { ...copy[index], ...updated };
      return { ...prev, plans: copy };
    });
  };

  const handleRemovePlan = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      plans: prev.plans.filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-5">
      {/* نوار ابزار بالا: جستجو، فیلتر دسته، دکمه افزودن */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex flex-1 items-center gap-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="جستجوی محصول..."
              className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          >
            <option value="all">همه دسته‌ها ({categories.length})</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن محصول جدید</span>
        </button>
      </div>

      {/* جدول محصولات */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          در حال دریافت محصولات...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">محصول</th>
                  <th className="p-3.5">دسته‌بندی</th>
                  <th className="p-3.5">قیمت</th>
                  <th className="p-3.5">فیلدهای داینامیک</th>
                  <th className="p-3.5">وضعیت</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredProducts.map((product) => {
                  const cat = categories.find(
                    (c) => c.id === product.categoryId,
                  );
                  const isAct = product.isActive ?? true;
                  const customFieldsCount = product.customFields?.length || 0;

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveBackendUrl(product.image)}
                            alt={product.title}
                            className="w-10 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {product.title}
                            </span>
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              {product.subtitle}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[11px]">
                          {cat?.name || product.categoryId}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-bold text-sky-400 block">
                          {formatPrice(product.price)}
                        </span>
                        {product.discountPercent && (
                          <span className="text-[10px] text-rose-400 font-medium">
                            {product.discountPercent}٪ تخفیف
                          </span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold">
                          {customFieldsCount} فیلد دریافت اطلاعات
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(product.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                          {isAct ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                              <span>فعال</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500">
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                              <span>غیرفعال</span>
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(product)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400 transition-colors"
                            title="ویرایش"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* مودال جامع افزودن و ویرایش محصول به صورت تب‌بندی مدرن و منظم */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* ۱. هدر مودال: مشخصات محصول + کلید تغییر وضعیت آنی + بستن */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-slate-100 truncate">
                    {editingProduct
                      ? `ویرایش محصول: ${formData.title || "بدون عنوان"}`
                      : "افزودن محصول جدید به فروشگاه"}
                  </h3>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {editingProduct
                      ? `شناسه: ${formData.id}`
                      : "تنظیم مشخصات، قیمت، پلن‌ها و فیلدهای داینامیک"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* تغییر سریع وضعیت فعال/غیرفعال محصول */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, isActive: !formData.isActive })
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    formData.isActive
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-100"
                  }`}
                  title="وضعیت نمایش در فروشگاه"
                >
                  {formData.isActive ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span className="hidden sm:inline">فعال در فروشگاه</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-slate-400" />
                      <span className="hidden sm:inline">غیرفعال (مخفی)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setEditorOpen(false)}
                  className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ۲. ناوبری تب‌های ادیتور محصول */}
            <div className="grid grid-cols-5 gap-1 p-2 bg-slate-950/70 border-b border-slate-800 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setModalTab("basic")}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all ${
                  modalTab === "basic"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Package className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">مشخصات و قیمت</span>
                <span className="sm:hidden">پایه</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("media")}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all ${
                  modalTab === "media"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">تصویر و برچسب</span>
                <span className="sm:hidden">رسانه</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("content")}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all ${
                  modalTab === "content"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">توضیحات و مزایا</span>
                <span className="sm:hidden">توضیح</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("plans")}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all ${
                  modalTab === "plans"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <CreditCard className="w-3.5 h-3.5 shrink-0" />
                <span className="hidden sm:inline">پلن‌ها</span>
                <span className="sm:hidden">پلن</span>
                {formData.plans.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      modalTab === "plans"
                        ? "bg-white text-sky-600"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {formData.plans.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setModalTab("fields")}
                className={`flex items-center justify-center gap-1.5 py-2 px-1 rounded-xl font-bold transition-all ${
                  modalTab === "fields"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <Sliders className="w-3.5 h-3.5 shrink-0 text-indigo-300" />
                <span className="hidden sm:inline">فیلدهای خرید</span>
                <span className="sm:hidden">فیلد</span>
                {formData.customFields.length > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-black ${
                      modalTab === "fields"
                        ? "bg-white text-indigo-600"
                        : "bg-indigo-500/25 text-indigo-300"
                    }`}
                  >
                    {formData.customFields.length}
                  </span>
                )}
              </button>
            </div>

            {/* ۳. بدنه فرم اختصاصی تب فعال */}
            <form
              onSubmit={handleSaveProduct}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
            >
              {/* ========== تب ۱: مشخصات پایه و قیمت‌گذاری ========== */}
              {modalTab === "basic" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-200 mb-1.5">
                        نام و عنوان محصول *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) =>
                          setFormData({ ...formData, title: e.target.value })
                        }
                        placeholder="مثلاً ChatGPT Plus (GPT-4o)"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-200 mb-1.5">
                        زیرعنوان کوتاه
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) =>
                          setFormData({ ...formData, subtitle: e.target.value })
                        }
                        placeholder="مثلاً دسترسی نامحدود به پیشرفته‌ترین مدل‌های هوش مصنوعی"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-200 mb-1.5">
                        دسته‌بندی محصول *
                      </label>
                      <select
                        required
                        value={formData.categoryId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            categoryId: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.englishName ? `(${c.englishName})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* کارت حرفه‌ای قیمت‌گذاری و تخفیف خودکار */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <h4 className="font-bold text-xs text-slate-100">
                        قیمت‌گذاری محصول و تخفیف
                      </h4>
                      <span className="text-[10px] text-slate-400 mr-auto">
                        (درصد تخفیف با وارد کردن قیمت اصلی به‌صورت خودکار محاسبه
                        می‌شود)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          قیمت فروش (تومان) *
                        </label>
                        <input
                          type="number"
                          required
                          value={formData.price || ""}
                          onChange={(e) => {
                            const newPrice = Number(e.target.value);
                            const autoDiscount = calculateDiscount(
                              newPrice,
                              formData.originalPrice,
                            );
                            setFormData({
                              ...formData,
                              price: newPrice,
                              discountPercent: autoDiscount,
                            });
                          }}
                          placeholder="مثلاً 150000"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500/50"
                        />
                        <span className="text-[10px] text-emerald-400 mt-1 block">
                          {formData.price > 0
                            ? formatPrice(formData.price)
                            : "—"}
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          قیمت اصلی قبل تخفیف (تومان)
                        </label>
                        <input
                          type="number"
                          value={formData.originalPrice || ""}
                          onChange={(e) => {
                            const newOrig = Number(e.target.value);
                            const autoDiscount = calculateDiscount(
                              formData.price,
                              newOrig,
                            );
                            setFormData({
                              ...formData,
                              originalPrice: newOrig,
                              discountPercent: autoDiscount,
                            });
                          }}
                          placeholder="مثلاً 180000"
                          className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500/50"
                        />
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {formData.originalPrice > 0
                            ? formatPrice(formData.originalPrice)
                            : "اختیاری"}
                        </span>
                      </div>

                      <div>
                        <label className="block font-bold text-slate-300 mb-1">
                          درصد تخفیف (%)
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            value={formData.discountPercent || ""}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                discountPercent: Number(e.target.value),
                              })
                            }
                            placeholder="خودکار"
                            className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-amber-300 font-mono text-xs font-bold focus:ring-2 focus:ring-sky-500/50"
                          />
                          {formData.discountPercent > 0 && (
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-amber-400 font-black">
                              ٪{formData.discountPercent} تخفیف
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-sky-400 mt-1 block">
                          محاسبه خودکار سیستم
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ========== تب ۲: تصویر و برچسب‌ها ========== */}
              {modalTab === "media" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* بخش آپلود تصویر محصول */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-sky-400" />
                        <h4 className="font-bold text-xs text-slate-100">
                          تصویر شاخص محصول *
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        فرمت‌های مجاز: JPG, PNG, WEBP (حداکثر ۵MB)
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                      {/* پیش‌نمایش تصویر */}
                      <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-slate-850 border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative group">
                        {formData.image ? (
                          <>
                            <img
                              src={resolveBackendUrl(formData.image)}
                              alt="پیش‌نمایش تصویر محصول"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, image: "" })
                              }
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-300 text-xs font-bold transition-opacity"
                            >
                              حذف تصویر
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-2 text-slate-500">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <span className="text-[10px]">بدون تصویر</span>
                          </div>
                        )}
                      </div>

                      {/* دکمه‌های آپلود و آدرس دستی */}
                      <div className="flex-1 w-full space-y-2.5">
                        <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-bold cursor-pointer transition-all active:scale-98">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                          ) : (
                            <Upload className="w-4 h-4 text-sky-400" />
                          )}
                          <span>
                            {isUploading
                              ? "در حال ارسال فایل..."
                              : "انتخاب و آپلود تصویر از سیستم"}
                          </span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            disabled={isUploading}
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              e.target.value = "";
                              if (!file) return;
                              setUploadError(null);
                              setIsUploading(true);
                              const res = await uploadImage(file, token);
                              setIsUploading(false);
                              if (res.success && res.url) {
                                setFormData((prev) => ({
                                  ...prev,
                                  image: res.url!,
                                }));
                              } else {
                                setUploadError(
                                  res.error || "خطا در آپلود تصویر.",
                                );
                              }
                            }}
                          />
                        </label>

                        <div>
                          <input
                            type="text"
                            required
                            value={formData.image}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                image: e.target.value,
                              })
                            }
                            placeholder="یا آدرس تصویر اینترنتی (URL) را اینجا وارد کنید..."
                            className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white font-mono text-xs focus:ring-2 focus:ring-sky-500/50"
                            dir="ltr"
                          />
                        </div>

                        {uploadError && (
                          <p className="text-rose-400 text-[11px] font-semibold">
                            {uploadError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* برچسب شاخص (Badge) بالای محصول */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200">
                        برچسب شاخص بالای کارت محصول (Badge)
                      </label>
                      {formData.badge && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, badge: "" })
                          }
                          className="text-[11px] text-rose-400 hover:text-rose-300"
                        >
                          ✕ پاک کردن برچسب
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {BADGE_PRESETS.map((p) => (
                        <button
                          key={p.value}
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, badge: p.value })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                            formData.badge === p.value
                              ? "bg-sky-500 text-white shadow-sm ring-2 ring-sky-400/40"
                              : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-slate-100 border border-slate-700/60"
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>

                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) =>
                        setFormData({ ...formData, badge: e.target.value })
                      }
                      placeholder="یا برچسب دلخواه خود را بنویسید (مثلاً: ویژه مهندسین، اکانت اختصاصی و...)"
                      className="w-full px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs"
                    />
                  </div>

                  {/* برچسب‌های کلمات کلیدی (Tags) */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <label className="block font-bold text-slate-200">
                      برچسب‌های جستجو و کلمات کلیدی (با کاما یا ویرگول جدا کنید)
                    </label>
                    <input
                      type="text"
                      value={formData.tagsText}
                      onChange={(e) =>
                        setFormData({ ...formData, tagsText: e.target.value })
                      }
                      placeholder="مثلاً: هوش مصنوعی, چت جی پی تی, اشتراک سالانه, پرطرفدار"
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-xs"
                    />
                  </div>
                </div>
              )}

              {/* ========== تب ۳: توضیحات و ویژگی‌ها ========== */}
              {modalTab === "content" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      توضیحات جامع محصول
                    </label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="توضیحات کامل محصول، شرایط فعال‌سازی، ضمانت و نکات مهم برای مشتری..."
                      className="w-full p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200">
                        ویژگی‌ها و مزایای محصول (هر خط یک مورد)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        به صورت چک‌لیست سبز در کارت محصول نمایش می‌یابد
                      </span>
                    </div>

                    <textarea
                      rows={4}
                      value={formData.featuresText}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          featuresText: e.target.value,
                        })
                      }
                      placeholder="تحویل فوری و آنی&#10;فعال‌سازی روی ایمیل شخصی خریدار&#10;ضمانت کامل بازگشت وجه تا انتهای دوره"
                      className="w-full p-3 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs leading-relaxed font-sans"
                    />

                    {/* پیش‌نمایش آیتم‌های ویژگی */}
                    {formData.featuresText.trim() && (
                      <div className="pt-2 border-t border-slate-800 space-y-1">
                        <span className="text-[10px] text-slate-400 block mb-1">
                          پیش‌نمایش در کارت:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {formData.featuresText
                            .split("\n")
                            .filter((f) => f.trim().length > 0)
                            .map((f, i) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[11px]"
                              >
                                <Check className="w-3 h-3 text-emerald-400" />
                                <span>{f.trim()}</span>
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ========== تب ۴: پلن‌های دوره‌ای ========== */}
              {modalTab === "plans" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-950/70 border border-slate-800">
                    <div>
                      <h4 className="font-bold text-xs text-slate-100">
                        پلن‌های دوره‌ای محصول (۱ ماهه، ۳ ماهه، سالانه...)
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        خریدار می‌تواند در صفحه جزئیات، پلن مورد نظر خود را با
                        قیمت مربوطه انتخاب کند.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPlan}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 text-xs font-black shadow-md transition-all active:scale-95 shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>افزودن پلن جدید</span>
                    </button>
                  </div>

                  {formData.plans.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                      <CreditCard className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">
                        هیچ پلنی تعریف نشده است
                      </p>
                      <button
                        type="button"
                        onClick={handleAddPlan}
                        className="text-xs text-sky-400 hover:underline font-bold"
                      >
                        + افزودن اولین پلن محصول
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {formData.plans.map((plan, pIdx) => (
                        <div
                          key={plan.id}
                          className={`p-3 rounded-2xl border transition-all ${
                            plan.isPopular
                              ? "bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-sm"
                              : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                            {/* دکمه پلن ویژه / پیشنهادی */}
                            <button
                              type="button"
                              onClick={() => {
                                setFormData((prev) => {
                                  const newPlans = prev.plans.map((p, i) => ({
                                    ...p,
                                    isPopular:
                                      i === pIdx ? !p.isPopular : false,
                                  }));
                                  return { ...prev, plans: newPlans };
                                });
                              }}
                              className={`px-2.5 py-2 rounded-xl flex items-center justify-center gap-1 text-xs font-bold shrink-0 transition-all ${
                                plan.isPopular
                                  ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 ring-1 ring-amber-300"
                                  : "bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-750"
                              }`}
                              title="تنظیم به عنوان پلن پیشنهادی ⭐"
                            >
                              <Star
                                className={`w-3.5 h-3.5 ${
                                  plan.isPopular ? "fill-current" : ""
                                }`}
                              />
                              <span>
                                {plan.isPopular ? "پیشنهادی ⭐" : "عادی"}
                              </span>
                            </button>

                            {/* نام پلن */}
                            <div className="flex-1">
                              <input
                                type="text"
                                required
                                value={plan.name}
                                onChange={(e) =>
                                  handleUpdatePlan(pIdx, {
                                    name: e.target.value,
                                  })
                                }
                                placeholder="نام پلن (مثلاً ۳ ماهه اشتراکی)"
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                              />
                            </div>

                            {/* قیمت‌ها و حذف */}
                            <div className="flex items-center gap-2">
                              <div className="relative">
                                <input
                                  type="number"
                                  required
                                  value={plan.price || ""}
                                  onChange={(e) =>
                                    handleUpdatePlan(pIdx, {
                                      price: Number(e.target.value),
                                    })
                                  }
                                  placeholder="قیمت فروش"
                                  className="w-28 px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-emerald-300 font-mono font-bold"
                                />
                                <span className="text-[9px] text-slate-400 block text-center mt-0.5">
                                  {plan.price
                                    ? `${plan.price.toLocaleString("fa-IR")} ت`
                                    : "فروش"}
                                </span>
                              </div>

                              <div className="relative">
                                <input
                                  type="number"
                                  value={plan.originalPrice || ""}
                                  onChange={(e) =>
                                    handleUpdatePlan(pIdx, {
                                      originalPrice: Number(e.target.value),
                                    })
                                  }
                                  placeholder="قیمت قبل تخفیف"
                                  className="w-28 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-xs text-slate-300 font-mono"
                                />
                                <span className="text-[9px] text-slate-500 block text-center mt-0.5">
                                  {plan.originalPrice
                                    ? `${plan.originalPrice.toLocaleString("fa-IR")} ت`
                                    : "اختیاری"}
                                </span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemovePlan(pIdx)}
                                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 rounded-xl transition-colors shrink-0"
                                title="حذف این پلن"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ========== تب ۵: فیلدهای داینامیک فرم خرید ========== */}
              {modalTab === "fields" && (
                <div className="space-y-3 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30">
                    <div>
                      <h4 className="font-bold text-xs text-indigo-200">
                        ⚡️ فیلدهای سفارشی فرم تسویه‌حساب خریدار
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        اطلاعاتی که مشتری باید قبل از اتصال به درگاه تکمیل کند
                        (مانند ایمیل اکانت، نام کاربری یا شناسه فعال‌سازی).
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomField}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition-all active:scale-95 shrink-0"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      <span>افزودن فیلد</span>
                    </button>
                  </div>

                  {formData.customFields.length === 0 ? (
                    <div className="p-8 text-center rounded-2xl bg-slate-950/40 border border-dashed border-slate-800 space-y-2">
                      <Sliders className="w-8 h-8 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 font-bold">
                        هیچ فیلد اضافی تنظیم نشده است
                      </p>
                      <p className="text-[11px] text-slate-500">
                        خرید این محصول بدون نیاز به وارد کردن اطلاعات اضافه و
                        فقط با اتصال به درگاه انجام خواهد شد.
                      </p>
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="text-xs text-indigo-400 hover:underline font-bold pt-1 inline-block"
                      >
                        + افزودن فیلد دریافت اطلاعات (مثل ایمیل اکانت)
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {formData.customFields.map((field, idx) => (
                        <div
                          key={field.id}
                          className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                        >
                          <div className="flex items-center justify-between pb-1 border-b border-slate-800/80">
                            <span className="text-[11px] font-bold text-indigo-300">
                              فیلد شماره {idx + 1}
                            </span>
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) =>
                                    handleUpdateCustomField(idx, {
                                      required: e.target.checked,
                                    })
                                  }
                                  className="rounded bg-slate-800 border-slate-700 text-sky-500"
                                />
                                <span>اجباری</span>
                              </label>

                              <button
                                type="button"
                                onClick={() => handleRemoveCustomField(idx)}
                                className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/15 transition-colors"
                                title="حذف این فیلد"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">
                                عنوان فیلد (Label) *
                              </span>
                              <input
                                type="text"
                                required
                                value={field.label}
                                onChange={(e) =>
                                  handleUpdateCustomField(idx, {
                                    label: e.target.value,
                                  })
                                }
                                placeholder="مثلاً: ایمیل شخصی جهت فعال‌سازی"
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">
                                نوع فیلد *
                              </span>
                              <select
                                value={field.type}
                                onChange={(e) =>
                                  handleUpdateCustomField(idx, {
                                    type: e.target
                                      .value as CustomFieldDefinition["type"],
                                  })
                                }
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                              >
                                <option value="text">متن ساده (Text)</option>
                                <option value="email">
                                  ایمیل معتبر (Email)
                                </option>
                                <option value="tel">شماره تلفن (Phone)</option>
                                <option value="textarea">
                                  متن چند خطی (Textarea)
                                </option>
                                <option value="select">
                                  انتخابی (Dropdown)
                                </option>
                              </select>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 block mb-1">
                                متن راهنما (Placeholder)
                              </span>
                              <input
                                type="text"
                                value={field.placeholder || ""}
                                onChange={(e) =>
                                  handleUpdateCustomField(idx, {
                                    placeholder: e.target.value,
                                  })
                                }
                                placeholder="مثلاً: user@gmail.com"
                                className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ۴. فوتر مودال: دکمه‌های گام قبل/بعد و ذخیره نهایی */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
                <div className="flex items-center gap-1.5">
                  {modalTab !== "basic" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: (
                          | "basic"
                          | "media"
                          | "content"
                          | "plans"
                          | "fields"
                        )[] = ["basic", "media", "content", "plans", "fields"];
                        const currentIndex = tabs.indexOf(modalTab);
                        if (currentIndex > 0)
                          setModalTab(tabs[currentIndex - 1]);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 text-xs"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>مرحله قبل</span>
                    </button>
                  )}

                  {modalTab !== "fields" && (
                    <button
                      type="button"
                      onClick={() => {
                        const tabs: (
                          | "basic"
                          | "media"
                          | "content"
                          | "plans"
                          | "fields"
                        )[] = ["basic", "media", "content", "plans", "fields"];
                        const currentIndex = tabs.indexOf(modalTab);
                        if (currentIndex < tabs.length - 1)
                          setModalTab(tabs[currentIndex + 1]);
                      }}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold flex items-center gap-1 text-xs"
                    >
                      <span>مرحله بعد</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditorOpen(false)}
                    className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 font-bold text-xs"
                  >
                    انصراف
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-black text-xs flex items-center gap-1.5 shadow-lg shadow-sky-500/25 transition-all active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>
                      {editingProduct
                        ? "ذخیره ویرایش محصول"
                        : "ثبت محصول در فروشگاه"}
                    </span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
