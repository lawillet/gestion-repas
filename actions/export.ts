"use server";

import { createClient } from "@/lib/supabase/server";

// export data for reservations order by date for exel file
export async function getReservationsForExport() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("reservation")
    .select(`
      date,
      meal(type),
      child(
        name,
        surname,
        schooling
      )
    `)
    .order("date");

  if (error) throw error;

  return data;
}