'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

type Parent = { id: string; email: string }
type Child = { id: number; name: string; surname: string; parent: string; schooling?: string }
type ReservationFiltersProps = { 
  parentList: Parent[]; 
  childList: Child[]; 
  selectedParent: string; 
  selectedChild: string; 
  selectedPeriod: string; 
  selectedMealType: string; 
  selectedSchooling: string;
  selectedDateFrom?: string; 
  selectedDateTo?: string 
}

function isDateParameter(value: string | undefined): 
  value is string { return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value)) }

export default function ReservationFilters({ 
  parentList, 
  childList, 
  selectedParent, 
  selectedChild, 
  selectedPeriod, 
  selectedMealType,
  selectedSchooling,
  selectedDateFrom, 
  selectedDateTo 
}: ReservationFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedRange: DateRange | undefined = 
  isDateParameter(selectedDateFrom) && isDateParameter(selectedDateTo) ? 
    { from: new Date(`${selectedDateFrom}T00:00:00`), to: new Date(`${selectedDateTo}T00:00:00`) } : 
    undefined
  const [customRange, setCustomRange] = useState<DateRange | undefined>(selectedRange)
  useEffect(() => { setCustomRange(selectedRange) }, [selectedDateFrom, selectedDateTo])
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => { if (!value || value === 'all') params.delete(key); else params.set(key, value) })
    const query = params.toString()
    router.replace(query ? `/admin/reservation?${query}` : '/admin/reservation', { scroll: false })
  }
  const visibleChildren =
    selectedParent === 'all' || !selectedParent
      ? childList
      : childList.filter((child) => child.parent === selectedParent)
  return (
  <div className='grid gap-4 sm:grid-cols-2 xl:grid-cols-6'>
    <div className='grid gap-2'>
      <Label htmlFor='parent-filter'>
        Parent
      </Label>
      <Select value={selectedParent} onValueChange={(value) => updateFilters({ 
        parent: value ?? undefined, child: undefined })}>
        <SelectTrigger id='parent-filter' className='w-full'>
          <SelectValue placeholder='Tous les parents' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>
            Tous les parents
          </SelectItem>
          {parentList.map((parent) => 
          <SelectItem key={parent.id} value={parent.id}>{parent.email}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className='grid gap-2'>
      <Label htmlFor='child-filter'>
        Enfant
      </Label>
      <Select value={selectedChild} onValueChange={(value) => updateFilters({ child: value ?? undefined })}>
        <SelectTrigger id='child-filter' className='w-full'>
          <SelectValue placeholder='Tous les enfants' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>
            Tous les enfants
          </SelectItem>
          {visibleChildren.map((child) => 
          <SelectItem key={child.id} value={String(child.id)}>
            {child.name} {child.surname}
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className='grid gap-2'>
      <Label htmlFor='period-filter'>
        Période
      </Label>
      <Select value={selectedPeriod} onValueChange={(value) => 
        updateFilters({ period: value ?? undefined, dateFrom: undefined, dateTo: undefined })}>
        <SelectTrigger id='period-filter' className='w-full'>
          <SelectValue placeholder='Toutes les dates' />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              Toutes les dates
            </SelectItem>
            <SelectItem value='week'>
              Cette semaine
            </SelectItem>
            <SelectItem value='two-weeks'>
              Les 2 prochaines semaines
            </SelectItem>
            <SelectItem value='month'>
              Ce mois
            </SelectItem>
            <SelectItem value='next-month'>
              Mois prochain
            </SelectItem>
            <SelectItem value='custom'>
              Plage personnalisée
            </SelectItem>
          </SelectContent>
      </Select>
    </div>
    <div className='grid gap-2'>
      <Label htmlFor='meal-filter'>
        Type de repas
      </Label>
      <Select 
        value={selectedMealType} 
        onValueChange={(value) => updateFilters({ mealType: value ?? undefined })}
      >
        <SelectTrigger id='meal-filter' className='w-full'>
          <SelectValue placeholder='Tous les repas' />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value='all'>
              Tous
            </SelectItem>
            <SelectItem value='soup'>
              Soupe
            </SelectItem>
            <SelectItem value='meal'>
              Repas chaud
            </SelectItem>
          </SelectContent>
      </Select>
    </div>
    <div className='grid gap-2'>
      <Label htmlFor='schooling-filter'>
        Scolarité
      </Label>
      <Select
        value={selectedSchooling}
        onValueChange={(value) => updateFilters({ schooling: value ?? undefined })}
      >
        <SelectTrigger id='schooling-filter' className='w-full'>
          <SelectValue placeholder='Toutes les scolarités' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='all'>
            Toutes les scolarités
          </SelectItem>
          <SelectItem value='primary'>
            Primaire
          </SelectItem>
          <SelectItem value='preschool'>
            Maternelle
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
    <div className='flex items-end'>
      <Button 
      className='w-full' 
      variant='outline' 
      onClick={() => 
        router.replace('/admin/reservation', { scroll: false })}
      >
        Réinitialiser les filtres
      </Button>
    </div>
    {selectedPeriod === 'custom' && <div className='sm:col-span-2 xl:col-span-5'>
      <p className='mb-2 text-sm font-medium'>
        Plage personnalisée
      </p>
      <Calendar 
        mode='range' 
        selected={customRange} 
        onSelect={(range) => { setCustomRange(range); 
          if (range?.from && range.to) 
            updateFilters({ dateFrom: format(range.from, 'yyyy-MM-dd'), 
            dateTo: format(range.to, 'yyyy-MM-dd') }) }} 
        numberOfMonths={2} 
        locale={fr} 
        weekStartsOn={1} 
        className='w-full rounded-lg border' 
        footer={customRange?.from && customRange.to ? 
          `${format(customRange.from, 'dd/MM/yyyy')} — ${format(customRange.to, 'dd/MM/yyyy')}` :
           'Sélectionnez une date de début puis une date de fin.'} 
        />
    </div>}
  </div>
)}
