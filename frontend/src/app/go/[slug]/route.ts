import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from '@/constants/routes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const targetSlug = slug.toLowerCase().trim().replace(/-store$/, '');
  const backendBase =
    process.env.BACKEND_INTERNAL_URL ||
    (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080').replace(/\/api\/v1\/?$/, '');

  let destination: string | null = null;

  try {
    const backendRes = await fetch(`${backendBase}/go/${encodeURIComponent(targetSlug)}`, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
    });

    const location = backendRes.headers.get('location');
    if (location) {
      destination = location;
    }
  } catch {
    // Fall back to local store page if backend redirect cannot resolve
  }

  if (!destination) {
    const fallbackUrl = new URL(ROUTES.PUBLIC.STORE_DETAIL(targetSlug), request.url);
    return new NextResponse(null, {
      status: 307,
      headers: {
        Location: fallbackUrl.toString(),
        'X-Robots-Tag': 'noindex, nofollow, noarchive',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  }

  const incomingUrl = new URL(request.url);
  const targetUrl = new URL(destination, request.url);
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
