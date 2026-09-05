"use server";

import { createClient } from "@/lib/supabase/server";
import { blockedDaysSchema } from "@/schema/blocked-day.schema";
import { createRecord } from "./crud";
import { getRecordById } from "./crud";

export async function importBlockedDays(days: unknown) {
  const validation = blockedDaysSchema.safeParse(days);
  const dates = validation.data?.map((d) => d.blocked_date);
  // see duplicate
  const duplicates = dates?.filter(
    (date, index) => dates.indexOf(date) !== index
  );
  console.log("Dates en double :", duplicates);

  if (!validation.success) {
    throw new Error("Calendrier invalide.");
  }
  // Merge duplicate blocked days by combining their reasons
  const mergedDays = Array.from(
  validation.data.reduce((map, day) => {
    const existing = map.get(day.blocked_date);
    if (existing) {
      existing.reason = `${existing.reason} / ${day.reason}`;
    } else {
      map.set(day.blocked_date, { ...day });
    }

    return map;
  }, new Map())
  ).map(([, value]) => value);

  const supabase = await createClient();

  const { error } = await supabase
    .from("blocked_day")
    .upsert(mergedDays, {
      onConflict: "blocked_date",
    })
    .select();

  if (error) {
    throw new Error(error.message);
  }

  return {
    inserted: validation.data.length,
  };
}

export const blockedDays = async (dates: string[], reasons: string[]) => {
  const blockedDays = dates.map((date, index) => ({
    blocked_date: date,
    reason: reasons[index] || 'Aucune raison fournie',
  }));
  // Check if the date is already blocked
  await Promise.all(blockedDays.map(async (data) => {
    const existingRecord = await getRecordById('blocked_day', data.blocked_date, 'blocked_date')
    console.log(existingRecord?.blocked_date);
    console.log(data.blocked_date);
    console.log(typeof data.blocked_date);
    if (existingRecord){        
      // TODO: Show a message to the user that the date is already blocked
      return console.log('la date est déjà bloqué');
    }
    await createRecord('blocked_day', { blocked_date: data.blocked_date, reason: data.reason });
  }));

}
