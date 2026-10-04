import React, { useState, useEffect, useCallback } from "react";
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Check,
  X,
  ToggleLeft,
  ToggleRight,
  Eye,
  Clock,
  BookOpen,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Package,
  Tag,
} from "lucide-react";
import { apiRequest } from "../../utils/api";
import { uploadImage } from "../../utils/upload";
import type { BlogPost, Product } from "../../types";
import { resolveBackendUrl } from "../../utils/media";

interface BlogTabProps {
  token: string;
}

export const BlogTab: React.FC<BlogTabProps> = ({ token }) => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<"content" | "settings">("content");

  // مدال ویرایش/افزودن
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState<{
    id?: string;
    title: string;
    slug: string;
    summary: string;
    content: string;
    coverImage: string;
    tagsText: string;
    readingTime: string;
    relatedProductId: string;
    isPublished: boolean;
  }>({
    title: "",
    slug: "",
    summary: "",
    content: "",
    coverImage: "",
    tagsText: "",
    readingTime: "۳ دقیقه",
    relatedProductId: "",
    isPublished: true,
  });

  const fetchData = useCallback(async () => {
    setLoading(true);
    const [postsRes, productsRes] = await Promise.all([
      apiRequest<{ posts: BlogPost[] }>("/api/admin/posts", { token }),
      apiRequest<{ products: Product[] }>("/api/admin/products", { token }),
    ]);

    if (postsRes.success && postsRes.data?.posts) {
      setPosts(postsRes.data.posts);
    }
    if (productsRes.success && productsRes.data?.products) {
      setProducts(productsRes.data.products);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleOpenNew = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      slug: "",
      summary: "",
      content: "",
      coverImage:
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=700&auto=format&fit=crop&q=80",
      tagsText: "آموزش, ترفند",
      readingTime: "۳ دقیقه",
      relatedProductId: "",
      isPublished: true,
    });
    setModalTab("content");
    setEditorOpen(true);
  };

  const handleOpenEdit = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      id: post.id,
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      content: post.content,
      coverImage: post.coverImage,
      tagsText: (post.tags || []).join(", "),
      readingTime: post.readingTime || "۳ دقیقه",
      relatedProductId: post.relatedProductId || "",
      isPublished: post.isPublished,
    });
    setModalTab("content");
    setEditorOpen(true);
  };

  const handleTogglePublish = async (id: string) => {
    const res = await apiRequest<{ isPublished: boolean }>(
      `/api/admin/posts/${id}/toggle`,
      { method: "PATCH", token },
    );
    if (res.success && res.data) {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, isPublished: res.data!.isPublished } : p,
        ),
      );
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("آیا از حذف این مقاله اطمینان دارید؟")) return;
    const res = await apiRequest(`/api/admin/posts/${id}`, {
      method: "DELETE",
      token,
    });
    if (res.success) {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      title: formData.title,
      slug: formData.slug || undefined,
      summary: formData.summary,
      content: formData.content,
      coverImage: formData.coverImage,
      tags: formData.tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      readingTime: formData.readingTime,
      relatedProductId: formData.relatedProductId || null,
      isPublished: formData.isPublished,
    };

    if (editingPost?.id) {
      const res = await apiRequest(`/api/admin/posts/${editingPost.id}`, {
        method: "PUT",
        token,
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setEditorOpen(false);
        fetchData();
      } else {
        alert(res.error || "خطا در ویرایش مقاله");
      }
    } else {
      const res = await apiRequest("/api/admin/posts", {
        method: "POST",
        token,
        body: JSON.stringify(payload),
      });
      if (res.success) {
        setEditorOpen(false);
        fetchData();
      } else {
        alert(res.error || "خطا در ثبت مقاله");
      }
    }
  };

  const filteredPosts = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.summary.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-5">
      {/* نوار جستجو و دکمه افزودن */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="جستجو در مقالات وبلاگ..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500/50"
          />
        </div>

        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/25 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>نگارش مقاله جدید</span>
        </button>
      </div>

      {/* جدول مقالات */}
      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          در حال بارگذاری مقالات...
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-800/60 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3.5">مقاله</th>
                  <th className="p-3.5">زمان مطالعه</th>
                  <th className="p-3.5">محصول مرتبط</th>
                  <th className="p-3.5">بازدیدها</th>
                  <th className="p-3.5">وضعیت انتشار</th>
                  <th className="p-3.5 text-center">عملیات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredPosts.map((post) => {
                  const relatedProd = products.find(
                    (p) => p.id === post.relatedProductId,
                  );
                  return (
                    <tr
                      key={post.id}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={resolveBackendUrl(post.coverImage)}
                            alt={post.title}
                            className="w-12 h-10 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-100 block">
                              {post.title}
                            </span>
                            <span className="text-[11px] text-slate-400 line-clamp-1">
                              {post.summary}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-slate-800">
                          <Clock className="w-3 h-3 text-sky-400" />
                          <span>{post.readingTime}</span>
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-300">
                        {relatedProd ? (
                          <span className="text-sky-400 font-medium">
                            {relatedProd.title}
                          </span>
                        ) : (
                          <span className="text-slate-500">-</span>
                        )}
                      </td>

                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-slate-400 text-[11px]">
                          <Eye className="w-3 h-3" />
                          <span>{post.views}</span>
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => handleTogglePublish(post.id)}
                          className="flex items-center gap-1.5 text-xs font-semibold"
                        >
                          {post.isPublished ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                              <span>منتشر شده</span>
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-slate-500">
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                              <span>پیش‌نویس</span>
                            </span>
                          )}
                        </button>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(post)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition-colors"
                            title="ویرایش مقاله"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(post.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="حذف مقاله"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* مودال ایجاد / ویرایش مقاله به صورت تب‌بندی مدرن و منظم */}
      {editorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
            {/* ۱. هدر مودال: عنوان مقاله + سوئیچ وضعیت انتشار + بستن */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-2xl bg-sky-500/15 border border-sky-500/30 flex items-center justify-center text-sky-400 shrink-0">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-black text-sm sm:text-base text-slate-100 truncate">
                    {editingPost
                      ? `ویرایش مقاله: ${formData.title || "بدون عنوان"}`
                      : "نگارش مقاله و راهنمای جدید"}
                  </h3>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {editingPost
                      ? "ویرایش محتوا و تنظیمات انتشار"
                      : "تولید محتوای وبلاگ، راهنماهای خرید و آموزش‌ها"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* تغییر سریع وضعیت انتشار در هدر */}
                <button
                  type="button"
                  onClick={() =>
                    setFormData({
                      ...formData,
                      isPublished: !formData.isPublished,
                    })
                  }
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                    formData.isPublished
                      ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25"
                      : "bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25"
                  }`}
                >
                  {formData.isPublished ? (
                    <>
                      <ToggleRight className="w-4 h-4 text-emerald-400" />
                      <span>منتشر شده</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-4 h-4 text-amber-400" />
                      <span>پیش‌نویس</span>
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

            {/* ۲. ناوبری تب‌های ادیتور وبلاگ */}
            <div className="grid grid-cols-2 gap-1 p-2 bg-slate-950/70 border-b border-slate-800 shrink-0 text-xs">
              <button
                type="button"
                onClick={() => setModalTab("content")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition-all ${
                  modalTab === "content"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <FileText className="w-4 h-4" />
                <span>محتوا و متن مقاله</span>
              </button>

              <button
                type="button"
                onClick={() => setModalTab("settings")}
                className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold transition-all ${
                  modalTab === "settings"
                    ? "bg-sky-500 text-white shadow-md shadow-sky-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/60"
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>رسانه و تنظیمات انتشار</span>
              </button>
            </div>

            {/* ۳. بدنه فرم ادیتور */}
            <form
              onSubmit={handleSave}
              className="flex-1 overflow-y-auto p-5 space-y-4 text-xs"
            >
              {/* ========== تب ۱: محتوا و متن مقاله ========== */}
              {modalTab === "content" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  <div>
                    <label className="block font-bold text-slate-200 mb-1.5">
                      عنوان اصلی مقاله *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      placeholder="مثلاً: راهنمای جامع فعال‌سازی و قابلیت‌های ChatGPT Plus و مدل‌های GPT-4o"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/50 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200">
                        خلاصه کوتاه مقاله (توضیحات پیش‌نمایش در کارت‌ها)
                      </label>
                      <span className="text-[10px] text-slate-400">
                        ۱ تا ۲ جمله برای جذب مخاطب
                      </span>
                    </div>
                    <textarea
                      rows={2}
                      value={formData.summary}
                      onChange={(e) =>
                        setFormData({ ...formData, summary: e.target.value })
                      }
                      placeholder="یک یا دو جمله جذاب بنویسید که در اسلایدر و کارت مقاله برای کاربران نمایش یابد..."
                      className="w-full p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white leading-relaxed focus:ring-2 focus:ring-sky-500/50"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-200">
                        متن کامل مقاله و راهنما *
                      </label>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {formData.content.length} کاراکتر
                      </span>
                    </div>
                    <textarea
                      rows={10}
                      required
                      value={formData.content}
                      onChange={(e) =>
                        setFormData({ ...formData, content: e.target.value })
                      }
                      placeholder="متن کامل، سرفصل‌ها، مراحل آموزش، نکات کاربردی و توضیحات را در این قسمت وارد کنید..."
                      className="w-full p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-white text-xs leading-relaxed font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/50 scrollbar-none"
                    />
                  </div>
                </div>
              )}

              {/* ========== تب ۲: رسانه و تنظیمات انتشار ========== */}
              {modalTab === "settings" && (
                <div className="space-y-4 animate-in fade-in duration-150">
                  {/* بخش تصویر کاور مقاله */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-sky-400" />
                        <h4 className="font-bold text-xs text-slate-100">
                          تصویر کاور مقاله *
                        </h4>
                      </div>
                      <span className="text-[10px] text-slate-400">
                        سایز پیشنهادی: 1200x630 یا تصویر عریض
                      </span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-4 pt-1">
                      {/* پیش‌نمایش تصویر کاور */}
                      <div className="w-36 h-24 sm:w-44 sm:h-28 rounded-2xl bg-slate-850 border-2 border-dashed border-slate-700 overflow-hidden flex items-center justify-center shrink-0 relative group">
                        {formData.coverImage ? (
                          <>
                            <img
                              src={resolveBackendUrl(formData.coverImage)}
                              alt="پیش‌نمایش کاور مقاله"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, coverImage: "" })
                              }
                              className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-300 text-xs font-bold transition-opacity"
                            >
                              حذف کاور
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-2 text-slate-500">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                            <span className="text-[10px]">بدون تصویر کاور</span>
                          </div>
                        )}
                      </div>

                      {/* دکمه‌های آپلود و آدرس کاور */}
                      <div className="flex-1 w-full space-y-2.5">
                        <label className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500/15 hover:bg-sky-500/25 border border-sky-500/40 text-sky-300 text-xs font-bold cursor-pointer transition-all active:scale-98">
                          {isUploading ? (
                            <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                          ) : (
                            <Upload className="w-4 h-4 text-sky-400" />
                          )}
                          <span>
                            {isUploading
                              ? "در حال آپلود کاور..."
                              : "انتخاب و آپلود تصویر کاور از سیستم"}
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
                                  coverImage: res.url!,
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
                            value={formData.coverImage}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                coverImage: e.target.value,
                              })
                            }
                            placeholder="یا آدرس تصویر کاور (URL) را اینجا وارد کنید..."
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

                  {/* ردیف تنظیمات: زمان مطالعه و محصول مرتبط */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* زمان تقریبی مطالعه */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <span>زمان تخمینی مطالعه</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {["۲ دقیقه", "۳ دقیقه", "۵ دقیقه", "۸ دقیقه"].map(
                          (t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() =>
                                setFormData({ ...formData, readingTime: t })
                              }
                              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                                formData.readingTime === t
                                  ? "bg-amber-500 text-slate-950 shadow-sm font-black ring-2 ring-amber-400/40"
                                  : "bg-slate-800 text-slate-300 hover:bg-slate-750 border border-slate-700/60"
                              }`}
                            >
                              {t}
                            </button>
                          ),
                        )}
                      </div>
                      <input
                        type="text"
                        value={formData.readingTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            readingTime: e.target.value,
                          })
                        }
                        placeholder="مثلاً: ۴ دقیقه"
                        className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                      />
                    </div>

                    {/* محصول مرتبط */}
                    <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                      <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                        <Package className="w-4 h-4 text-sky-400" />
                        <span>محصول مرتبط پیشنهادی</span>
                      </div>
                      <p className="text-[10px] text-slate-400">
                        کارت این محصول در انتهای مقاله برای تبدیل خواننده به
                        مشتری نمایش داده می‌شود.
                      </p>
                      <select
                        value={formData.relatedProductId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            relatedProductId: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                      >
                        <option value="">-- بدون محصول مرتبط --</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* برچسب‌های مقاله */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <div className="flex items-center gap-1.5 text-slate-200 font-bold">
                      <Tag className="w-4 h-4 text-emerald-400" />
                      <span>برچسب‌ها و تگ‌های موضوعی (با کاما جدا کنید)</span>
                    </div>
                    <input
                      type="text"
                      value={formData.tagsText}
                      onChange={(e) =>
                        setFormData({ ...formData, tagsText: e.target.value })
                      }
                      placeholder="هوش مصنوعی, آموزش, چت جی پی تی, اکانت پرمیوم"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs"
                    />
                    {formData.tagsText.trim() && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {formData.tagsText
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean)
                          .map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-[10px] font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ۴. فوتر مودال وبلاگ: کلید تغییر تب + ذخیره و انصراف */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-800 shrink-0">
                <div>
                  {modalTab === "content" ? (
                    <button
                      type="button"
                      onClick={() => setModalTab("settings")}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-sky-400 font-bold flex items-center gap-1 text-xs transition-colors"
                    >
                      <span>تنظیمات کاور و رسانه</span>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setModalTab("content")}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold flex items-center gap-1 text-xs transition-colors"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                      <span>بازگشت به متن مقاله</span>
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
                      {editingPost ? "ذخیره تغییرات مقاله" : "انتشار مقاله"}
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
