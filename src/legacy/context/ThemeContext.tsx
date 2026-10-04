import React, { createContext, useContext, useEffect, useState } from "react";
import { triggerHaptic } from "../utils/formatters";
type Theme = "dark" | "light";
interface ThemeContextType { theme: Theme; isDark: boolean; toggleTheme: () => void; setTheme: (theme: Theme) => void; }
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => { const saved = localStorage.getItem("shop_theme"); if (saved === "light" || saved === "dark") return saved; return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark"; });
  useEffect(() => { const root = document.documentElement; root.classList.toggle("light", theme === "light"); root.classList.toggle("dark", theme === "dark"); root.dataset.theme = theme; root.style.colorScheme = theme; localStorage.setItem("shop_theme", theme); }, [theme]);
  const setTheme = (value: Theme) => { triggerHaptic("light"); setThemeState(value); };
  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");
  return <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggleTheme, setTheme }}>{children}</ThemeContext.Provider>;
};
export function useTheme() { const value = useContext(ThemeContext); if (!value) throw new Error("useTheme must be used within ThemeProvider"); return value; }
