'use client'
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
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CALENDAR_START_MONTH, CALENDAR_END_MONTH } from '@/constants/calendar';
import {
    getCurrentCycleIndex,
    getEndYear,
    getReservationPeriodsUntil,
    CYCLE_LENGTH_DAYS,
} from "@/constants/constants";

interface CalendarComponentProps {
    titre: string;
    disabledDates: Date[];
    disabledList: object; 
}

const CalendarComponent = ({ titre, disabledDates, disabledList }: CalendarComponentProps) => {
    const [dates, setDates] = useState<Date[]>([]);
    const [reasons, setReasons] = useState<string[]>([]);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [currentCycleStart, setCurrentCycleStart] = useState(new Date());
    const [maxSelectableDate, setMaxSelectableDate] = useState(new Date());
    const router = useRouter();

    const timeZone = useMemo(
        () => Intl.DateTimeFormat().resolvedOptions().timeZone,
        []
    );

    useEffect(() => {
        let isMounted = true

        async function load() {
            const endYear = await getEndYear()
            const nextPeriods = await getReservationPeriodsUntil(endYear)
            const index = await getCurrentCycleIndex(new Date())

            if (!isMounted) return

            setCurrentCycleStart(nextPeriods[index]?.start ?? new Date())
            setMaxSelectableDate(endYear)
        }

        load()

        return () => {
            isMounted = false
        }
    }, [])

    const minSelectableDate = addDays(currentCycleStart, (CYCLE_LENGTH_DAYS - 1));
    console.log(minSelectableDate)
    //console.log(index)
    //console.log(minSelectableDate);
    const dayOfWeekIsDisabled = (date: Date) => [0, 6, 3].includes(date.getDay());
    const isOutsideAllowedRange = (date: Date) => {
        const selectedDay = startOfDay(date);
        return isBefore(selectedDay, minSelectableDate) || isAfter(selectedDay, maxSelectableDate);
    };

    const handleValidate = async (dates: string[], reasons: string[]) => {
        setSubmitError(null);

        const result = await blockedDays(dates, reasons);

        if (!result.success) {
            const messages = result.errors.flatMap((error) => {
                const dateLabel = error.date ? `Date ${error.date}` : 'Entrée';
                return error.errors.map((message) => `${dateLabel} : ${message}`);
            });

            setSubmitError(messages.join(' | '));
            return;
        }

        router.refresh();
        //setValidationMessage(true);
    }
   
    return (
        <div className='flex-column items-center justify-center'>
            <h1 className='text-3xl text-center'>{titre}</h1>

            <Calendar
                mode="multiple"
                selected={dates}
                startMonth={CALENDAR_START_MONTH}
                endMonth={CALENDAR_END_MONTH}
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
            {submitError && (
                <p className="mt-3 text-sm text-red-600" role="alert">
                    {submitError}
                </p>
            )}
            <form>
                <Button 
                    type="button"
                    onClick=
                        {
                            () => handleValidate(dates.map((date) => format(date,'yyyy-MM-dd')), reasons)
                        }
                >
                    Valider
                </Button>
            </form>
        </div>
    )
}

export default CalendarComponent


