import CategoryForm from '../../_components/CategoryForm';

export const metadata = { title: 'Edit Category | Admin' };

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <CategoryForm id={id} />;
}
