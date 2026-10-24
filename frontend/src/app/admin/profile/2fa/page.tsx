import { redirect } from 'next/navigation';
import { ROUTES } from '@/constants/routes';

export default function AdminProfile2FaRedirect() {
  redirect(`${ROUTES.ADMIN.PROFILE}?section=2fa`);
}
