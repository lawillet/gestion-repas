'use client'

import { DatePicker } from '@/components/datePicker'
import {DatePickerWithRange} from '@/components/datePickerWithRange'
import { Button } from '@/components/ui/button'
import { useMemo, useState } from 'react'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

import { newYear } from '@/actions/newYear' 

const SchoolingYear = () => {
  const [lockDate, setLockDate] = useState<Date | undefined>()
  const [reservationPeriod, setReservationPeriod] = useState<Date | undefined>()
  const [endYear, setEndYear] = useState<Date | undefined>()
  const [successMessage, setSuccessMessage] = useState('')

  const handleEndYearChange = (date: Date | undefined) => {
    setEndYear(date)
  }

  const handleLockDateChange = (date: Date | undefined) => {
    setLockDate(date)
  }

  const handleReservationPeriodChange = (dateRange: Date | undefined) => {
    setReservationPeriod(dateRange)
  }

  const handleSubmit = () => {
    if (!lockDate) {
      alert('Veuillez sélectionner une date limite de commande')
      return
    }
    
    if (!reservationPeriod) {
      alert('Veuillez sélectionner une période de réservation valide')
      return
    }

    if (!endYear) {
      alert('Veuillez sélectionner une date de fin d\'année scolaire')
      return
    }
    
    newYear(
      format(lockDate, 'yyyy-MM-dd'), 
      format(reservationPeriod, 'yyyy-MM-dd'),
      format(endYear, 'yyyy-MM-dd')
    );
  

    // Show success message
    setSuccessMessage('Paramètres de l\'année scolaire enregistrés avec succès!')
    setTimeout(() => {
      setSuccessMessage('')
    }, 3000)
  }

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-24'>
      <div className='w-full max-w-2xl'>
        {successMessage && (
          <div className='mb-6 p-4 bg-green-100 text-green-800 rounded-md'>
            {successMessage}
          </div>
        )}

        <section className='mb-8'>
          <p className='mb-4'>
            Choisis la date de commande aprés cette date les utilisateurs ne pourront plus modifier leur commande.
          </p>
          <DatePicker value={lockDate} onChange={handleLockDateChange} />
          {lockDate && (
            <p className='mt-2 text-sm text-gray-600'>
              Date sélectionnée: {format(lockDate, 'PPP', { locale: fr })}
            </p>
          )}
        </section>

        <section className='mb-8'>
          <p className='mb-4'>
            Quelle est la date de la fin de l&apos;année scolaire?
          </p>
          <DatePicker value={endYear} onChange={handleEndYearChange} />
          {endYear && (
            <p className='mt-2 text-sm text-gray-600'>
              Date sélectionnée: {format(endYear, 'PPP', { locale: fr })}
            </p>
          )}
        </section>

        <section className='mb-8'>
          <p className='mb-4'>
            Choissis la premiére période de réservation de 14 jours,
            les autres périodes seront automatiquement calculées par le système.
          </p>
          <DatePicker value={reservationPeriod} onChange={handleReservationPeriodChange} />
          {reservationPeriod && (
            <p className='mt-2 text-sm text-gray-600'>
              Date sélectionnée: {format(reservationPeriod, 'PPP', { locale: fr })}
            </p>
          )}
        </section>

        <div className='flex gap-4'>
          <Button onClick={handleSubmit}>
            Enregistrer les paramètres
          </Button>
        </div>
        
      </div>
    </main>
  )
}

export default SchoolingYear