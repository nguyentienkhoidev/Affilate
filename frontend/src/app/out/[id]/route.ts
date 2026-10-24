import { NextRequest, NextResponse } from 'next/server';
import mockCoupons from '@/lib/data/mock-coupons.json';
import mockStores from '@/lib/data/mock-stores.json';

const fallbackRedirects: Record<string, string> = {
  '1': 'https://www.nilight.com/?pb_ref=bargorya',
  '2': 'https://neosabers.com/?ref=bargorya',
  '3': 'https://auxito.com/?impact_ref=bargorya',
  '4': 'https://www.anker.com/?cj_ref=bargorya',
  '101': 'https://www.nilight.com/?pb_ref=bargorya',
  '102': 'https://auxito.com/?impact_ref=bargorya',
  '103': 'https://www.nilight.com/collections/clearance?pb_ref=bargorya',
  '104': 'https://www.lasfit.com/?ref=bargorya',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetId = id.trim();

  // 1. Find coupon by id
  const matchedCoupon = (mockCoupons as any[]).find(
    (c) => String(c.id) === targetId || String(c.id).includes(targetId)
  );

  let destination = fallbackRedirects[targetId];

  if (!destination && matchedCoupon) {
    // Look up store affiliateUrl
    const matchedStore = (mockStores as any[]).find(
      (s) => s.slug?.toLowerCase() === matchedCoupon.storeSlug?.toLowerCase()
    );
    destination = matchedStore?.affiliateUrl || matchedStore?.websiteUrl;
  }

  if (!destination) {
    destination = 'https://bargorya.com/stores';
  }

  // 2. Forward incoming UTM and sub-id parameters
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(destination);
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return new NextResponse(null, {
    status: 307,
    headers: {
      Location: targetUrl.toString(),
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
