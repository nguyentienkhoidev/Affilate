import { NextRequest, NextResponse } from 'next/server';
import mockStores from '@/lib/data/mock-stores.json';

const fallbackRedirects: Record<string, string> = {
  nilight: 'https://www.nilight.com/?pb_ref=bargorya',
  'neo-sabers': 'https://neosabers.com/?ref=bargorya',
  auxito: 'https://auxito.com/?impact_ref=bargorya',
  anker: 'https://www.anker.com/?cj_ref=bargorya',
  hostinger: 'https://www.hostinger.com/?impact_ref=bargorya',
  lasfit: 'https://www.lasfit.com/?ref=bargorya',
  ugreen: 'https://www.ugreen.com/?ref=bargorya',
  'baja-designs': 'https://www.bajadesigns.com/?ref=bargorya',
  'diode-dynamics': 'https://www.diodedynamics.com/?ref=bargorya',
  baseus: 'https://www.baseus.com/?ref=bargorya',
  cricut: 'https://www.cricut.com/?ref=bargorya',
  ecoflow: 'https://www.ecoflow.com/?ref=bargorya',
  jackery: 'https://www.jackery.com/?ref=bargorya',
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const targetSlug = slug.toLowerCase().trim().replace(/-store$/, '');

  // 1. Check in dataset
  const matchedStore = (mockStores as any[]).find(
    (s) => s.slug?.toLowerCase() === targetSlug || s.slug?.toLowerCase() === `${targetSlug}-store`
  );

  let destination = matchedStore?.affiliateUrl || matchedStore?.websiteUrl || fallbackRedirects[targetSlug];

  if (!destination) {
    destination = `https://${targetSlug}.com/?ref=bargorya`;
  }

  // 2. Preserve and forward incoming UTM and sub-id parameters (SRS FE-STORE-11)
  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(destination);
  incomingUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.set(key, value);
  });

  return new NextResponse(null, {
    status: 307, // HTTP 307 Temporary Redirect as required by SEO specification
    headers: {
      Location: targetUrl.toString(),
      'X-Robots-Tag': 'noindex, nofollow, noarchive',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  });
}
