import React, { useState, useMemo } from "react";
import {
  X,
  Clock,
  Eye,
  Calendar,
  Share2,
  Check,
  BookOpen,
  ArrowLeft,
  ShoppingBag,
  Link2,
  Copy,
  Send,
  MessageCircle,
} from "lucide-react";
import type { BlogPost, Product } from "../types";
import { formatPrice, triggerHaptic } from "../utils/formatters";
import { resolveBackendUrl } from "../utils/media";

// رندر ساده متن مقاله به صورت ایمن همراه با پشتیبانی از بولد و کد درون‌خطی
function renderInlineText(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong key={match.index} className="font-black text-slate-100">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 font-mono text-[11px] text-sky-300"
        >
          {token.slice(1, -1)}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

// ساخت ساختار یکپارچه محتوای مقاله داخل یک بلوک واحد
const renderArticleContent = (content: string) => {
  const blocks = content
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .filter((block) => block.trim());

  return blocks.map((rawBlock, index) => {
    const block = rawBlock.trim();

    // تیترهای Markdown: # ، ## ، ###
    const heading = block.match(/^(#{1,3})\s+(.+)$/s);
    if (heading) {
      const level = heading[1].length;
      return (
        <div
          key={index}
          className={`flex items-center gap-2 pt-4 pb-1 text-slate-100 font-black border-b border-slate-700/40 ${
            level === 1 ? "text-base sm:text-lg text-sky-300 mt-6 first:mt-0" : "text-sm sm:text-base mt-4"
          }`}
        >
          <span className="w-1.5 h-4 rounded-full bg-sky-400 shrink-0" />
          <span>{heading[2]}</span>
        </div>
      );
    }

    // نقل‌قول Markdown: >
    if (block.startsWith(">")) {
      const quoteText = block
        .split("\n")
        .map((l) => l.replace(/^>\s?/, "").trim())
        .join(" ");
      return (
        <blockquote
          key={index}
          className="my-3 pr-3 border-r-2 border-sky-400/80 text-xs sm:text-sm text-sky-200/90 leading-7 italic bg-sky-500/5 py-2 pl-3 rounded-l-xl"
        >
          {renderInlineText(quoteText)}
        </blockquote>
      );
    }

    const lines = block
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
    const isBulletList = lines.every((line) => /^[-*•]\s+/.test(line));
    const isNumberedList = lines.every((line) => /^\d+[.)-]\s+/.test(line));

    // لیست‌ها به عنوان بخشی از همان بلوک واحد، بدون کادر و جعبه جداگانه
    if (isBulletList || isNumberedList) {
      const ListTag = isNumberedList ? "ol" : "ul";
      return (
        <ListTag
          key={index}
          className={`my-2 space-y-1.5 pr-5 text-xs sm:text-sm leading-7 text-slate-300 ${
            isNumberedList ? "list-decimal" : "list-disc"
          }`}
        >
          {lines.map((line, lineIndex) => (
            <li
              key={lineIndex}
              className="marker:font-bold marker:text-sky-400 pr-1"
            >
              {renderInlineText(
                line.replace(isNumberedList ? /^\d+[.)-]\s+/ : /^[-*•]\s+/, ""),
              )}
            </li>
          ))}
        </ListTag>
      );
    }

    // پاراگراف متنی ساده درون بلاک
    return (
      <p
        key={index}
        className="text-xs sm:text-sm leading-7 sm:leading-8 text-slate-300 text-justify"
      >
        {lines.map((line, lineIndex) => (
          <React.Fragment key={lineIndex}>
            {renderInlineText(line)}
            {lineIndex < lines.length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    );
  });
};

interface ArticleDetailModalProps {
  post: BlogPost | null;
  products: Product[];
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ArticleDetailModal: React.FC<ArticleDetailModalProps> = ({
  post,
  products,
  onClose,
  onSelectProduct,
}) => {
  const [copiedShare, setCopiedShare] = useState(false);

  // تولید لینک مستقیم و معتبر برای این پست وبلاگ
  const shareUrl = useMemo(() => {
    if (!post || typeof window === "undefined") return "";
    const key = post.slug || post.id;
    return `${window.location.origin}${window.location.pathname}?post=${encodeURIComponent(key)}`;
  }, [post]);

  if (!post) return null;

  const relatedProduct =
    post.relatedProduct || products.find((p) => p.id === post.relatedProductId);

  // کپی لینک در کلیپ‌بورد با پشتیبانی کامل
  const copyLinkToClipboard = async () => {
    triggerHaptic("light");
    if (!shareUrl) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = shareUrl;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopiedShare(true);
      setTimeout(() => setCopiedShare(false), 2200);
    } catch {
      window.prompt("لینک مقاله را کپی کنید:", shareUrl);
    }
  };

  // هندلر دکمه هدر: Web Share API یا کپی
  const handleShare = async () => {
    triggerHaptic("light");
    if (!shareUrl) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.summary || post.title,
          url: shareUrl,
        });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      }
    }
    await copyLinkToClipboard();
  };

  // ارسال به شبکه‌های اجتماعی
  const openSocialShare = (platform: "telegram" | "whatsapp" | "twitter") => {
    triggerHaptic("light");
    if (!shareUrl) return;

    const text = encodeURIComponent(`${post.title}\n${post.summary || ""}`);
    const encodedUrl = encodeURIComponent(shareUrl);
    let target = "";

    if (platform === "telegram") {
      target = `https://t.me/share/url?url=${encodedUrl}&text=${text}`;
    } else if (platform === "whatsapp") {
      target = `https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`;
    } else if (platform === "twitter") {
      target = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
    }

    if (target) {
      window.open(target, "_blank", "noopener,noreferrer");
    }
  };

  const handleProductClick = () => {
    if (!relatedProduct) return;
    triggerHaptic("medium");
    onClose();
    onSelectProduct(relatedProduct);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      style={{ touchAction: "none" }}
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col scrollbar-none text-right"
        onClick={(e) => e.stopPropagation()}
        style={{ touchAction: "pan-y" }}
      >
        {/* نوار بالای مودال */}
        <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-sky-400" />
            <span className="text-xs font-bold text-slate-200">
              مقاله و راهنمای آموزشی
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors"
              title="اشتراک‌گذاری"
            >
              {copiedShare ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-800 text-slate-300 hover:text-slate-100 transition-colors active:scale-90"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* کاور اصلی تصویر */}
        <div className="relative w-full h-52 sm:h-60 overflow-hidden bg-slate-950">
          <img
            src={resolveBackendUrl(post.coverImage)}
            alt={post.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />

          {/* تگ‌های روی کاور */}
          <div className="absolute bottom-3 right-4 flex flex-wrap gap-1.5">
            {(post.tags || []).map((tag, idx) => (
              <span
                key={idx}
                className="px-2.5 py-0.5 rounded-lg bg-sky-500/90 text-white font-bold text-[10px] shadow"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* محتوای متنی مقاله */}
        <div className="space-y-5 p-5 sm:p-7">
          {/* متادیتا: زمان مطالعه، تاریخ، بازدید */}
          <div className="flex items-center gap-3 text-[11px] text-slate-400 pb-2 border-b border-slate-800">
            <span className="inline-flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              <span>{post.readingTime || "۳ دقیقه"}</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-slate-400" />
              <span>{post.views} بازدید</span>
            </span>

            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>
                {post.createdAt
                  ? new Date(post.createdAt).toLocaleDateString("fa-IR")
                  : "به‌تازگی"}
              </span>
            </span>
          </div>

          {/* تیتر اصلی مقاله */}
          <h1 className="text-xl sm:text-2xl font-black text-slate-100 leading-relaxed">
            {post.title}
          </h1>

          {/* خلاصه مقاله */}
          {post.summary && (
            <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 text-sm text-sky-200 leading-7">
              {post.summary}
            </div>
          )}

          {/* بدنه مقاله درون یک بلاک واحد، منظم و یکدست */}
          <article
            dir="rtl"
            className="article-content rounded-2xl border border-slate-800 bg-slate-950/50 p-4 sm:p-6 space-y-4 text-right font-vazir shadow-inner"
          >
            {renderArticleContent(post.content || "")}
          </article>

          {/* بلوک اشتراک‌گذاری با لینک مستقیم مطلب */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 sm:p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-200">
                <Link2 className="w-4 h-4 text-sky-400" />
                <span>اشتراک‌گذاری لینک مستقیم این مطلب</span>
              </div>
              <span className="text-[10px] text-slate-500">
                لینک اختصاصی مقاله
              </span>
            </div>

            {/* جعبه لینک با دکمه کپی */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1.5 pl-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                dir="ltr"
                className="flex-1 bg-transparent border-none text-[11px] font-mono text-slate-300 px-2 outline-none select-all truncate"
              />
              <button
                type="button"
                onClick={copyLinkToClipboard}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 active:scale-95 ${
                  copiedShare
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-sky-500 hover:bg-sky-400 text-white shadow-sm shadow-sky-500/20"
                }`}
              >
                {copiedShare ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>کپی شد!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>کپی لینک</span>
                  </>
                )}
              </button>
            </div>

            {/* کلیدهای سریع اشتراک در پیام‌رسان‌ها */}
            <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
              <span>ارسال سریع به:</span>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => openSocialShare("telegram")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 hover:text-sky-300 border border-slate-700/60 transition-colors text-[10px] font-bold"
                  title="ارسال به تلگرام"
                >
                  <Send className="w-3 h-3 text-sky-400" />
                  <span>تلگرام</span>
                </button>
                <button
                  type="button"
                  onClick={() => openSocialShare("whatsapp")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-emerald-500/20 hover:text-emerald-300 border border-slate-700/60 transition-colors text-[10px] font-bold"
                  title="ارسال به واتساپ"
                >
                  <MessageCircle className="w-3 h-3 text-emerald-400" />
                  <span>واتساپ</span>
                </button>
                <button
                  type="button"
                  onClick={() => openSocialShare("twitter")}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors text-[10px] font-bold"
                  title="اشتراک در شبکه X"
                >
                  <span>X (توییتر)</span>
                </button>
              </div>
            </div>
          </div>

          {/* محصول مرتبط با این مقاله (در صورت وجود) */}
          {relatedProduct && (
            <div className="mt-6 p-4 rounded-2xl bg-gradient-to-br from-slate-800/90 to-slate-900 border border-sky-500/30 space-y-3">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-sky-400" />
                <span className="text-xs font-bold text-sky-300">
                  محصول مرتبط با این مقاله:
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                <div className="flex items-center gap-3">
                  <img
                    src={resolveBackendUrl(relatedProduct.image)}
                    alt={relatedProduct.title}
                    className="w-12 h-12 rounded-xl object-cover bg-slate-800 border border-slate-700 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-slate-100 text-xs block">
                      {relatedProduct.title}
                    </span>
                    <span className="text-emerald-400 font-black text-xs block mt-0.5">
                      {formatPrice(relatedProduct.price)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProductClick}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs shadow-md shadow-sky-500/20 transition-all active:scale-95 shrink-0"
                >
                  <span>مشاهده محصول</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* دکمه بستن در انتهای مقاله */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/95 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
          >
            بستن و بازگشت به فروشگاه
          </button>
        </div>
      </div>
    </div>
  );
};
