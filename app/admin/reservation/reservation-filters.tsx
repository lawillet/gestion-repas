'use client'

import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useRouter, useSearchParams } from 'next/navigation'
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

const frenchSelectValues: Record<string, string> = {
  all: 'tous',
  week: 'semaine',
  'two-weeks': 'deux-semaines',
  month: 'mois',
  'next-month': 'mois-prochain',
  custom: 'personnalisee',
  soup: 'soupe',
  meal: 'repas-chaud',
  primary: 'primaire',
  preschool: 'maternelle',
}
const filterValuesByFrenchSelectValue = Object.fromEntries(
  Object.entries(frenchSelectValues).map(([filterValue, selectValue]) => [selectValue, filterValue])
) as Record<string, string>

function toFrenchSelectValue(value: string) {
  return frenchSelectValues[value] ?? value
}

function toFilterValue(value: string | null | undefined) {
  return value ? filterValuesByFrenchSelectValue[value] ?? value : undefined
}

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
    isDateParameter(selectedDateFrom) || isDateParameter(selectedDateTo)
      ? {
          from: isDateParameter(selectedDateFrom)
            ? new Date(`${selectedDateFrom}T00:00:00`)
            : undefined,
          to: isDateParameter(selectedDateTo)
            ? new Date(`${selectedDateTo}T00:00:00`)
            : undefined,
        }
      : undefined
  const updateFilters = (updates: Record<string, string | undefined>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, value]) => {
      const filterValue = toFilterValue(value)
      if (!filterValue || filterValue === 'all') params.delete(key)
      else params.set(key, filterValue)
    })
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
      <Select
        value={parentList.find((parent) => parent.id === selectedParent)?.email ?? 'tous'}
        onValueChange={(value) => updateFilters({
          parent: value === 'tous'
            ? undefined
            : parentList.find((parent) => parent.email === value)?.id,
          child: undefined,
        })}
      >
        <SelectTrigger id='parent-filter' className='w-full'>
          <SelectValue placeholder='Tous les parents' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='tous'>
            Tous les parents
          </SelectItem>
          {parentList.map((parent) => 
          <SelectItem key={parent.id} value={parent.email}>{parent.email}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className='grid gap-2'>
      <Label htmlFor='child-filter'>
        Enfant
      </Label>
      <Select
        value={visibleChildren.find((child) => String(child.id) === selectedChild)
          ? `${visibleChildren.find((child) => String(child.id) === selectedChild)?.name} ${visibleChildren.find((child) => String(child.id) === selectedChild)?.surname}`
          : 'tous'}
        onValueChange={(value) => updateFilters({
          child: value === 'tous'
            ? undefined
            : String(visibleChildren.find((child) => `${child.name} ${child.surname}` === value)?.id ?? ''),
        })}
      >
        <SelectTrigger id='child-filter' className='w-full'>
          <SelectValue placeholder='Tous les enfants' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='tous'>
            Tous les enfants
          </SelectItem>
          {visibleChildren.map((child) => 
          <SelectItem key={child.id} value={`${child.name} ${child.surname}`}>
            {child.name} {child.surname}
          </SelectItem>)}
        </SelectContent>
      </Select>
    </div>
    <div className='grid gap-2'>
      <Label htmlFor='period-filter'>
        Période
      </Label>
      <Select value={toFrenchSelectValue(selectedPeriod)} onValueChange={(value) => 
        updateFilters({ period: value ?? undefined, dateFrom: undefined, dateTo: undefined })}>
        <SelectTrigger id='period-filter' className='w-full'>
          <SelectValue placeholder='Toutes les dates' />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value='tous'>
              Toutes les dates
            </SelectItem>
            <SelectItem value='semaine'>
              Cette semaine
            </SelectItem>
            <SelectItem value='deux-semaines'>
              Les 2 prochaines semaines
            </SelectItem>
            <SelectItem value='mois'>
              Ce mois
            </SelectItem>
            <SelectItem value='mois-prochain'>
              Mois prochain
            </SelectItem>
            <SelectItem value='personnalisee'>
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
        value={toFrenchSelectValue(selectedMealType)} 
        onValueChange={(value) => updateFilters({ mealType: value ?? undefined })}
      >
        <SelectTrigger id='meal-filter' className='w-full'>
          <SelectValue placeholder='Tous les repas' />
        </SelectTrigger>
          <SelectContent>
            <SelectItem value='tous'>
              Tous
            </SelectItem>
            <SelectItem value='soupe'>
              Soupe
            </SelectItem>
            <SelectItem value='repas-chaud'>
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
        value={toFrenchSelectValue(selectedSchooling)}
        onValueChange={(value) => updateFilters({ schooling: value ?? undefined })}
      >
        <SelectTrigger id='schooling-filter' className='w-full'>
          <SelectValue placeholder='Toutes les scolarités' />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value='tous'>
            Toutes les scolarités
          </SelectItem>
          <SelectItem value='primaire'>
            Primaire
          </SelectItem>
          <SelectItem value='maternelle'>
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
        selected={selectedRange}
        onSelect={(range) => updateFilters({
          dateFrom: range?.from ? format(range.from, 'yyyy-MM-dd') : undefined,
          dateTo: range?.to ? format(range.to, 'yyyy-MM-dd') : undefined,
        })}
        numberOfMonths={2} 
        locale={fr} 
        weekStartsOn={1} 
        className='w-full rounded-lg border' 
        footer={selectedRange?.from && selectedRange.to ?
          `${format(selectedRange.from, 'dd/MM/yyyy')} — ${format(selectedRange.to, 'dd/MM/yyyy')}` :
           'Sélectionnez une date de début puis une date de fin.'} 
        />
    </div>}
  </div>
)}
