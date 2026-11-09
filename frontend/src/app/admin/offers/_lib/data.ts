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
}

export const OFFERS_STORE_KEY = 'offers';
