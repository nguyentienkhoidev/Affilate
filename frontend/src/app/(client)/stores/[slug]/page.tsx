import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default async function LegacyStoresDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(ROUTES.PUBLIC.STORE_DETAIL(slug));
}
