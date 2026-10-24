import OfferForm from '../../_components/OfferForm';

export const metadata = { title: 'Edit Offer | Admin' };

export default async function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <OfferForm id={id} />;
}
