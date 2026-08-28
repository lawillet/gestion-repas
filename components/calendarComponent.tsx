'use client'
import React from 'react'
import { Calendar } from "@/components/ui/calendar"
import { fr } from 'date-fns/locale';
import { addDays, format, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
//import { createOneTimePaymentCheckoutSession } from '@/actions/stripe';
import { createClient } from '@/lib/supabase/server';
import { getAllRecords } from '@/actions/crud';
import BlockedDays from '@/app/admin/disabledday/page';

interface CalendarComponentProps {
    titre: string;
    price: number;
    disabledDates: Date[];
    selectedDates?: Date[];
    onDatesChange?: (dates: Date[]) => void;
}

const disabledDates= async () => {
    const all =  await getAllRecords('blocked_day')
    
}

//TODO: le bouton payer et rÃ©server doit rediriger vers la page de paiement avec le prix total et les dates sÃ©lectionnÃ©es 
const CalendarComponent = ({ titre, price, disabledDates, selectedDates, onDatesChange }: CalendarComponentProps) => {
    const [internalDates, setInternalDates] = React.useState<Date[]>([]);
    const dates = selectedDates ?? internalDates;
    const handleDatesChange = (nextDates: Date[]) => {
        setInternalDates(nextDates);
        onDatesChange?.(nextDates);
    };
    const timeZone = React.useMemo(
        () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        []
    );

    const minSelectableDate = addDays(startOfDay(new Date()), 1);
    const maxSelectableDate = addDays(startOfDay(new Date()), 15);

    const dayOfWeekIsDisabled = (date: Date) => [0, 6, 3].includes(date.getDay());
    const isOutsideAllowedRange = (date: Date) => {
        const selectedDay = startOfDay(date);
        return isBefore(selectedDay, minSelectableDate) || 
        isAfter(selectedDay, maxSelectableDate);
    };
    const reservationWindowLabel = 
        `Réservation possible du ${format(minSelectableDate, 'dd/MM/yyyy')} au 
        ${format(maxSelectableDate, 'dd/MM/yyyy')}`;
    
    return (
        <div className='flex-column align-item'>
            <h1 className='text-3xl'>{titre}</h1>

            <Calendar
                mode="multiple"
                selected={dates}
                onSelect={(nextDates) => handleDatesChange(nextDates ?? [])}
                className="rounded-lg border"
                captionLayout="dropdown"
                timeZone={timeZone}
                weekStartsOn={1}
                disabled={(date) =>
                    //isOutsideAllowedRange(date) ||
                    //dayOfWeekIsDisabled(date) ||
                    disabledDates.some((disabledDate) => isSameDay(date, disabledDate))
                }
                hidden={(date) => isOutsideAllowedRange(date) || dayOfWeekIsDisabled(date)}
                locale={fr}
            />
            <p className="mt-3 text-sm text-muted-foreground">{reservationWindowLabel}</p>
            <ul>
                { dates.length === 0 ? 
                    <li>Pas de dates sélectionnée</li> :
                    dates.map((date, index) => (
                        <li key={index}>réservation pour le {format(date, 'PPP',{locale: fr})} cout: {price} euros</li>
                    )) }
            </ul>
        </div>
    )
}

export default CalendarComponent


