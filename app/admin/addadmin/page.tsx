'use client';
// gestion des erreurs 
import { authenticate, inscription } from '@/actions/auth';
import { signupAdmin } from '@/actions/admin';

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
import Link from 'next/link';
import { loginSchema } from '@/schema/auth.schema';

export default function Addadmin() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);

  

  const onSignup = async ({ email, password }: z.infer<typeof loginSchema>) => {
    setIsAuthenticating(true);
    try {
      await signupAdmin({email, password});
      
    } catch (error) {
        form.setError('email', { type: 'manual', message: error instanceof Error ? error.message : 'Une erreur est survenue' });
      console.log(error);
    } finally {
      setIsAuthenticating(false);
    }
  };


  return (
    <div className='flex h-svh items-center justify-center'>
      <div className='mx-auto grid w-[350px] gap-6'>
        
          <form onSubmit={form.handleSubmit(onSignup)} className='grid gap-4'>
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
            <Controller
              control={form.control}
              name='password'
              render={({ field, fieldState }) => (
                <Field className='grid gap-2' data-invalid={fieldState.invalid}>
                  <div className='flex items-center'>
                    <FieldLabel htmlFor='password'>Mot de passe</FieldLabel>
                  </div>
                    <Input
                      disabled={isAuthenticating}
                      id='password'
                      type='password'
                      aria-invalid={fieldState.invalid} 
                      {...field}
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
              Ajouter compte admin
            </Button>
            
            </FieldSet>
          </form>
          
      </div>
    </div>
  );
}
