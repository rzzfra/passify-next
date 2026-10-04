import React, { useState, useEffect, useCallback } from "react";
import { AdminLogin } from "./AdminLogin";
import { AdminLayout, type AdminTab } from "./AdminLayout";
import { DashboardTab } from "./tabs/DashboardTab";
import { ProductsTab } from "./tabs/ProductsTab";
import { OrdersTab } from "./tabs/OrdersTab";
import { CategoriesTab } from "./tabs/CategoriesTab";
import { BlogTab } from "./tabs/BlogTab";
import { UsersTab } from "./tabs/UsersTab";
import { SettingsTab } from "./tabs/SettingsTab";
import { apiRequest } from "../utils/api";
import type { AdminUser } from "../types";

interface AdminAppProps {
  onBackToStore: () => void;
}

export const AdminApp: React.FC<AdminAppProps> = ({ onBackToStore }) => {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem("admin_token"),
  );
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem("admin_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [verifying, setVerifying] = useState<boolean>(() =>
    Boolean(localStorage.getItem("admin_token")),
  );

  const handleLogout = useCallback(() => {
    setToken(null);
    setAdminUser(null);
    setVerifying(false);
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_user");
  }, []);

  const handleLoginSuccess = (newToken: string, user: AdminUser) => {
    setToken(newToken);
    setAdminUser(user);
    setVerifying(false);
    localStorage.setItem("admin_token", newToken);
    localStorage.setItem("admin_user", JSON.stringify(user));
  };

  // بررسی اعتبار توکن هنگام لود
  useEffect(() => {
    let isMounted = true;

    if (!token) {
      return;
    }

    const verifyToken = async () => {
      const res = await apiRequest<{ user: AdminUser }>("/api/auth/me", {
        token,
      });
      if (!isMounted) return;

      if (res.success && res.data) {
        setAdminUser(res.data.user);
        localStorage.setItem("admin_user", JSON.stringify(res.data.user));
        setVerifying(false);
      } else {
        handleLogout();
      }
    };

    verifyToken();

    return () => {
      isMounted = false;
    };
  }, [token, handleLogout]);

  if (verifying && token) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-vazir text-xs gap-3">
        <span className="w-8 h-8 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin" />
        <span>در حال بررسی دسترسی مدیریت...</span>
      </div>
    );
  }

  if (!token || !adminUser) {
    return (
      <AdminLogin
        onLoginSuccess={handleLoginSuccess}
        onBackToStore={onBackToStore}
      />
    );
  }

  return (
    <AdminLayout
      user={adminUser}
      activeTab={activeTab}
      onSelectTab={setActiveTab}
      onLogout={handleLogout}
      onGoToStore={onBackToStore}
    >
      {activeTab === "dashboard" && (
        <DashboardTab
          token={token}
          onNavigateToTab={(tab) => setActiveTab(tab)}
        />
      )}
      {activeTab === "products" && <ProductsTab token={token} />}
      {activeTab === "orders" && <OrdersTab token={token} />}
      {activeTab === "categories" && <CategoriesTab token={token} />}
      {activeTab === "blog" && <BlogTab token={token} />}
      {activeTab === "users" && <UsersTab token={token} />}
      {activeTab === "settings" && <SettingsTab token={token} />}
    </AdminLayout>
  );
};
