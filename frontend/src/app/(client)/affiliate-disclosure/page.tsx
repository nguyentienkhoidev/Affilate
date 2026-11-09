import type { Metadata } from 'next';
import StaticPageConfiguredView from '@/components/layout/StaticPageConfiguredView';
import pageService from '@/services/pageService';

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug('affiliate-disclosure');
  if (!page) return {};
  return {
    title: page.metaTitle || `${page.title} | HeyGoodly`,
    description: page.metaDescription || undefined,
  };
}

export default function AffiliateDisclosurePage() {
  return <StaticPageConfiguredView slug="affiliate-disclosure" />;
}
