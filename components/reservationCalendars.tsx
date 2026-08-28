'use client'

import React from 'react';
import CalendarComponent from '@/components/calendarComponent';
import type { CrudRow } from '@/actions/crud';
import { Button } from './ui/button';
import { fr } from 'date-fns/locale';
import { format } from 'date-fns';
import { createReservations } from '@/actions/reservation';


import { reservationSchema, type ReservationInsert } from '@/schema/reservation.schema';

type ReservationCalendarsProps = {
    childId: number;
    soupPrice: number;
    hotMealPrice: number;
    soupMealId: number;
    hotMealId: number;
    disabledDates: Date[];
    reservedDates: Date[];
    blockedDays: CrudRow<'blocked_day'>[];
};

const ReservationCalendars = ({ childId, soupPrice, hotMealPrice, soupMealId, hotMealId, disabledDates, reservedDates, blockedDays }: ReservationCalendarsProps) => {
    const [soupDates, setSoupDates] = React.useState<Date[]>([]);
    const [hotMealDates, setHotMealDates] = React.useState<Date[]>([]);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [errorMessage, setErrorMessage] = React.useState<string | null>(null);
    const total = soupDates.length * soupPrice + hotMealDates.length * hotMealPrice;

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);

        const reservations: ReservationInsert[] = [
            ...soupDates.map((date) => ({
                blocked_id: null,
                date: format(date, 'yyyy-MM-dd'),
                id_child: childId,
                meal_id: soupMealId,
            })),
            ...hotMealDates.map((date) => ({
                blocked_id: null,
                date: format(date, 'yyyy-MM-dd'),
                id_child: childId,
                meal_id: hotMealId,
            })),
        ];

        const validation = reservationSchema.array().safeParse(reservations);
        if (!validation.success) {
            setErrorMessage('Les données de réservation sont invalides.');
            return;
        }

        setIsSubmitting(true);
        try {
        // Création de la Checkout Session Stripe
            const response = await fetch("/api/checkout", {
                method: "POST",
                headers: {
                "Content-Type": "application/json",
                },
                body: JSON.stringify({
                reservations: validation.data,
                total,
                }),
            });

            if (!response.ok) {
                throw new Error("Impossible de créer la session Stripe.");
            }

            const { url } = await response.json();

            window.location.href = url;
        } catch (error) {
            setErrorMessage(error instanceof Error ? error.message : 'Une erreur est survenue.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='flex'>
            
            <CalendarComponent
                titre="Reservation Soupe"
                price={soupPrice}
                selectedDates={soupDates}
                onDatesChange={setSoupDates}
                disabledDates={[...disabledDates, ...reservedDates, ...hotMealDates]}
            />
            <CalendarComponent
                titre="Reservation Repas Chaud"
                price={hotMealPrice}
                selectedDates={hotMealDates}
                onDatesChange={setHotMealDates}
                disabledDates={[...disabledDates, ...reservedDates, ...soupDates]}
            />
            
            <div>
            <p>liste des jours ou les réservations sont indisponible</p>
            <ul>
            {blockedDays.map(({id, blocked_date, reason}) => (
                <li key={id}>
                    {blocked_date} raison {reason}{' '}
                </li>
                
            ))}
            </ul>
            <p>Récapitulatif des réservations</p>
            <p>jour de commande soupe</p>
            <ul>
                {soupDates.map((date, index )=> (
                    <li key={index}>{format(date, 'PPP',{locale: fr})}</li>
                ) )}
            </ul>
            <p>jour de commande repas complet</p>
            <ul>
                {hotMealDates.map((date, index )=> (
                    <li key={index}>{format(date, 'PPP',{locale: fr})}</li>
                ) )}
            </ul>
            <p>Total : {total.toFixed(2)} euros</p>
            </div>
            {errorMessage && <p className="text-red-600" role="alert">{errorMessage}</p>}
            <form onSubmit={handleSubmit}>
                <Button type="submit" disabled={isSubmitting || total === 0}>Valider la commande</Button>
            </form> 
        </div>
        
        
        
    );
};

export default ReservationCalendars;