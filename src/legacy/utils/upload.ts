// ابزار آپلود تصویر برای پنل ادمین (محصولات و وبلاگ)
import { API_BASE } from "./config";

export async function uploadImage(
  file: File,
  token: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const formData = new FormData();
  formData.append("image", file);

  try {
    const response = await fetch(`${API_BASE}/api/upload`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });

    const data = (await response.json()) as {
      success: boolean;
      url?: string;
      error?: string;
    };

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `خطای سرور: ${response.status}`,
      };
    }

    return { success: true, url: data.url };
  } catch (err) {
    console.error("Upload image error:", err);
    return { success: false, error: "خطا در آپلود تصویر. دوباره تلاش کنید." };
  }
}
