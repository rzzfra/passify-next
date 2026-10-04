import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Layers, Check, X } from "lucide-react";
import { apiRequest } from "../../utils/api";
import { toPersianDigits } from "../../utils/formatters";
import type { Category } from "../../types";

interface CategoriesTabProps {
  token: string;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({ token }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState({
    id: "",
    name: "",
    englishName: "",
    icon: "Layers",
    description: "",
    order: 0,
  });

  const fetchCategories = React.useCallback(async () => {
    setLoading(true);
    const res = await apiRequest<{ categories: Category[] }>(
      "/api/admin/categories",
      { token },
    );
    if (res.success && res.data) {
      setCategories(res.data.categories);
    }
    setLoading(false);
  }, [token]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenNew = () => {
    setEditingCategory(null);
    setFormData({
      id: "",
      name: "",
      englishName: "",
      icon: "Layers",
      description: "",
      order: categories.length + 1,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (c: Category) => {
    setEditingCategory(c);
    setFormData({
      id: c.id,
      name: c.name,
      englishName: c.englishName || "",
      icon: c.icon,
      description: c.description || "",
      order: c.order || 0,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "آیا از حذف این دسته‌بندی اطمینان دارید؟ تمامی محصولات این دسته نیز حذف خواهند شد.",
      )
    )
      return;
    const res = await apiRequest(`/api/admin/categories/${id}`, {
      method: "DELETE",
      token,
    });
    if (res.success) {
      fetchCategories();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCategory) {
      const res = await apiRequest(
        `/api/admin/categories/${editingCategory.id}`,
        {
          method: "PUT",
          token,
          body: JSON.stringify(formData),
        },
      );
      if (res.success) {
        setModalOpen(false);
        fetchCategories();
      }
    } else {
      const res = await apiRequest("/api/admin/categories", {
        method: "POST",
        token,
        body: JSON.stringify(formData),
      });
      if (res.success) {
        setModalOpen(false);
        fetchCategories();
      }
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-white">
            مدیریت دسته‌بندی‌های فروشگاه
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            مدیریت دسته‌بندی‌ها و ترتیب نمایش در فروشگاه
          </p>
        </div>
        <button
          type="button"
          onClick={handleOpenNew}
          className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-white text-xs font-bold shadow-md shadow-sky-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>افزودن دسته جدید</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-xs text-slate-400">
          در حال بارگذاری...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-white">
                        {cat.name}
                      </h4>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {cat.id}
                      </span>
                    </div>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
                    {toPersianDigits(cat._count?.products ?? 0)} محصول
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                  {cat.description || "بدون توضیحات"}
                </p>
              </div>

              <div className="flex items-center justify-end gap-1 pt-3 border-t border-slate-800 mt-3">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(cat)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-sky-500/20 text-slate-300 hover:text-sky-400"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(cat.id)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-300 hover:text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* مودال افزودن / ویرایش دسته‌بندی */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                {editingCategory ? "ویرایش دسته‌بندی" : "افزودن دسته‌بندی جدید"}
              </h3>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  شناسه یکتا (ID) *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingCategory)}
                  value={formData.id}
                  onChange={(e) =>
                    setFormData({ ...formData, id: e.target.value })
                  }
                  placeholder="مثلاً ai یا gaming"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  نام دسته‌بندی (فارسی) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="مثلاً بازی و گیمینگ"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  نام انگلیسی
                </label>
                <input
                  type="text"
                  value={formData.englishName}
                  onChange={(e) =>
                    setFormData({ ...formData, englishName: e.target.value })
                  }
                  placeholder="Gaming & Gift Cards"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  توضیحات کوتاه
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="توضیح جهت نمایش زیر عنوان دسته"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ترتیب نمایش (عدد)
                </label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) =>
                    setFormData({ ...formData, order: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>ذخیره دسته‌بندی</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
