'use server'
import { inscriptionSchemaServer, loginSchemaServer, passwordResetSchema, updatePasswordSchema } from '@/schema/auth.schema'
import { createClient } from "@/lib/supabase/server"
import { ADMIN } from '@/constants/constants'

// validation du login côté serveur
export const authenticate = async (login: loginSchemaServer) => {
    try {
        const validatedLogin = loginSchemaServer.parse(login);
        const supabase = await createClient();
        const { data, error } = await supabase.auth.signInWithPassword({
            email: validatedLogin.email,
            password: validatedLogin.password,
        });

        if (error) throw  new Error("Adresse e-mail ou mot de passe incorrect.");

        return data;
    } catch (error) {
        console.log("authenticate error: ", error);
        throw error;
    }
}

// validate signup data and create a new user in the database
export const inscription = async (inscription: inscriptionSchemaServer) => {
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

// validate password reset request and send reset email
export const resetPassword = async (reset: passwordResetSchema) => {
  const validatedReset = passwordResetSchema.parse(reset);
  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(
    validatedReset.email, {
    redirectTo: `http://localhost:3000/auth/password/reset`,
  });

  if (error) throw new Error('Impossible d’envoyer le lien de réinitialisation.');
};
// validate password update request and update the password
export const updatePassword = async (password: updatePasswordSchema) => {
  const validatedPassword = updatePasswordSchema.parse(password);
  const supabase = await createClient();
  const { data, error } = await supabase.auth.updateUser({
    password: validatedPassword.password,
  });

  if (error) throw new Error('Impossible de modifier le mot de passe.');

  return data;
}





