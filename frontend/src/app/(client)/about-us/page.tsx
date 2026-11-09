import type { Metadata } from 'next';
import StaticPageConfiguredView from '@/components/layout/StaticPageConfiguredView';
import pageService from '@/services/pageService';

export async function generateMetadata(): Promise<Metadata> {
  const page = await pageService.getPageBySlug('about-us');
  if (!page) return {};
  return {
    title: page.metaTitle || `${page.title} | HeyGoodly`,
    description: page.metaDescription || undefined,
  };
}

export default function AboutUsPage() {
  return <StaticPageConfiguredView slug="about-us" />;
}
