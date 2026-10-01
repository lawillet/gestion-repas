'use server'
import { inscriptionSchemaServer, loginSchemaServer, passwordResetSchema, updatePasswordSchema } from '@/schema/auth.schema'
import { createClient } from "@/lib/supabase/server"
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';



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
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? 'http://127.0.0.1:3000';
  const redirectTo = new URL('/auth/confirm', baseUrl).toString();

  const { error } = await supabase.auth.resetPasswordForEmail(
    validatedReset.email, {
      redirectTo,
    },
  );

  if (error) {
    console.error('Supabase resetPasswordForEmail error:', error);
    throw new Error(error.message || 'Impossible d’envoyer le lien de réinitialisation.');
  }
};
// validate password update request and update the password
export const updatePassword = async (password: updatePasswordSchema) => {
  const validatedPassword = updatePasswordSchema.parse(password);
  const supabase = await createClient();
  const cookieStore = await cookies();
  const { data, error } = await supabase.auth.updateUser({
    password: validatedPassword.password,
  });

  if (error) {
    throw new Error(error.message || 'Impossible de modifier le mot de passe.');
  }

  cookieStore.set('password_recovery', 'false', {
    path: '/',
    maxAge: 0,
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });

  await supabase.auth.signOut();

  redirect('/auth?reset=success');

  return data;
}




