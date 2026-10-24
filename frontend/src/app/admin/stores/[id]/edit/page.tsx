import StoreForm from '../../_components/StoreForm';

export const metadata = { title: 'Edit Merchant Store | Admin' };

export default async function EditStorePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreForm id={id} />;
}
