import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function AdminSettingsSeoRedirect() {
  redirect(`${ROUTES.ADMIN.SETTINGS}?tab=seo`);
}
