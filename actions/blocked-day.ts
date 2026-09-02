"use server";

import { createClient } from "@/lib/supabase/server";
import { blockedDaysSchema } from "@/schema/blocked-day.schema";

export async function importBlockedDays(days: unknown) {
  const validation = blockedDaysSchema.safeParse(days);

  if (!validation.success) {
    throw new Error("Calendrier invalide.");
  }

  const supabase = await createClient();

  const { error } = await supabase
    .from("blocked_day")
    .upsert(validation.data, {
      onConflict: "blocked_date",
    });

  if (error) {
    throw new Error(error.message);
  }

  return {
    inserted: validation.data.length,
  };
}