'use client';
// gestion des erreurs
// TODO pk key n'est pas fonctionnel 
// TODO configuration RLS  
//import { authenticate, inscription } from '@/actions/auth';
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { any, uuid, z } from 'zod';
import { createChild } from "@/actions/user";
import { addChildSchema } from "@/schema/user.schema";


export default function Addchild() {
  const form = useForm<z.infer<typeof addChildSchema>>({
    resolver: zodResolver(addChildSchema),
    defaultValues: {
      name: '',
      surname: '',
      schooling: undefined,
    },
  });

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const router = useRouter();
  const onSubmit = async ({ name, surname, schooling }: z.infer<typeof addChildSchema>) => {
    setIsAuthenticating(true);
    
      try {
          await createChild(name, surname, schooling);
          router.push('/user'); 
        } catch (error) {
          console.log(error);
        } finally {
          setIsAuthenticating(false);
        }
  };

  
  return (
    <div className='flex h-svh items-center justify-center'>
      <div className='mx-auto grid w-[350px] gap-6'>
        <h1 className="text-center text-3xl"> Ajouter un enfant au compte</h1>
        
          <form onSubmit={form.handleSubmit(onSubmit)} className='grid gap-4'>
            <FieldSet>
            <Controller
              control={form.control} 
              name='name'
              render={({ field, fieldState }) => (
                <Field className='grid gap-2' data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='name'>Prénom</FieldLabel>
                  <Input
                    id='name'
                    type='text'
                    placeholder='Prénom'
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
              name='surname'
              render={({ field, fieldState }) => (
                <Field className='grid gap-2' data-invalid={fieldState.invalid}>
                  <div className='flex items-center'>
                    <FieldLabel htmlFor='surname'>Nom</FieldLabel>
                  </div>
                    <Input
                      disabled={isAuthenticating}
                      id='surname'
                      type='surname'
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
            <Controller
              control={form.control}
              name='schooling'
              render={({ field, fieldState }) => (
                <Field className='grid gap-2' data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor='schooling'>Scolarité</FieldLabel>
                  <RadioGroup
                    id='schooling'
                    className='w-fit'
                    name={field.name}
                    value={field.value ?? ''}
                    onValueChange={(value) => field.onChange(value as 'primary' | 'preschool')}
                    onBlur={field.onBlur}
                    aria-invalid={fieldState.invalid}
                  >
                    <div className='flex items-center gap-3'>
                      <RadioGroupItem value='primary' id='primary' disabled={isAuthenticating} />
                      <Label htmlFor='primary'>Primaire</Label>
                    </div>
                    <div className='flex items-center gap-3'>
                      <RadioGroupItem value='preschool' id='preschool' disabled={isAuthenticating} />
                      <Label htmlFor='preschool'>Maternelle</Label>
                    </div>
                  </RadioGroup>
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
              Création enfant
            </Button>
            </FieldSet>
          </form>
          
      </div>
    </div>
  );
}
