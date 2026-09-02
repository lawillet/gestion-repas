import { getRecordById } from "@/actions/crud";
import { notFound } from "next/navigation";
import UpdatePriceForm from './update-price-form';

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const UpdatePrice = async({params}: PageProps) => {
  const { slug } = await params;
  const mealId = Number(slug);

  if (!Number.isInteger(mealId)) {
    notFound();
  }

  const meal = await getRecordById('meal', mealId);

  if (!meal) {
    notFound();
  }

  return (
    <UpdatePriceForm
      mealId={meal.id}
      defaultValues={{
        price: meal.price ?? 0,
        portion: meal.portion as 'primary' | 'preschool',
        type: meal.type as 'soup' | 'meal',
      }}
    />
  );
}

export default UpdatePrice