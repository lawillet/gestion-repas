'use client'
import React from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Badge } from '@/components/ui/badge'
import { fr } from 'date-fns/locale'
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isSameDay,
  startOfDay,
  differenceInCalendarDays,
} from 'date-fns'
import { CalendarDays, Soup } from 'lucide-react'

// Define the props for the CalendarComponent
interface CalendarComponentProps {
  titre: string
  price: number
  disabledDates: Date[]
  selectedDates?: Date[]
  onDatesChange?: (dates: Date[]) => void
}

// --- Paramètres du cycle de réservation ---
// Un seul "cycle de référence" (le premier), tout le reste est calculé.
const CYCLE_LENGTH_DAYS = 14

// Cycle de référence n°1 :
// commande possible jusqu'au 02/09/2026, pour la plage [07/09/2026 - 18/09/2026]
const ANCHOR_COMMAND_DEADLINE = startOfDay(new Date(2026, 8, 2)) // 02/09/2026
const ANCHOR_RANGE_START = startOfDay(new Date(2026, 8, 7))      // 07/09/2026
const ANCHOR_RANGE_END = startOfDay(new Date(2026, 8, 18))       // 18/09/2026

/**
 * Calcule l'index du cycle courant (0 = premier cycle, 1 = deuxième, etc.)
 * en fonction de la date du jour.
 * Tant que "today" est <= à la date limite de commande du cycle, on reste
 * sur ce cycle. Dès qu'elle est dépassée, on bascule sur le suivant.
 */
function getCurrentCycleIndex(today: Date): number {
  const diffDays = differenceInCalendarDays(startOfDay(today), ANCHOR_COMMAND_DEADLINE)
  const cycleIndex = Math.ceil(diffDays / CYCLE_LENGTH_DAYS)
  return Math.max(0, cycleIndex)
}

const CalendarComponent = ({
  titre,
  price,
  disabledDates,
  selectedDates,
  onDatesChange,
}: CalendarComponentProps) => {
  const [internalDates, setInternalDates] = React.useState<Date[]>([])
  const dates = selectedDates ?? internalDates
  const handleDatesChange = (nextDates: Date[]) => {
    setInternalDates(nextDates)
    onDatesChange?.(nextDates)
  }

  const timeZone = React.useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone,
    []
  )

  // On calcule le cycle actuel une seule fois par rendu (dépend du jour courant)
  const { commandDeadline, minSelectableDate, maxSelectableDate } = React.useMemo(() => {
    const cycleIndex = getCurrentCycleIndex(new Date(2026, 8, 17))
    const offset = cycleIndex * CYCLE_LENGTH_DAYS

    return {
      commandDeadline: addDays(ANCHOR_COMMAND_DEADLINE, offset),
      minSelectableDate: addDays(ANCHOR_RANGE_START, offset),
      maxSelectableDate: addDays(ANCHOR_RANGE_END, offset),
    }
  }, [])

  const isOutsideAllowedRange = (date: Date) =>
    isBefore(startOfDay(date), minSelectableDate) ||
    isAfter(startOfDay(date), maxSelectableDate)

  const dayOfWeekIsDisabled = (date: Date) => [0, 6, 3].includes(date.getDay())

  return (
    <section className='rounded-2xl border border-border/70 bg-card p-5 shadow-sm'>
      <div className='mb-5 flex items-start justify-between gap-4'>
        <div>
          <div className='mb-2 flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700'>
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
        disabled={(date) =>
          disabledDates.some((disabledDate) => isSameDay(date, disabledDate))
        }
        hidden={(date) => isOutsideAllowedRange(date) || dayOfWeekIsDisabled(date)}
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