import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function AdminSettingsTrackingRedirect() {
  redirect(`${ROUTES.ADMIN.SETTINGS}?tab=tracking`);
}
