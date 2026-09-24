'use client'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { fr } from 'date-fns/locale'
import {
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
} from 'date-fns'
import { CalendarDays, Soup } from 'lucide-react'
import { useMemo, useState } from 'react'

interface CalendarPeriodData {
  commandDeadline: Date
  minSelectableDate: Date
  maxSelectableDate: Date
  allowedWeeks: Array<{ start: Date; end: Date }>
}

interface CalendarComponentProps {
  titre: string
  price: number
  disabledDates: Date[]
  selectedDates?: Date[]
  onDatesChange?: (dates: Date[]) => void
  periodData: CalendarPeriodData
}

const CalendarComponent = ({
  titre,
  price,
  disabledDates,
  selectedDates,
  onDatesChange,
  periodData,
}: CalendarComponentProps) => {
  const [internalDates, setInternalDates] = useState<Date[]>([])

  const dates = selectedDates ?? internalDates
  const handleDatesChange = (nextDates: Date[]) => {
    setInternalDates(nextDates)
    onDatesChange?.(nextDates)
  }

  const timeZone = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  )

  const { commandDeadline, minSelectableDate, maxSelectableDate, allowedWeeks } = periodData

  const isOutsideAllowedRange = (date: Date) =>
    isBefore(startOfDay(date), minSelectableDate) ||
    isAfter(startOfDay(date), maxSelectableDate)

  const dayOfWeekIsDisabled = (date: Date) => [0, 3,  6].includes(date.getDay())
  const isOutsideReservationWeeks = (date: Date) =>
    !allowedWeeks.some(
      (week) => date >= week.start && date <= week.end
    )

  return (
    <section className='rounded-2xl border border-border/70 bg-card p-5 shadow-sm'>
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div>
          <div className='mb-2 flex size-10 items-center justify-center 
            rounded-xl bg-emerald-50 text-emerald-700'>
            <Soup className='size-5' />
          </div>
          <h2 className='text-lg font-semibold tracking-tight'>{titre}</h2>
          <p className='mt-1 text-sm text-muted-foreground'>
            {price.toFixed(2)} € par réservation
          </p>
        </div>
        <Badge variant='success'>
          {dates.length} sélectionnée{dates.length > 1 ? 's' : ''}
        </Badge>
      </div>

      <Calendar
        mode='multiple'
        selected={dates}
        onSelect={(nextDates) => handleDatesChange(nextDates ?? [])}
        className='w-full rounded-xl border bg-background p-3'
        captionLayout='dropdown'
        timeZone={timeZone}
        weekStartsOn={1}
        startMonth={minSelectableDate}
        endMonth={maxSelectableDate}
        /*disabled={(date) =>
          disabledDates.some((disabledDate) => isSameDay(date, disabledDate))
        }
        hidden={(date) =>
          isOutsideAllowedRange(date) ||
          isOutsideReservationWeeks(date) ||
          dayOfWeekIsDisabled(date)
        }*/
        locale={fr}
      />

      <p className='mt-4 flex items-center gap-2 text-sm text-muted-foreground'>
        <CalendarDays className='size-4' />
        Réservation possible du {format(minSelectableDate, 'dd/MM/yyyy')} au{' '}
        {format(maxSelectableDate, 'dd/MM/yyyy')} — commandes jusqu&apos;au{' '}
        {format(commandDeadline, 'dd/MM/yyyy')}
      </p>

      <ul className='mt-4 flex flex-wrap gap-2' aria-label={`Dates sélectionnées pour ${titre}`}>
        {dates.length === 0 ? (
          <li className='text-sm text-muted-foreground'>Aucune date sélectionnée.</li>
        ) : (
          dates.map((date) => (
            <li key={date.toISOString()}>
              <Badge variant='secondary'>
                {format(date, 'EEE d MMM', { locale: fr })}
              </Badge>
            </li>
          ))
        )}
      </ul>
    </section>
  )
}

export default CalendarComponent