'use client';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input';
import { createClient } from '@/lib/supabase/client';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { passwordResetSchema } from '../../../schema/auth.schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Auth() {
  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      email: '',
    },
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const router = useRouter();

  const onSubmit = async ({ email }: z.infer<typeof passwordResetSchema>) => {
    setIsAuthenticating(true);

    try {
      const supabase = createClient();
      const redirectTo = `${window.location.origin}/auth/confirm`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        throw new Error(error.message || 'Impossible d’envoyer le lien de réinitialisation.');
      }

      router.push('/auth?reset=sent');
    } catch (error) {
      form.setError('email', { type: 'manual', message: error instanceof Error ? error.message : 'Une erreur est survenue' });
    } finally {
      setIsAuthenticating(false);
    }
  };


  return (
    <div className='flex h-svh items-center justify-center'>
      <div className='mx-auto grid w-[350px] gap-6'>
        <Card>
          <CardHeader>
            <CardTitle className='text-2xl'>Changer de mot de passe</CardTitle>
          </CardHeader>
          <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
            <FieldSet>
            <Controller
              control={form.control} 
              name='email'
              render={({ field, fieldState }) => (
                <Field className='grid gap-2' data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='email'>Email</FieldLabel>
                  <Input
                    id='email'
                    type='email'
                    placeholder='m@example.com'
                    aria-invalid={fieldState.invalid} 
                    {...field}
                    disabled={isAuthenticating}
                  />
                  
                  {fieldState.error?.message && (
                    <p className='text-sm text-red-600' role='alert'>
                      {fieldState.error.message}
                    </p>
                  )}
                </Field>
              )}
            />
            <Button
              disabled={isAuthenticating}
              type='submit'
              className='w-full'
            >
              rénitialiser le mot de passe
            </Button>
        
            </FieldSet>
          </form>
          <div className='flex flex-col'>
          <Link href="/auth/inscription" className="font-sm text-primary text-center 
          hover:underline pb-2 pt-2">
            Inscription
          </Link>
          <Link href="/auth" className="font-sm text-primary text-center hover:underline">
            Je me souviens de mon mot de passe
          </Link>
          </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
