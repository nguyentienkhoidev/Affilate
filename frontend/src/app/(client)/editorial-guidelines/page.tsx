import type { Metadata } from 'next';
import StaticPageConfiguredView from '@/components/layout/StaticPageConfiguredView';
import pageService from '@/services/pageService';

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug('editorial-guidelines');
  if (!page) return {};
  return {
    title: page.metaTitle || `${page.title} | HeyGoodly`,
    description: page.metaDescription || undefined,
  };
}

export default function EditorialGuidelinesPage() {
  return <StaticPageConfiguredView slug="editorial-guidelines" />;
}
