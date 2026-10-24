export type DealStatus = 'active' | 'expiring' | 'expired';

export interface Deal {
  id: string;
  slug: string;
  title: string;
  summary: string;
  description?: string;
  category: string;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  couponCode?: string;
  affiliateUrl: string;
  imageUrl: string;
  badge?: string;
  status: DealStatus;
  expiryDate: string;
  verifiedDate: string;
  rating: number;
  reviewCount: number;
  isStaffPick?: boolean;
  isHot?: boolean;
  terms?: string;
  pros?: string[];
  cons?: string[];
  specs?: { label: string; value: string }[];
}

export interface Coupon {
  id: string;
  code?: string;
  discount: string;
  title: string;
  description: string;
  storeName: string;
  storeSlug: string;
  verifiedDate: string;
  successRate: number;
  isExclusive?: boolean;
  isVerified?: boolean;
  isCode: boolean;
  terms?: string;
  expiryDate?: string;
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoText: string;
  logoBg: string;
  logoUrl?: string;
  bannerUrl?: string;
  category: string;
  rating: number;
  reviewCount: number;
  couponsCount: number;
  maxDiscount: string;
  description: string;
  affiliateUrl: string;
  featured?: boolean;
  isFeatured?: boolean;
  websiteUrl: string;
  domain?: string;
  network?: string;
  clicks?: number;
  isActive?: boolean;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  author: {
    name: string;
    avatar: string;
    role: string;
  };
  publishedAt: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  tags: string[];
  storeSlug?: string;
  storeName?: string;
}
