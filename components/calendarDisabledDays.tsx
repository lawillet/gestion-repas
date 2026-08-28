'use client'
import React from 'react'
import { Calendar } from "@/components/ui/calendar"
import { fr } from 'date-fns/locale';
import { addDays, format, isAfter, isBefore, isSameDay, startOfDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import {createRecord, getRecordById} from "@/actions/crud";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field"
import { Input } from '@/components/ui/input';




interface CalendarComponentProps {
    titre: string;
    disabledDates: Date[];
    disabledList: object; 
}

const handleValidate = async (dates: Date[] ) => {
    dates.forEach(async (date) => {
        const existingRecord = await getRecordById('blocked_day',date, 'blocked_date')
        console.log(existingRecord?.blocked_date)
        if (existingRecord){
            return console.log('la date est déjà bloqué');
        }
       await createRecord('blocked_day', { blocked_date: date.toISOString() });
        // TODO return a message to user the block days is correctly blocked*/
    });

}


const CalendarComponent = ({ titre, disabledDates, disabledList }: CalendarComponentProps) => {
    const [dates, setDates] = React.useState<Date[]>([]);
    //const [validationMessage, setValidationMessage] = React.useState<boolean>(false);
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
   
    return (
        <div className='flex-column align-item'>
            <h1 className='text-3xl'>{titre}</h1>

            <Calendar
                mode="multiple"
                selected={dates}
                onSelect={(nextDates) => setDates(nextDates ?? [])}
                className="rounded-lg border"
                captionLayout="dropdown"
                timeZone={timeZone}
                disabled={(date) =>
                    isOutsideAllowedRange(date) ||
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
                        <Input id="reason" type="text" />
                    </Field>
                </li>
              )) }
              
            </ul>
            <Button onClick={() => handleValidate(dates)}>Valider</Button>
        </div>
    )
}

export default CalendarComponent


