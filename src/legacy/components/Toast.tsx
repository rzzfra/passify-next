import React from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = "success",
  onClose,
}) => {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-sm animate-in slide-in-from-top-4 fade-in duration-200">
      <div
        className={`flex items-center justify-between p-3.5 rounded-2xl shadow-xl border backdrop-blur-xl text-xs font-semibold ${
          type === "success"
            ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200 shadow-emerald-500/10"
            : type === "error"
              ? "bg-rose-950/90 border-rose-500/50 text-rose-200 shadow-rose-500/10"
              : "bg-sky-950/90 border-sky-500/50 text-sky-200 shadow-sky-500/10"
        }`}
      >
        <div className="flex items-center gap-2.5">
          {type === "success" && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {type === "error" && (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          {type === "info" && (
            <Info className="w-4 h-4 text-sky-400 shrink-0" />
          )}
          <span>{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg hover:bg-white/10 text-white/70 hover:text-slate-100"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
