'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays, Soup, Utensils } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type PeriodReservation = {
  id: number
  date: string
  childId: number
  childName: string
  childSurname: string
  mealType: string | null
  mealPrice: number | null
}

type MyReservationPeriodProps = {
  cycleIndex: number
  start: Date
  end: Date
  reservations: PeriodReservation[]
}

const mealTypeSelectValue: Record<string, string> = {
  soup: 'soupe',
  meal: 'repas-chaud',
}

export default function MyReservationPeriod({
  cycleIndex,
  start,
  end,
  reservations,
}: MyReservationPeriodProps) {
  const [selectedChildName, setSelectedChildName] = useState('tous')
  const [selectedMealType, setSelectedMealType] = useState('tous')

  const childOptions = Array.from(
    new Map(
      reservations.map((reservation) => [reservation.childName, reservation.childName])
    ).values()
  )
  const mealOptions = Array.from(
    new Set(
      reservations
        .map((reservation) => reservation.mealType)
        .filter((type): type is string => Boolean(type))
    )
  )
  const filteredReservations = reservations.filter(
    (reservation) =>
      (selectedChildName === 'tous' || reservation.childName === selectedChildName) &&
      (selectedMealType === 'tous' ||
        (reservation.mealType !== null &&
          mealTypeSelectValue[reservation.mealType] === selectedMealType))
  )

  return (
    <section className="overflow-hidden rounded-lg border bg-card">
      <div className="flex items-center gap-2 border-b bg-primary/10 px-4 py-3 text-primary">
        <CalendarDays className="h-5 w-5 shrink-0" />
        <h3 className="text-sm font-semibold sm:text-base">
          Repas pour la période du {format(start, 'dd-MM-yyyy')} au{' '}
          {format(end, 'dd-MM-yyyy')}
        </h3>
      </div>

      <div className="grid gap-4 border-b p-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor={`period-${cycleIndex}-child`}>Enfant</Label>
          <Select
            value={selectedChildName}
            onValueChange={(value) => setSelectedChildName(value ?? 'tous')}
          >
            <SelectTrigger id={`period-${cycleIndex}-child`} className="w-full">
              <SelectValue placeholder="Tous les enfants" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les enfants</SelectItem>
              {childOptions.map((childName) => (
                <SelectItem key={childName} value={childName}>
                  {childName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor={`period-${cycleIndex}-meal`}>Repas</Label>
          <Select
            value={selectedMealType}
            onValueChange={(value) => setSelectedMealType(value ?? 'tous')}
          >
            <SelectTrigger id={`period-${cycleIndex}-meal`} className="w-full">
              <SelectValue placeholder="Tous les repas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tous">Tous les repas</SelectItem>
              {mealOptions.map((type) => (
                <SelectItem key={type} value={mealTypeSelectValue[type] ?? type}>
                  {type === 'meal' ? 'Repas chaud' : type === 'soup' ? 'Soupe' : type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredReservations.length > 0 ? (
        <ul className="divide-y">
          {filteredReservations.map((reservation) => (
            <li
              key={reservation.id}
              className="flex flex-col gap-2 px-4 py-3 transition-colors hover:bg-accent/50 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  {reservation.mealType === 'meal' ? (
                    <Utensils className="h-5 w-5" />
                  ) : (
                    <Soup className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">
                    {reservation.childName} {reservation.childSurname}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(reservation.date), 'dd-MM-yyyy')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 pl-13 sm:pl-0">
                <Badge variant="secondary">
                  {reservation.mealType === 'meal'
                    ? 'Repas chaud'
                    : reservation.mealType === 'soup'
                      ? 'Soupe'
                      : 'Repas inconnu'}
                </Badge>
                <span className="min-w-16 text-right font-semibold text-foreground">
                  {reservation.mealPrice} €
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="px-4 py-8 text-center text-sm text-muted-foreground">
          Aucune réservation pour ces filtres.
        </p>
      )}
    </section>
  )
}