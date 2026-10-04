import React from "react";
import {
  Bot,
  BookOpen,
  Camera,
  Cloud,
  Code2,
  Coffee,
  Cpu,
  CreditCard,
  Dumbbell,
  Flame,
  Gamepad2,
  Gift,
  Globe,
  Headphones,
  Layers,
  LayoutGrid,
  Leaf,
  MonitorSmartphone,
  Music,
  Palette,
  Printer,
  Rocket,
  Send,
  ShieldCheck,
  Sparkles,
  Store,
  Tag,
  Video,
  Wallet,
  Zap,
} from "lucide-react";

/**
 * نام آیکون دسته‌بندی از سرور به صورت رشته ذخیره می‌شود (مثلاً «Bot»).
 * برای جلوگیری از سنگین شدن باندل، فقط نام‌های پرکاربرد نگاشت شده‌اند
 * و هر نام ناشناخته به آیکون پیش‌فرض برمی‌گردد.
 */
const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Bot,
  Send,
  Gamepad2,
  Sparkles,
  Layers,
  Music,
  Video,
  Globe,
  Palette,
  Cpu,
  Cloud,
  Rocket,
  BookOpen,
  Gift,
  CreditCard,
  Wallet,
  Store,
  Tag,
  Zap,
  Camera,
  Code2,
  Dumbbell,
  Leaf,
  Coffee,
  Printer,
  Headphones,
  ShieldCheck,
  Flame,
  LayoutGrid,
  MonitorSmartphone,
};

export const CategoryIcon: React.FC<{ name?: string; className?: string }> = ({
  name,
  className,
}) => {
  const Icon = (name && ICONS[name]) || Layers;
  return <Icon className={className} />;
};
