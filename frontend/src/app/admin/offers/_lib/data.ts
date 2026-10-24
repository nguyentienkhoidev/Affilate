import mockCouponsData from '@/lib/data/mock-coupons.json';

export interface OfferItem {
  id: number;
  storeName: string;
  storeSlug: string;
  title: string;
  discount: string;
  couponCode: string | null;
  offerType: 'coupon' | 'deal';
  isVerified: boolean;
  isExclusive: boolean;
  isActive: boolean;
  usesCount: number;
  verifiedAt: string;
  destinationUrl?: string;
  terms?: string;
}

export const OFFERS_STORE_KEY = 'offers';

export const DEFAULT_OFFERS: OfferItem[] = (mockCouponsData as Array<Record<string, unknown>>).map((c, idx) => ({
  id: Number(c.id || idx + 1),
  storeName: String(c.storeName || (idx % 2 === 0 ? 'Nilight' : 'Neo Sabers')),
  storeSlug: String(c.storeSlug || (idx % 2 === 0 ? 'nilight' : 'neo-sabers')),
  title: String(c.title || 'Special discount offer'),
  discount: String(c.discount || '15% Off'),
  couponCode: c.code ? String(c.code) : null,
  offerType: (c.type === 'deal' ? 'deal' : 'coupon') as 'coupon' | 'deal',
  isVerified: Boolean(c.verified ?? true),
  isExclusive: Boolean(c.exclusive ?? (idx % 3 === 0)),
  isActive: true,
  usesCount: Number(c.successRate ? Number(c.successRate) * 15 : 450),
  verifiedAt: String(c.verifiedDate || 'Today'),
  destinationUrl: `https://${String(c.storeSlug || 'nilight')}.com/?ref=bargorya`,
  terms: 'Valid on regular priced items.',
}));
