'use server';

import type { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { reservationSchema, type ReservationInsert } from '@/schema/reservation.schema';

export const createReservation = async (
  reservations: ReservationInsert[],
  supabaseClient?: SupabaseClient<Database>,
) => {
  const validatedReservations = reservationSchema.array().parse(reservations);
  const supabase = supabaseClient ?? await createClient();

  if (validatedReservations.length === 0) {
    throw new Error('Aucune réservation sélectionnée.');
  }

  const payload: Database['public']['Tables']['reservation']['Insert'][] = validatedReservations.map(
    ({ blocked_id, date, id_child, meal_id, status }) => ({
      blocked_id,
      date,
      id_child,
      meal_id,
      status,
    }),
  );

  const { data, error } = await supabase
    .from('reservation')
    .insert(payload)
    .select();

  if (error) throw error;

  return data;
};

export const createReservations = async (reservations: ReservationInsert[]) => {
  const validatedReservations = reservationSchema.array().parse(reservations);
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  if (validatedReservations.length === 0) {
    throw new Error('Aucune réservation sélectionnée.');
  }

  const childIds = [...new Set(validatedReservations.map(({ id_child }) => id_child))];
  const { data: children, error: childError } = await supabase
    .from('child')
    .select('id')
    .eq('parent', userId)
    .in('id', childIds);

  if (childError) throw childError;
  if (children.length !== childIds.length) {
    throw new Error('Cet enfant ne vous appartient pas.');
  }

  const requestedDates = [...new Set(
    validatedReservations.map(({ id_child, date }) => `${id_child}:${date}`),
  )];
  if (requestedDates.length !== validatedReservations.length) {
    throw new Error('Une même date ne peut être réservée qu’une seule fois pour un enfant.');
  }
  const existingReservations = await supabase
    .from('reservation')
    .select('id_child, date')
    .in('id_child', childIds)
    .in('date', validatedReservations.map(({ date }) => date));

  if (existingReservations.error) throw existingReservations.error;

  const duplicate = existingReservations.data.some(({ id_child, date }) =>
    requestedDates.includes(`${id_child}:${date}`),
  );
  if (duplicate) {
    throw new Error('Une réservation existe déjà pour cet enfant à cette date.');
  }

  return createReservation(validatedReservations, supabase);
};