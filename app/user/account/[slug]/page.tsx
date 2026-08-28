import { getRecordById } from '@/actions/crud';
import UpdateChildForm from './update-child-form';
import { notFound } from 'next/navigation';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const UpdateChild = async ({ params }: PageProps) => {
  const { slug } = await params;
  const childId = Number(slug);

  if (!Number.isInteger(childId)) {
    notFound();
  }

  const child = await getRecordById('child', childId);

  if (!child) {
    notFound();
  }

  return (
    <UpdateChildForm
      childId={child.id}
      defaultValues={{
        name: child.name,
        surname: child.surname,
        schooling: child.schooling as 'primary' | 'preschool',
      }}
    />
  );
};

export default UpdateChild;
