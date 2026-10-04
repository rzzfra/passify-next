export interface CustomFieldDefinition {
  id: string;
  label: string;
  type: "text" | "email" | "tel" | "textarea" | "select";
  placeholder?: string;
  required: boolean;
  options?: string[]; // برای نوع select
}

export interface ProductPlan {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  isPopular?: boolean;
}

export interface Product {
  id: string;
  title: string;
  subtitle: string;
  categoryId: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  image: string;
  badge?: string;
  rating: number;
  salesCount: number;
  description: string;
  features: string[];
  plans: ProductPlan[];
  customFields?: CustomFieldDefinition[];
  tags: string[];
  isActive?: boolean;
}

export interface Category {
  id: string;
  name: string;
  englishName?: string;
  icon: string;
  description: string;
  gradient?: string;
  accentColor?: string;
  order?: number;
  isActive?: boolean;
  _count?: { products: number };
}

export interface Subscription {
  id: string;
  serviceName: string;
  plan: string;
  accountEmail: string;
  purchaseDate: string;
  expireDate: string;
  daysLeft: number;
  totalDays: number;
  status: "active" | "expiring" | "expired";
  icon: string;
}

export type UserSubscription = Subscription;

export interface Order {
  id: string;
  orderNumber?: string;
  productTitle?: string;
  planName?: string;
  plan?: string;
  amount: number;
  date?: string;
  createdAt?: string;
  status:
    | "pending_payment"
    | "paid_processing"
    | "completed"
    | "cancelled"
    | "processing";
  licenseKey?: string;
  customerData?: string | Record<string, string>;
  product?: Product;
  user?: {
    email?: string;
    username?: string;
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
  };
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface SupportInfo {
  email: string;
  workingHours: string;
  responseTime: string;
  phone: string;
  faq: FAQItem[];
}

export interface AdminUser {
  userId: number;
  username: string;
  name: string;
}

export interface AdminSettings {
  TELEGRAM_BOT_TOKEN: string;
  TELEGRAM_ADMIN_CHANNEL: string;
  ZARINPAL_MERCHANT_ID: string;
  NEXTPAY_API_KEY?: string;
  ZIBAL_MERCHANT_ID?: string;
  PAYMENT_MODE: "sandbox" | "zarinpal" | "nextpay" | "zibal";
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImage: string;
  tags: string[];
  readingTime: string;
  relatedProductId?: string | null;
  relatedProduct?: Product;
  views: number;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface WebUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  photoUrl?: string;
}

export type ActiveModalType =
  | "subscriptions"
  | "orders"
  | "support"
  | "web-auth"
  | "account"
  | null;
