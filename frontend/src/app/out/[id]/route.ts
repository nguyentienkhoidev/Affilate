import { NextRequest, NextResponse } from 'next/server';
import { ROUTES } from '@/constants/routes';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const targetId = id.trim();
  const backendBase =
    process.env.BACKEND_INTERNAL_URL ||
    (process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8080').replace(/\/api\/v1\/?$/, '');

  let destination: string | null = null;

  try {
    const backendRes = await fetch(`${backendBase}/out/${encodeURIComponent(targetId)}`, {
      method: 'GET',
      redirect: 'manual',
      cache: 'no-store',
    });

    const location = backendRes.headers.get('location');
    if (location) {
      destination = location;
    }
  } catch {
    // Fall back to stores directory if backend redirect cannot resolve
  }

  if (!destination) {
    const fallbackUrl = new URL(ROUTES.PUBLIC.STORES, request.url);
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
