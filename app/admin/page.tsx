'use server'
import { Button } from '@/components/ui/button'; 
import { Card, CardContent } from '@/components/ui/card'; 
import { createClient } from '@/lib/supabase/server'; 
import { redirect } from 'next/navigation'; 
import Link from 'next/link'; 
import { CalendarDays, LockKeyhole, Users } from 'lucide-react'
export async function logout() { 
    const supabase = await createClient(); 
    await supabase.auth.signOut(); 
    redirect('/auth') 
}
const Admin = async () => { 
    const supabase = await createClient(); 
    const { data: user } = await supabase.auth.getUser(); 
    return (
    <main className='mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-10'>
        <p className='text-sm font-medium text-emerald-700'>Administration</p>
        <div className='mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end'>
            <div>
                <h1 className='text-3xl font-semibold tracking-tight sm:text-4xl'>Bonjour, administrateur</h1>
                <p className='mt-2 text-muted-foreground'>{user?.user?.email}</p>
            </div>
            <Button nativeButton={false} render={<Link href='/admin/reservation' />}>
                Voir les réservations
            </Button>
        </div>
        <section className='mt-8 grid gap-4 md:grid-cols-3'>
            <Card>
                <CardContent className='flex gap-4 p-5'>
                    <div className='rounded-xl bg-blue-50 p-3 text-primary'>
                        <CalendarDays />
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>Aujourd’hui</p>
                        <p className='font-semibold'>Réservations du jour</p>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className='flex gap-4 p-5'>
                    <div className='rounded-xl bg-amber-50 p-3 text-amber-700'>
                        <LockKeyhole />
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>Disponibilités</p>
                        <Link href='/admin/disabledday' className='font-semibold hover:underline'>Gérer les jours bloqués</Link>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardContent className='flex gap-4 p-5'>
                    <div className='rounded-xl bg-emerald-50 p-3 text-emerald-700'>
                        <Users />
                    </div>
                    <div>
                        <p className='text-sm text-muted-foreground'>Comptes</p>
                        <Link href='/admin/alluser' className='font-semibold hover:underline'>
                            Gérer les utilisateurs
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </section>
        <section className='mt-8 rounded-2xl border border-border/70 bg-card p-6 shadow-sm'>
            <h2 className='text-lg font-semibold'>Actions rapides</h2>
            <div className='mt-4 flex flex-wrap gap-3'>
                <Button variant='outline' nativeButton={false} render={<Link href='/admin/disabledday' />}>
                    Bloquer une date
                </Button>
                <Button variant='outline' nativeButton={false} render={<Link href='/admin/price' />}>
                    Modifier les prix
                </Button>
                <Button variant='outline' nativeButton={false} render={<Link href='/admin/addadmin' />}>
                    Ajouter un administrateur
                </Button>
            </div>
        </section>
    </main>); }
export default Admin
