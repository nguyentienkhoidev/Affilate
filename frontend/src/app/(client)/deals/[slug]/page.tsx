import { redirect } from 'next/navigation';
import dealService from '@/services/dealService';

export default async function DealDetailRedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const deal = await dealService.getDealBySlug(slug);
  const targetStore = deal?.storeSlug || 'nilight';
  redirect(`/store/${targetStore}`);
}
