'use server'

import type { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';


export type CrudTable = keyof Database['public']['Tables'];
export type CrudRow<T extends CrudTable> = Database['public']['Tables'][T]['Row'];
export type CrudInsert<T extends CrudTable> = Database['public']['Tables'][T]['Insert'];
export type CrudUpdate<T extends CrudTable> = Database['public']['Tables'][T]['Update'];

export async function createRecord<T extends CrudTable>(
  table: T,
  values: CrudInsert<T>
): Promise<CrudRow<T> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase 
    .from(table as never)
    .insert(values as never)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CrudRow<T> | null;
}

export async function getAllRecords<T extends CrudTable>(
  table: T
): Promise<CrudRow<T>[]> {
  const supabase = await createClient();

  const { data, error } = await supabase.from(table as never).select();

  if (error) {
    throw error;
  }

  return (data ?? []) as CrudRow<T>[];
}

export async function getRecordById<T extends CrudTable>(
  table: T,
  id: number | string | Date,
  column = 'id'
): Promise<CrudRow<T> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table as never)
    .select()
    .eq(column, id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CrudRow<T> | null;
}

export async function updateRecord<T extends CrudTable>(
  table: T,
  id: number | string,
  values: CrudUpdate<T>,
  column = 'id'
): Promise<CrudRow<T> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table as never)
    .update(values as never)
    .eq(column, id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CrudRow<T> | null;
}

export async function deleteRecord<T extends CrudTable>(
  table: T,
  id: number | string,
  column = 'id'
): Promise<CrudRow<T> | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from(table as never)
    .delete()
    .eq(column, id)
    .select()
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as CrudRow<T> | null;
}

export async function getUserReservations(): Promise<CrudRow<'reservation'>[]> {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw userError;
  }

  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const { data: children, error: childrenError } = await supabase
    .from('child')
    .select('id')
    .eq('parent', userId);

  if (childrenError) {
    throw childrenError;
  }

  const childIds = children.map((child) => child.id);
  if (childIds.length === 0) {
    return [];
  }

  const { data: reservations, error: reservationsError } = await supabase
    .from('reservation')
    .select()
    .in('id_child', childIds)
    .order('date', { ascending: true });

  if (reservationsError) {
    throw reservationsError;
  }

  return reservations;
}


