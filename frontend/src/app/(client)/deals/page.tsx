import { permanentRedirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function LegacyDealsRedirectPage() {
  permanentRedirect(ROUTES.PUBLIC.POSTS);
}
