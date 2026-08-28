'use client';
// gestion des erreurs 
import { authenticate, resetPassword } from '@/actions/auth';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input';
import { FieldError } from '@base-ui/react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { loginSchema, passwordResetSchema } from '../../../schema/auth.schema';
import Link from 'next/link';

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
      await resetPassword({ email });
      router.push('/user'); 
    } catch (error) {
      form.setError('email', { type: 'manual', message: error instanceof Error ? error.message : 'Une erreur est survenue' });
    } finally {
      setIsAuthenticating(false);
    }
  };


  return (
    <div className='flex h-svh items-center justify-center'>
      <div className='mx-auto grid w-[350px] gap-6'>
        
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
          <Link href="/auth/inscription" className="text-sm text-blue-600 text-center hover:underline">
            Inscription
          </Link>
          <Link href="/auth" className="text-sm text-blue-600 text-center hover:underline">
            Je me souviens de mon mot de passe
          </Link>
      </div>
    </div>
  );
}
