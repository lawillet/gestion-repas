"use server";

import { createClient } from "@/lib/supabase/server";

// export data for reservations order by date for exel file
export async function getReservationsForExport(start?: string, end?: string) {
  const supabase = await createClient();

  let query = supabase
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

  if (start) {
    query = query.gte("date", start);
  }

  if (end) {
    query = query.lte("date", end);
  }

  const { data, error } = await query;

  if (error) throw error;

  return data;
}