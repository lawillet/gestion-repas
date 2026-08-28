'use server'
import { inscriptionSchemaServer } from "@/schema/auth.schema";
import { createClient } from "@/lib/supabase/server";
import { ADMIN } from "@/constants/constants";

// create user with admin right
export const signupAdmin = async (inscription: inscriptionSchemaServer) => {
  try {
    const validatedInscription = inscriptionSchemaServer.parse(inscription);
    const supabase = await createClient();
    const { data: existingUser, error: existingUserError } = await supabase
      .from('users')
      .select('email')
      .eq('email', validatedInscription.email)
      .maybeSingle();
      

    if (existingUserError) throw existingUserError;
    if (existingUser) {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }

    const { data, error } = await supabase.auth.signUp({
      email: validatedInscription.email,
      password: validatedInscription.password,
    });

    const { data: adminData, error: adminError } = await supabase
      .from('users')
      .update({type: ADMIN} )
      .eq('email', validatedInscription.email);

    if (error) throw error;
    if (data.user?.identities?.length === 0) {
      throw new Error('Cette adresse e-mail est déjà utilisée.');
    }

    return data;
  } catch (error) {
    console.log("inscription error: ", error);
    throw error;
  }
}