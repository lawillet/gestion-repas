'use server'

import { Database } from '@/database.types';
import { createClient } from '@/lib/supabase/server';

export const createChild = async (name: string, surname: string, schooling: string) => {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();

    if (userError) throw userError;

    const userId = userData.user?.id;

    if (!userId) {
      throw new Error('User is not authenticated.');
    }

    const payload: Database['public']['Tables']['child']['Insert'] = {
      parent: userId,
      name,
      surname,
      schooling,
    };

    const { data, error } = await supabase
      .from('child')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('createChild insert error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('createChild error:', error);
    throw error;
  }
};

export const getChildren = async () => {
  try {
    const supabase = await createClient();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;

    const userId = userData.user?.id;

    if (!userId) {
      throw new Error('User is not authenticated.');
    }

    const { data, error } = await supabase
      .from('child')
      .select()
      .eq('parent', userId);

    if (error) {
      console.error('getChildren error:', error);
      throw error;
    }
    console.log('getChildren data:', data);
    return data;
  } catch (error) {
    console.error('getChildren error:', error);
    throw error;
  }
};

export const updateChild = async (
  id: number,
  name: string,
  surname: string,
  schooling: string,
) => {
  const supabase = await createClient();
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) throw userError;

  const userId = userData.user?.id;
  if (!userId) {
    throw new Error('User is not authenticated.');
  }

  const { data, error } = await supabase
    .from('child')
    .update({ name, surname, schooling })
    .eq('id', id)
    .eq('parent', userId)
    .select()
    .maybeSingle();

  if (error) throw error;

  return data;
};





