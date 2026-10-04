import React from "react";
import { Search, BookOpen, X } from "lucide-react";
import type { BlogPost } from "../../types";
import { resolveBackendUrl } from "../../utils/media";

interface P {
  isOpen: boolean;
  posts: BlogPost[];
  onClose: () => void;
  onSelect: (p: BlogPost) => void;
}

export const BlogDrawer: React.FC<P> = ({ isOpen, posts, onClose, onSelect }) => {
  const [q, setQ] = React.useState("");
  if (!isOpen) return null;
  const list = posts.filter(
    (p) =>
      p.title.toLowerCase().includes(q.toLowerCase()) ||
      p.summary.toLowerCase().includes(q.toLowerCase()),
  );
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70" onClick={onClose}>
      <div className="w-full max-w-sm h-full bg-slate-900 border-r border-slate-700/60 flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700/60">
          <span className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />وبلاگ آموزشی
          </span>
          <button type="button" onClick={onClose} className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input type="text" value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجو در مقالات..."
              className="w-full pr-9 pl-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-none" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          {list.length === 0 && <div className="py-12 text-center text-xs text-slate-500">مقاله‌ای یافت نشد.</div>}
          {list.map((post) => (
            <button key={post.id} type="button" onClick={() => onSelect(post)}
              className="w-full flex gap-3 p-2.5 rounded-2xl bg-slate-800/70 border border-slate-700/60 text-right hover:border-amber-500/40">
              <img src={resolveBackendUrl(post.coverImage)} alt={post.title} loading="lazy" className="w-20 h-16 rounded-xl object-cover bg-slate-900 shrink-0" />
              <span className="flex-1 min-w-0">
                <span className="block font-bold text-xs text-slate-100 line-clamp-2 leading-relaxed">{post.title}</span>
                <span className="block text-[11px] text-slate-400 mt-1 line-clamp-2">{post.summary}</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
