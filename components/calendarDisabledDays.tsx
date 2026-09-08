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
    // TODO need to change the value
    const minSelectableDate = addDays(startOfDay(new Date()), 1);
    const maxSelectableDate = addDays(startOfDay(new Date()), 30);

    // Make the calendar start in August of the current year if the current month is August or later, 
    // otherwise start in August of the previous year. 
    // The calendar should end in August of the next year.
    const currentDate = new Date();
    const calendarStartYear =
        currentDate.getMonth() >= 7
            ? currentDate.getFullYear()
            : currentDate.getFullYear() - 1;
    const calendarStartMonth = new Date(calendarStartYear, 7);
    const calendarEndMonth = new Date(calendarStartYear + 1, 7);

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
                startMonth={calendarStartMonth}
                endMonth={calendarEndMonth}
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


