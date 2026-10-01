'use client';

import { updatePassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { updatePasswordSchema } from '../../../../schema/auth.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function ResetPassword() {
  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '' },
  });
  const [isRecovery, setIsRecovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    let active = true;

    const checkRecoverySession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (!active) return;

      if (error) {
        setRecoveryError(error.message || 'Le lien de récupération est invalide ou a expiré.');
        setIsRecovery(false);
        return;
      }

      if (session?.user) {
        setIsRecovery(true);
        setRecoveryError(null);
        return;
      }

      setRecoveryError('Le lien de récupération est invalide ou a expiré.');
      setIsRecovery(false);
    };

    checkRecoverySession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;

      if (event === 'PASSWORD_RECOVERY' && session?.user) {
        setIsRecovery(true);
        setRecoveryError(null);
        return;
      }

      if (event === 'SIGNED_IN' && session?.user) {
        setIsRecovery(true);
        setRecoveryError(null);
        return;
      }

      if (event === 'SIGNED_OUT') {
        setIsRecovery(false);
        setRecoveryError('Le lien de récupération est invalide ou a expiré.');
      }
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const onSubmit = async ({ password }: z.infer<typeof updatePasswordSchema>) => {
    if (!isRecovery) {
      form.setError('root', {
        message: 'Le lien de récupération est invalide ou a expiré.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updatePassword({ password });
    } catch (error) {
      form.setError('root', {
        message: error instanceof Error ? error.message : 'Une erreur est survenue.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className='flex h-svh items-center justify-center'>
      <Card>
        <CardHeader>
          <CardTitle className='text-2xl'>Nouveau mot de passe</CardTitle>
        </CardHeader>
        <CardContent>
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid w-[350px] gap-4'>
        {!isRecovery && (
          <p className='text-sm text-red-600' role='alert'>
            {recoveryError || 'Le lien de récupération est invalide ou a expiré.'}
          </p>
        )}
        <Controller
          control={form.control}
          name='password'
          render={({ field, fieldState }) => (
            <div className='grid gap-2'>
              <label htmlFor='password'>Mot de passe</label>
              <Input
                {...field}
                id='password'
                type='password'
                disabled={!isRecovery || isSubmitting}
                aria-invalid={fieldState.invalid}
              />
              {fieldState.error?.message && (
                <p className='text-sm text-red-600' role='alert'>{fieldState.error.message}</p>
              )}
            </div>
          )}
        />
        {form.formState.errors.root?.message && (
          <p className='text-sm text-red-600' role='alert'>{form.formState.errors.root.message}</p>
        )}
        <Button type='submit' disabled={!isRecovery || isSubmitting}>Modifier le mot de passe</Button>
      </form>
      </CardContent>
      </Card>
    </div>
  );
}