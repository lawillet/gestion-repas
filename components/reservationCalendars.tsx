'use client'
import { SubmitEvent, useMemo, useState } from 'react'
import CalendarComponent from '@/components/calendarComponent'
import type { CrudRow } from '@/actions/crud'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { fr } from 'date-fns/locale'
import { format } from 'date-fns'
import { reservationSchema, type ReservationInsert } from '@/schema/reservation.schema'
import { CalendarOff, CheckCircle2, CreditCard, ReceiptText } from 'lucide-react'
import { getReservationPeriod } from '@/lib/reservation-period' 
type ReservationCalendarsProps = { 
    childId: number; 
    soupPrice: number; 
    hotMealPrice: number; 
    soupMealId: number; 
    hotMealId: number; 
    disabledDates: Date[]; 
    reservedDates: Date[]; 
    blockedDays: CrudRow<'blocked_day'>[]
    periodData: {
        commandDeadline: Date
        minSelectableDate: Date
        maxSelectableDate: Date
        allowedWeeks: Array<{ start: Date; end: Date }>
    }
}
const ReservationCalendars = ({ 
    childId, 
    soupPrice, 
    hotMealPrice, 
    soupMealId, 
    hotMealId, 
    disabledDates, 
    reservedDates, 
    blockedDays,
    periodData,
}: ReservationCalendarsProps) => {
 const [soupDates, setSoupDates] = useState<Date[]>([]); 
 const [hotMealDates, setHotMealDates] = useState<Date[]>([]); 
 const [isSubmitting, setIsSubmitting] = useState(false); 
 const [errorMessage, setErrorMessage] = useState<string | null>(null); 
 const soupDisabledDates = useMemo(
    () => [...disabledDates, ...reservedDates, ...hotMealDates],
    [disabledDates, reservedDates, hotMealDates]
 )
 const hotMealDisabledDates = useMemo(
    () => [...disabledDates, ...reservedDates, ...soupDates],
    [disabledDates, reservedDates, soupDates]
 )
 const total = soupDates.length * soupPrice + hotMealDates.length * hotMealPrice
 const handleSubmit = async (event: SubmitEvent<HTMLFormElement>) => { 
    event.preventDefault(); 
    setErrorMessage(null); 
    const reservations: ReservationInsert[] = [...soupDates.map((date) => ({ 
        blocked_id: null, 
        date: format(date, 'yyyy-MM-dd'), 
        id_child: childId, 
        meal_id: soupMealId })),
        ...hotMealDates.map((date) => ({ 
            blocked_id: null, 
            date: format(date, 'yyyy-MM-dd'), 
            id_child: childId, 
            meal_id: hotMealId 
    }))]; 
    const validation = reservationSchema.array().safeParse(reservations); 

    if (!validation.success) { 
        setErrorMessage('Les données de réservation sont invalides.');
        return 
    } 

    setIsSubmitting(true); 

    try { 
        const response = await fetch('/api/checkout', 
            { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({ reservations: validation.data, total }) 
            }); 

        if (!response.ok) {
            const errorBody = await response.json().catch(() => null);
            throw new Error(errorBody?.error ?? 'Impossible de créer la session Stripe.');
        }
        const { url } = await response.json(); 
        window.location.href = url 
        
    } catch (error) { 
        setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.') 
    } finally { setIsSubmitting(false) } }

    
 return (
    <form onSubmit={handleSubmit} 
        className='mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-10'
    >
        <div className='mb-8'>
            <p className='text-sm font-medium text-emerald-700'>
                Réservation de repas
            </p>
            <h1 className='mt-1 text-3xl font-semibold tracking-tight sm:text-4xl'>
                Choisissez vos repas
            </h1>
            <p className='mt-2 text-muted-foreground'>
                Sélectionnez les jours souhaités pour chaque formule, puis validez votre commande.
            </p>
        </div>
        <div className='grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_360px]'>
            <div className='grid gap-6 xl:grid-cols-2'>
                <CalendarComponent 
                    titre='Réservation soupe' 
                    price={soupPrice} 
                    selectedDates={soupDates} 
                    onDatesChange={setSoupDates} 
                    disabledDates={soupDisabledDates} 
                    periodData={periodData} 
                />
                <CalendarComponent 
                    titre='Réservation repas chaud' 
                    price={hotMealPrice} 
                    selectedDates={hotMealDates} 
                    onDatesChange={setHotMealDates} 
                    disabledDates={hotMealDisabledDates} 
                    periodData={periodData} 
                />
            </div>
            <aside className='rounded-2xl border border-border/70 bg-card p-6 shadow-sm lg:sticky lg:top-24'>
            <div className='flex items-center gap-3'>
                <div className='flex size-10 items-center justify-center rounded-xl bg-blue-50 text-primary'>
                    <ReceiptText className='size-5' />
                </div>
                <div>
                    <h2 className='font-semibold'>
                        Récapitulatif
                    </h2>
                    <p className='text-sm text-muted-foreground'>
                        Votre commande
                    </p>
                </div>
            </div>
            {blockedDays.length > 0 && 
            <div className='mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-800'>
                <div className='flex items-center gap-2 font-medium'>
                    <CalendarOff className='size-4' />
                        Jours indisponibles
                </div>
                <ul className='mt-2 space-y-1 text-amber-700'>
                    {blockedDays.map(({ id, blocked_date, reason }) => 
                        <li key={id}>
                            {format(new Date(blocked_date), 'd MMM', { locale: fr })}{reason ? ` · ${reason}` : ''}
                        </li>)}
                </ul>
            </div>}
            <div className='mt-6 space-y-5'>
                <div>
                    <p className='text-sm font-medium'>
                        Soupe <span className='text-muted-foreground'>({soupDates.length})</span>
                    </p>
                <ul className='mt-2 flex flex-wrap gap-1.5'>
                    {soupDates.map((date) => 
                        <li key={date.toISOString()}>
                            <Badge variant='secondary'>
                                {format(date, 'd MMM', { locale: fr })}
                            </Badge>
                        </li>)}
                </ul>
            </div>
            <div>
                <p className='text-sm font-medium'>
                    Repas chaud <span className='text-muted-foreground'>({hotMealDates.length})</span>
                </p>
                <ul className='mt-2 flex flex-wrap gap-1.5'>
                    {hotMealDates.map((date) => 
                        <li key={date.toISOString()}>
                            <Badge variant='secondary'>
                                {format(date, 'd MMM', { locale: fr })}
                            </Badge>
                        </li>)}
                </ul>
            </div>
        </div>
        <div className='my-6 border-t pt-5'>
            <div className='flex items-end justify-between'>
                <p className='font-medium'>
                    Total à payer
                </p>
                <p className='text-3xl font-semibold tracking-tight'>
                    {total.toFixed(2)} €
                </p>
            </div>
        </div>
        {errorMessage && 
        <p className='mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700' role='alert'>
            {errorMessage}
        </p>}
        <Button 
        type='submit' 
        size='lg' 
        className='w-full bg-primary hover:bg-primary/90' 
        disabled={isSubmitting || total === 0}
        >
            <CreditCard />
            {isSubmitting ? 'Redirection vers Stripe…' : 'Valider la commande'}
        </Button>
        <p className='mt-3 flex items-center justify-center gap-1.5 text-xs text-muted-foreground'>
            <CheckCircle2 className='size-3.5 text-emerald-600' />
            Paiement sécurisé par Stripe
        </p>
        </aside>
        </div>
    </form>
)
}
export default ReservationCalendars
