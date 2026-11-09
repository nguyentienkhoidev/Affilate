import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function LegacyArticlesDirectoryRedirect() {
  permanentRedirect(ROUTES.PUBLIC.POSTS);
}
