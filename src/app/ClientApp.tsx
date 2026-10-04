"use client";
import App from "@/legacy/App";
import { ThemeProvider } from "@/legacy/context/ThemeContext";
export default function ClientApp() {
  return <ThemeProvider><App /></ThemeProvider>;
}
