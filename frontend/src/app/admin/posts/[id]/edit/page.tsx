import PostForm from '../../_components/PostForm';

export const metadata = { title: 'Edit Article | Admin' };

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <PostForm id={id} />;
}
