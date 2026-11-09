import type { Metadata } from 'next';
import StaticPageConfiguredView from '@/components/layout/StaticPageConfiguredView';
import pageService from '@/services/pageService';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await pageService.getPageBySlug(slug);
  if (!page) return {};
  return {
    title: page.metaTitle || `${page.title} | HeyGoodly`,
    description: page.metaDescription || undefined,
  };
}

export default async function DynamicStaticPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <StaticPageConfiguredView slug={slug} />;
}
