'use server'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getChildren } from '@/actions/user'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Baby as Child, CalendarDays, Plus, Utensils } from 'lucide-react'
export async function logout() { const supabase = await createClient(); await supabase.auth.signOut(); redirect('/auth') }
const User = async () => { 
    const children = await getChildren(); 
    return <main className='mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-10'>
        <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
            <div>
                <p className='text-sm font-medium text-emerald-700'>Espace parent</p>
                <h1 className='mt-1 text-3xl font-semibold tracking-tight sm:text-4xl'>Vos réservations de repas</h1>
                <p className='mt-2 max-w-2xl text-muted-foreground'>Gérez simplement les repas de vos enfants et préparez les prochaines commandes.</p>
            </div>
            <Button nativeButton={false} render={<Link href='/user/addChild' />}><Plus />Ajouter un enfant</Button>
        </div>
        <section className='mt-8 grid gap-4 sm:grid-cols-3'>
            <Card>
                <CardContent className='flex items-center gap-4 p-5'>
                    <div className='rounded-xl bg-emerald-50 p-3 text-emerald-700'>
                        <Child />
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>Enfants inscrits</p>
                        <p className='text-2xl font-semibold'>{children?.length ?? 0}</p>
                    </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4 p-5'>
                        <div className='rounded-xl bg-blue-50 p-3 text-primary'>
                            <CalendarDays />
                        </div>
                        <div>
                            <p className='text-sm text-muted-foreground'>Prochaine étape</p>
                            <p className='font-semibold'>Réserver un repas</p>
                        </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className='flex items-center gap-4 p-5'>
                            <div className='rounded-xl bg-slate-100 p-3 text-slate-700'>
                                <Utensils />
                            </div>
                            <div>
                                <p className='text-sm text-muted-foreground'>Paiement</p>
                                <p className='font-semibold'>Sécurisé par Stripe</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>
                <section className='mt-10'>
                    <div className='mb-4'>
                        <h2 className='text-xl font-semibold tracking-tight'>Mes enfants</h2>
                        <p className='text-sm text-muted-foreground'>Choisissez un enfant pour effectuer une réservation.</p>
                    </div>
                    {children && children.length > 0 ? 
                    <div className='grid gap-5 md:grid-cols-2 xl:grid-cols-3'>{children.map((child) => 
                        <Card key={child.id} className='group transition-shadow hover:shadow-md'>
                            <CardHeader>
                                <div className='flex items-start justify-between'>
                                    <div className='flex size-12 items-center justify-center rounded-2xl bg-emerald-50 text-lg font-semibold text-emerald-700'>
                                        {child.name.slice(0, 1)}{child.surname.slice(0, 1)}
                                    </div>
                                    <Badge variant='success'>{child.schooling}</Badge>
                                </div>
                                <CardTitle className='mt-4 text-xl'>{child.name} {child.surname}</CardTitle>
                                <CardDescription>Réservations et repas à venir</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button className='w-full' nativeButton={false} render={<Link href={`/user/${child.id}`} />}>Réserver un repas<ArrowRight /></Button>
                            </CardContent>
                        </Card>)}
                    </div> : 
                    <Card className='border-dashed'>
                        <CardContent className='flex flex-col items-center px-6 py-14 text-center'>
                            <div className='rounded-2xl bg-emerald-50 p-4 text-emerald-700'>
                                <Child className='size-7' />
                            </div>
                            <h2 className='mt-4 text-lg font-semibold'>Aucun enfant enregistré</h2>
                            <p className='mt-1 max-w-sm text-sm text-muted-foreground'>
                                Ajoutez votre premier enfant afin de pouvoir réserver ses repas.
                            </p>
                            <Button className='mt-5' nativeButton={false} render={<Link href='/user/addChild' />}><Plus />Ajouter un enfant</Button>
                        </CardContent>
                    </Card>}
                </section>
            </main> }
export default User
