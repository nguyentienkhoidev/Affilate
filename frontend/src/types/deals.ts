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
  discountLabel?: string;
  couponCode?: string;
  affiliateUrl: string;
  imageUrl: string;
  badge?: string;
  status: DealStatus;
  expiryDate: string;
  verifiedDate: string;
  rating: number;
  reviewCount: number;
  usesCount?: number;
  isVerified?: boolean;
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
  successRate: number;
  isVerified?: boolean;
  usesCount?: number;
  isExclusive?: boolean;
  isCode: boolean;
  terms?: string;
  expiryDate?: string;
  imageUrl?: string;
  affiliateUrl?: string;
  tags?: string[];
}

export interface Store {
  id: string;
  name: string;
  slug: string;
  logoText: string;
  logoBg: string;
  logoUrl?: string;
  bannerUrl?: string;
  categoryId?: number;
  category: string;
  categorySlug?: string;
  rating: number;
  reviewCount: number;
  couponsCount: number;
  maxDiscount: string;
  maxOfferPercent?: number;
  description: string;
  shortDescription?: string;
  popularSearches?: string[];
  faqs?: Array<{ question: string; answer: string }>;
  affiliateUrl: string;
  featured?: boolean;
  isFeatured?: boolean;
  websiteUrl: string;
  domain?: string;
  clicks?: number;
  isActive?: boolean;
  tags?: string[];
}

export interface ArticleSidebarConfig {
  showBrandCard?: boolean;
  showStoreCoupons?: boolean;
  showRelatedReviews?: boolean;
  showGuaranteeCard?: boolean;
  ctaText?: string;
  brandDescription?: string;
  guaranteeTitle?: string;
  guaranteeText?: string;
}

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  categoryId?: number;
  category: string;
  categorySlug?: string;
  storeId?: number;
  storeSlug?: string;
  storeName?: string;
  author: {
    name: string;
    avatar: string;
    role: string;
    bio?: string;
  };
  publishedAt: string;
  publishedIso?: string;
  readTime: string;
  imageUrl: string;
  featured?: boolean;
  tags: string[];
  rating?: string;
  viewCount?: number;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  sidebarConfig?: ArticleSidebarConfig;
}
