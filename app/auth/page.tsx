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
import { ArrowRight, LockKeyhole } from 'lucide-react'; 
import Link from 'next/link'; import { useRouter } from 'next/navigation'; 
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
    const onSubmit = async ({ email, password }: z.infer<typeof loginSchema>) => { 
        setIsAuthenticating(true); 
        try { 
            await authenticate({ email, password }); 
            router.push('/user') 
        } catch (error) { 
            form.setError('email', { 
                type: 'manual', 
                message: error instanceof Error ? 
                error.message : 'Une erreur est survenue' 
            }); 
            form.setError('password', 
                { 
                    type: 'manual', 
                    message: 'Adresse e-mail ou mot de passe incorrect.' 
                }) 
            } finally { 
                setIsAuthenticating(false) 
            } 
        }; 

        return (
            <main 
                className='flex min-h-svh items-center justify-center 
                    bg-linear-to-br from-emerald-50 via-slate-50 to-blue-50 p-4'
            >
                <Card className='w-full max-w-md shadow-lg shadow-slate-200/60'>
                    <CardHeader className='text-center'>
                        <div 
                            className='mx-auto mb-2 flex size-12 items-center 
                            justify-center rounded-2xl bg-emerald-600 text-white'
                        >
                            <LockKeyhole />
                        </div>
                        <CardTitle className='text-2xl'>
                            Bienvenue
                        </CardTitle>
                        <CardDescription>
                            Connectez-vous pour gérer les repas de vos enfants.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
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
                        </form>
                        <p 
                            className='mt-6 text-center text-sm text-muted-foreground'
                        >
                            Pas encore de compte ? 
                            <Link 
                                href='/auth/inscription' 
                                className='font-medium text-primary hover:underline'
                            >
                                Créer un compte
                            </Link>
                        </p>
                    </CardContent>
                </Card>
            </main>
        ) }
