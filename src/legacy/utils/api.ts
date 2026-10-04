// API_BASE از src/utils/config خوانده می‌شود؛ خالی = همان دامنه فعلی
// (در توسعه می‌توان VITE_API_URL=http://localhost:3001 گذاشت یا از پروکسی Vite استفاده کرد)
import { API_BASE } from "./config";

export async function apiRequest<T = unknown>(
  endpoint: string,
  options: RequestInit & { token?: string } = {},
): Promise<{ success: boolean; data?: T; error?: string }> {
  const { token, headers = {}, ...rest } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...(headers as Record<string, string>),
  };

  if (token) {
    requestHeaders["Authorization"] = `Bearer ${token}`;
  }

  try {
    const url = endpoint.startsWith("http")
      ? endpoint
      : `${API_BASE}${endpoint}`;
    const response = await fetch(url, {
      headers: requestHeaders,
      ...rest,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `خطای سرور: ${response.status}`,
      };
    }

    return { success: true, data };
  } catch (err: unknown) {
    if (
      (err instanceof DOMException && err.name === "AbortError") ||
      (typeof err === "object" && err !== null && (err as { name?: string }).name === "AbortError")
    ) {
      return { success: false, error: "Aborted" };
    }

    console.error(`API request error on ${endpoint}:`, err);
    return {
      success: false,
      error:
        "عدم برقراری ارتباط با سرور. لطفاً از روشن بودن سرور اطمینان حاصل کنید.",
    };
  }
}

export async function apiUploadFile(
  file: File,
  token?: string,
): Promise<{ success: boolean; url?: string; error?: string }> {
  const formData = new FormData();
  formData.append("image", file);

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const url = `${API_BASE}/api/upload`;
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: formData,
    });

    const data = await response.json();
    if (!response.ok) {
      return {
        success: false,
        error: data.error || `خطا در آپلود تصویر: ${response.status}`,
      };
    }

    return { success: true, url: data.url };
  } catch (err) {
    console.error("Upload error:", err);
    return {
      success: false,
      error: "عدم برقراری ارتباط با سرور برای آپلود تصویر.",
    };
  }
}
