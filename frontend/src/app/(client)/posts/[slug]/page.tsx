import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default async function LegacyPostsDetailRedirect({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  permanentRedirect(ROUTES.PUBLIC.POST_DETAIL(slug));
}
