import React from "react";
import { BookOpen, ChevronLeft, Clock, Eye } from "lucide-react";
import type { BlogPost } from "../../types";
import { toPersianDigits, triggerHaptic } from "../../utils/formatters";
import { resolveBackendUrl } from "../../utils/media";

interface P {
  posts: BlogPost[];
  onSelect: (post: BlogPost) => void;
  onOpenAll: () => void;
}

const VISIBLE_POSTS = 3;

/** بخش راهنمای خرید: آخرین مقالات منتشرشده فروشگاه */
export const ShopBlog: React.FC<P> = ({ posts, onSelect, onOpenAll }) => {
  if (posts.length === 0) return null;
  const visiblePosts = posts.slice(0, VISIBLE_POSTS);

  return (
    <section id="articles" className="shell scroll-mt-28">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-lg font-black text-slate-100">
          <BookOpen className="h-4 w-4 text-amber-400" />
          راهنمای خرید و مقالات
        </h2>
        {posts.length > VISIBLE_POSTS && (
          <button
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onOpenAll();
            }}
            className="shrink-0 text-[11px] font-bold text-sky-400 hover:text-sky-300"
          >
            مشاهده همه ({toPersianDigits(posts.length)})
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
        {visiblePosts.map((post) => (
          <button
            key={post.id}
            type="button"
            onClick={() => {
              triggerHaptic("light");
              onSelect(post);
            }}
            className="group flex gap-3 rounded-2xl border border-slate-700/50 bg-slate-800/30 p-2.5 text-right transition duration-300 hover:-translate-y-1 hover:border-slate-600 hover:bg-slate-800/60 sm:flex-col"
          >
            <img
              src={resolveBackendUrl(post.coverImage)}
              alt={post.title}
              loading="lazy"
              className="h-20 w-24 shrink-0 rounded-xl bg-slate-900 object-cover transition duration-500 group-hover:brightness-110 sm:h-40 sm:w-full"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-1.5">
              <span className="line-clamp-2 text-xs font-bold leading-5 text-slate-100">
                {post.title}
              </span>
              <span className="line-clamp-2 text-[10px] leading-4 text-slate-400 sm:line-clamp-3">
                {post.summary}
              </span>
              <span className="mt-auto flex items-center gap-2.5 text-[10px] text-slate-500">
                <span className="flex items-center gap-0.5">
                  <Clock className="h-3 w-3" />
                  {post.readingTime}
                </span>
                <span className="flex items-center gap-0.5">
                  <Eye className="h-3 w-3" />
                  {toPersianDigits(post.views)}
                </span>
                <span className="mr-auto flex items-center gap-0.5 font-bold text-sky-400">
                  ادامه مطلب
                  <ChevronLeft className="h-3 w-3" />
                </span>
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};
