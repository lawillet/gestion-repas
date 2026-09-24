"use server";

import { createClient } from "@/lib/supabase/server";
import { 
  blockedDaysSchema,
  blockedDaysCreateSchema
 } from "@/schema/blocked-day.schema";
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
  if (!Array.isArray(dates) || !Array.isArray(reasons)) {
    return {
      success: false,
      errors: [{
        index: null,
        date: null,
        errors: ['Les paramètres dates et reasons doivent être des tableaux.'],
      }],
    };
  }

  if (dates.length !== reasons.length) {
    return {
      success: false,
      errors: [{
        index: null,
        date: null,
        errors: ['Le nombre de dates et de raisons doit être identique.'],
      }],
    };
  }

  const validationErrors: Array<{ index: number; date: string; errors: string[] }> = [];

  const blockedDaysToInsert = dates.flatMap((date, index) => {
    const payload = {
      blocked_date: date,
      reason: reasons[index] ?? 'Aucune raison fournie',
    };

    const validation = blockedDaysCreateSchema.safeParse(payload);

    if (!validation.success) {
      validationErrors.push({
        index,
        date,
        errors: validation.error.issues.map((issue) => issue.message),
      });
      return [];
    }

    return [payload];
  });

  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors.map((error) => ({
        index: error.index,
        date: error.date,
        errors: error.errors,
      })),
    };
  }

  await Promise.all(
    blockedDaysToInsert.map(async (data) => {
      const existingRecord = await getRecordById('blocked_day', data.blocked_date, 'blocked_date');

      if (existingRecord) {
        return console.log('la date est déjà bloquée');
      }

      await createRecord('blocked_day', {
        blocked_date: data.blocked_date,
        reason: data.reason,
      });
    })
  );

  return {
    success: true,
    inserted: blockedDaysToInsert.length,
    errors: [],
  };
};
