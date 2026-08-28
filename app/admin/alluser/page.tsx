import { createClient } from "@/lib/supabase/server";
import { columns, Payment } from "./columns"
import { DataTable } from "../../../components/data-table"

async function getData(): Promise<Payment[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("users")
    .select("type, email, id");

  if (error) {
    console.error("Erreur lors du chargement des utilisateurs:", error);
    return [];
  }

  return (data ?? []).map((user) => ({
    id: user.id,
    type: user.type ?? "user",
    email: user.email,
  }));
}

export default async function AdminTable() {
  const data = await getData()

  return (
    <div className="container mx-auto py-10">
      <DataTable columns={columns} data={data} />
    </div>
  )
}