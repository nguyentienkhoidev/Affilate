import PageForm from '../../_components/PageForm';

export const metadata = { title: 'Edit Static Page | Admin' };

export default async function EditStaticPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PageForm id={id} />;
}
