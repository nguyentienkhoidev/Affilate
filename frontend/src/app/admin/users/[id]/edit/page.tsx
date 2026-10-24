import UserForm from '../../_components/UserForm';

export const metadata = { title: 'Edit Staff User | Admin' };

export default async function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <UserForm id={id} />;
}
