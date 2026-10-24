import MenuForm from '../../_components/MenuForm';

export const metadata = { title: 'Edit Menu Item | Admin' };

export default async function EditMenuPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <MenuForm id={id} />;
}
