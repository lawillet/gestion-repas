'use client'
import React from 'react'
import { Calendar } from "@/components/ui/calendar"
import { fr } from 'date-fns/locale';
import { addDays, format, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input';
import { blockedDays } from '@/actions/blocked-day';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CalendarComponentProps {
    titre: string;
    disabledDates: Date[];
    disabledList: object; 
}

const CalendarComponent = ({ titre, disabledDates, disabledList }: CalendarComponentProps) => {
    const [dates, setDates] = useState<Date[]>([]);
    const [reasons, setReasons] = useState<string[]>([]);
    const [validationMessage, setValidationMessage] = useState<boolean>(false);
    //const [validationMessage, setValidationMessage] = React.useState<boolean>(false);
    const router = useRouter();

    const timeZone = React.useMemo(
        () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        []
    );

    const minSelectableDate = addDays(startOfDay(new Date()), 1);
    const maxSelectableDate = addDays(startOfDay(new Date()), 30);

    const dayOfWeekIsDisabled = (date: Date) => [0, 6, 3].includes(date.getDay());
    const isOutsideAllowedRange = (date: Date) => {
        const selectedDay = startOfDay(date);
        return isBefore(selectedDay, minSelectableDate) || isAfter(selectedDay, maxSelectableDate);
    };

    const handleValidate = async (dates: string[], reasons: string[]) => {
        await blockedDays(dates, reasons);
        router.refresh();
        //setValidationMessage(true);
    }
   
    return (
        <div className='flex-column items-center justify-center'>
            <h1 className='text-3xl text-center'>{titre}</h1>

            <Calendar
                mode="multiple"
                selected={dates}
                startMonth={new Date(2026, 7)}
                endMonth={new Date(2027, 7)}
                onSelect={(nextDates) => setDates(nextDates ?? [])}
                className="rounded-lg border"
                captionLayout="dropdown"
                timeZone={timeZone}
                disabled={(date) =>
                    /*isOutsideAllowedRange(date) ||*/
                    dayOfWeekIsDisabled(date) ||
                    disabledDates.some((disabledDate) => isSameDay(date, disabledDate))
                }
                locale={fr}
            />
            <ul>
              { dates.length === 0 ? 
              <li>Pas de dates sélectionnées</li> :
              dates.map((date, index) => (
                <li key={index}>
                    {format(date, 'PPP')} jour désactiver 
                    <Field>
                        <FieldLabel htmlFor='reason'></FieldLabel>
                        <Input 
                            id="reason" 
                            type="text"
                            placeholder="Raison du blocage"
                            value={reasons[index] || ''}
                            onChange={(e) => { 
                                const newReasons = [...reasons];
                                newReasons[index] = e.target.value;
                                setReasons(newReasons);
                            }}
                        />
                    </Field>
                </li>
              )) }
              
            </ul>
            <form>
                <Button 
                    type="button"
                    onClick=
                        {
                            () => handleValidate(dates.map((date) => format(date, 'yyyy-MM-dd')), reasons)
                        }
                >
                    Valider
                </Button>
            </form>
        </div>
    )
}

export default CalendarComponent


