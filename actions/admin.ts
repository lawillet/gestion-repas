'use server'
import { inscriptionSchemaServer } from "@/schema/auth.schema";
import { createClient } from "@/lib/supabase/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { ADMIN } from "@/constants/constants";
import { updateRecord } from "@/actions/crud";

// create user with admin right
export const signupAdmin = async (inscription: inscriptionSchemaServer) => {
  try {
    const validatedInscription = inscriptionSchemaServer.parse(inscription);
    const supabase = await createClient();

    const { data: authData, error: authError } = await supabase.auth.getUser();
    if (authError || !authData.user) {
      throw new Error('Accès réservé aux administrateurs.');
    }

    const { data: currentAdmin, error: adminLookupError } = await supabase
      .from('users')
      .select('type')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (adminLookupError || currentAdmin?.type !== ADMIN) {
      throw new Error('Accès réservé aux administrateurs.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: validatedInscription.email,
      password: validatedInscription.password,
    });

    if (error) throw error;
    if (!data.user || data.user.identities?.length === 0) {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }

    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: data.user.id,
        email: data.user.email ?? validatedInscription.email,
        type: ADMIN,
      }, { onConflict: 'id' });

    if (profileError) throw profileError;

    return data;
  } catch (error) {
    console.log("inscription error: ", error);
    throw error;
  }
}

// update price
export const updatePrice = async (
  id: number,
  price: number,
  portion: "primary" | "preschool",
  type: "soup" | "meal",
) => {
  return await updateRecord('meal', id, {
    price,
    portion,
    type,
  });
}

