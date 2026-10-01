'use client'
import { authenticate } from '@/actions/auth';
import { Button } from '@/components/ui/button'; 
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from '@/components/ui/card'; 
import { Field, FieldLabel, FieldSet } from '@/components/ui/field'; 
import { Input } from '@/components/ui/input'; 
import { zodResolver } from '@hookform/resolvers/zod'; 
import { ArrowRight } from 'lucide-react'; 
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation'; 
import { useState } from 'react'; 
import { Controller, useForm } from 'react-hook-form'; 
import { z } from 'zod'; import { loginSchema } from '../../schema/auth.schema';

export default function Auth() { 
    const form = useForm<z.infer<typeof loginSchema>>({ 
        resolver: zodResolver(loginSchema), 
        defaultValues: { email: '', password: '' } 
    }); 
    const [isAuthenticating, setIsAuthenticating] = useState(false); 
    const router = useRouter();
    const searchParams = useSearchParams();
    const resetStatus = searchParams.get('reset');
    const authError = searchParams.get('error');

    const onSubmit = async ({ email, password }: z.infer<typeof loginSchema>) => { 
        setIsAuthenticating(true); 
        form.clearErrors('root');
        try { 
            await authenticate({ email, password }); 
            router.push('/user') 
        } catch {
            form.setError('root', {
                type: 'manual',
                message: 'Adresse e-mail ou mot de passe incorrect.',
            });
            } finally { 
                setIsAuthenticating(false) 
            } 
        }; 

        return (
            <main 
                className='relative isolate flex min-h-svh items-center justify-center overflow-hidden p-4'
            >
                <Image
                    src='/Ecole-Cerfontaine-batiment.jpeg'
                    alt=''
                    fill
                    priority
                    sizes='100vw'
                    className='z-0 object-cover'
                />
                <div aria-hidden='true' className='absolute inset-0 z-10 bg-slate-950/45' />
                <Card className='relative z-20 w-full max-w-md shadow-lg shadow-slate-950/30'>
                    <CardHeader className='text-center'>
                        <Image
                            src='/Cerfontaine_logo.svg'
                            alt='Cerfontaine embléme'
                            width={160}
                            height={48}
                            className='mx-auto mb-2 h-20 w-auto object-contain'
                        />
                        <CardTitle className='text-2xl'>
                            Bienvenue
                        </CardTitle>
                        <CardDescription>
                            Connectez-vous pour gérer les repas de vos enfants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {resetStatus === 'sent' && (
                            <p className='mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700' role='status'>
                                Un e-mail de réinitialisation a été envoyé. Vérifiez votre boîte de réception.
                            </p>
                        )}
                        {resetStatus === 'success' && (
                            <p className='mb-4 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700' role='status'>
                                Mot de passe mis à jour avec succès. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                            </p>
                        )}
                        {authError && (
                            <p className='mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700' role='alert'>
                                {decodeURIComponent(authError)}
                            </p>
                        )}
                        <form onSubmit={form.handleSubmit(onSubmit)}>
                            <FieldSet className='gap-5'>
                                <Controller 
                                    control={form.control} 
                                    name='email' 
                                    render={({ field, fieldState }) => 
                                        <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor='email'>
                                            Adresse e-mail
                                        </FieldLabel>
                                        <Input 
                                            id='email' 
                                            type='email' 
                                            placeholder='vous@exemple.be' 
                                            aria-invalid={fieldState.invalid} 
                                            {...field} 
                                            disabled={isAuthenticating} 
                                        />
                                        {fieldState.error?.message && 
                                        <p 
                                            className='text-sm text-destructive' 
                                            role='alert'
                                        >
                                            {fieldState.error.message}
                                        </p>
                                        }
                                        </Field>
                                    } 
                                />
                                <Controller 
                                    control={form.control} 
                                    name='password' 
                                    render={({ field, fieldState }) => 
                                        <Field data-invalid={fieldState.invalid}>
                                            <div className='flex justify-between'>
                                                <FieldLabel htmlFor='password'>
                                                    Mot de passe
                                                </FieldLabel>
                                                <Link 
                                                    href='/auth/password' 
                                                    className='text-xs font-medium text-primary 
                                                        hover:underline'
                                                >
                                                    Mot de passe oublié ?
                                                </Link>
                                            </div>
                                            <Input 
                                                id='password' 
                                                type='password' 
                                                aria-invalid={fieldState.invalid} 
                                                {...field} 
                                                disabled={isAuthenticating} 
                                            />
                                            {fieldState.error?.message && 
                                            <p 
                                                className='text-sm text-destructive' 
                                                role='alert'
                                            >
                                                {fieldState.error.message}
                                            </p>
                                            }
                                        </Field>
                                    } 
                                />
                                <Button 
                                    disabled={isAuthenticating} 
                                    type='submit' 
                                    size='lg' 
                                    className='w-full'
                                >
                                    {isAuthenticating ? 'Connexion…' : 'Se connecter'}
                                    <ArrowRight />
                                </Button>
                            </FieldSet>
                            {form.formState.errors.root?.message && (
                                <p className='mt-3 text-sm text-destructive' role='alert'>
                                    {form.formState.errors.root.message}
                                </p>
                            )}
                        </form>
                        <p 
                            className='mt-6 text-center text-sm text-muted-foreground'
                        >
                            Pas encore de compte ? 
                            <Link 
                                href='/auth/inscription' 
                                className='font-medium text-primary hover:underline'
                            >
                                {' '}Créer un compte
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
        ) }
