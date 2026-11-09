import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';
import dealService from '@/services/dealService';

export default async function DealDetailRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await dealService.getDealBySlug(slug);
  if (deal?.storeSlug) {
    permanentRedirect(ROUTES.PUBLIC.STORE_DETAIL(deal.storeSlug));
  }
  permanentRedirect(ROUTES.PUBLIC.STORES);
}
