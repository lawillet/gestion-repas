import { createClient } from "@/lib/supabase/server";
import { columns, Meal } from "./columns"
import { DataTable } from "../../../components/data-table"
import { getAllRecords } from "@/actions/crud";

async function getData(): Promise<Meal[]> {
  const getAllMeals = await getAllRecords('meal');
  return getAllMeals.map(meal =>({
    id: meal.id,
    price: meal.price ?? 0,
    portion: meal.portion,
    type: meal.type
  }))

}

export default async function AdminTable() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}