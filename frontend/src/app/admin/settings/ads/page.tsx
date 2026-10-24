import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function AdminSettingsAdsRedirect() {
  redirect(`${ROUTES.ADMIN.SETTINGS}?tab=ads`);
}
