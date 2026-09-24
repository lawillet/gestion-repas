'use client'
import { format } from 'date-fns'
import { useEffect, useState } from 'react'
import {
    getEndYear,
    getReservationPeriodsUntil,
    type ReservationPeriod,
} from '@/constants/constants'
import { fr } from 'date-fns/locale'

interface ReservationPeriodsListProps {
    disabledDate: Date[],
}
const ReservationPeriods = ({disabledDate} : ReservationPeriodsListProps) => {
    const [reservationPeriods, setReservationPeriods] = useState<ReservationPeriod[]>([])

    useEffect(() => {
        let isMounted = true

        async function loadPeriods() {
            const endYear = await getEndYear()
            const periods = await getReservationPeriodsUntil(endYear, disabledDate)

            if (isMounted) {
                setReservationPeriods(periods)
            }
        }

        loadPeriods()

        return () => {
            isMounted = false
        }
    }, [disabledDate])
    
  return (
     <section className='mt-8 rounded-lg border bg-slate-50 p-4'>
        <h2 className='mb-4 text-lg font-semibold'>Liste de toutes les périodes de réservation</h2>
        {reservationPeriods.length === 0 ? (
            <p className='text-sm text-muted-foreground'>Aucune période de réservation trouvée.</p>
            ) : (
            <ul className='space-y-3'>
              {reservationPeriods.map((period) => (
                <li key={period.cycleIndex} className='rounded-md border bg-white p-3'>
                  <div className='flex items-center justify-between gap-4'>
                    <strong>Période {period.cycleIndex + 1}</strong>
                    <span className='text-xs text-muted-foreground'>
                      Limite: {format(period.commandDeadline, 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>

                  <p className='mt-2 text-sm text-slate-700'>
                    Du {format(period.start, 'dd/MM/yyyy', { locale: fr })}
                    {' '}au {format(period.end, 'dd/MM/yyyy', { locale: fr })}
                  </p>

                  <p className='mt-1 text-xs text-slate-500'>
                    Début: {
                        format(period.weeks[0]?.start ?? 
                        period.start, 'dd/MM/yyyy', { locale: fr })
                    } 
                    · Fin: {
                        format(period.weeks[period.weeks.length - 1]?.end ?? 
                        period.end, 'dd/MM/yyyy', { locale: fr })
                    }
                  </p>
                </li>
              ))}
            </ul>
          )}
        </section>
  )
}

export default ReservationPeriods