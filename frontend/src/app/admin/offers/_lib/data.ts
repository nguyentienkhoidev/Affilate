export interface OfferItem {
  id: number;
  storeId?: number;
  storeName: string;
  storeSlug: string;
  storeLogo?: string;
  title: string;
  discount: string;
  couponCode: string | null;
  offerType: 'coupon' | 'deal';
  isExclusive: boolean;
  isActive: boolean;
  isVerified?: boolean;
  usesCount: number;
  destinationUrl?: string;
  terms?: string;
  imageUrl?: string;
  tags?: string[];
  hasExpiration?: boolean;
  startAt?: string | null;
  expireAt?: string | null;
  sortOrder?: number;
}

export const OFFERS_STORE_KEY = 'offers';
