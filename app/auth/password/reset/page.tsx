'use client';

import { updatePassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { updatePasswordSchema } from '../../../../schema/auth.schema';

export default function ResetPassword() {
  const form = useForm<z.infer<typeof updatePasswordSchema>>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: { password: '' },
  });
  const [isRecovery, setIsRecovery] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    
    async function checkRecoverySession() {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session) {
      setIsRecovery(true);
    }
  }

  checkRecoverySession();
    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
    });

    return () => authListener.subscription.unsubscribe();
  }, []);

  const onSubmit = async ({ password }: z.infer<typeof updatePasswordSchema>) => {
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
      <form onSubmit={form.handleSubmit(onSubmit)} className='grid w-[350px] gap-4'>
        <h1 className='text-xl font-semibold'>Nouveau mot de passe</h1>
        {!isRecovery && (
          <p className='text-sm text-red-600' role='alert'>
            Le lien de récupération est invalide ou a expiré.
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
    </div>
  );
}