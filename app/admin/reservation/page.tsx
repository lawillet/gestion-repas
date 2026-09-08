import { 
  addDays, 
  addMonths, 
  endOfMonth, 
  endOfWeek, 
  format, 
  isValid, 
  parseISO, 
  startOfDay, 
  startOfMonth, 
  startOfWeek 
} from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { getAllRecords } from '@/actions/crud'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import ReservationFilters from './reservation-filters'
import Link from 'next/link'

type ReservationPageProps = { searchParams: 
  Promise<Record<string, 
  string | string[] | undefined>> 
}
const validPeriods = new Set([
  'all', 
  'week', 
  'two-weeks', 
  'month', 
  'next-month', 
  'custom'
])
const validMealTypes = new Set([
  'all', 
  'soup', 
  'meal'
])
const validSchoolings = new Set([
  'all',
  'primary',
  'preschool'
])
function getSingleParameter(value: string | string[] | undefined) { 
  return typeof value === 'string' ? value : undefined 
}
function getDateRange(period: string, dateFrom?: string, dateTo?: string) {
  const today = startOfDay(new Date())
  if (period === 'week') 
    return { from: 
      startOfWeek(today, { weekStartsOn: 1 }), 
      to: 
      endOfWeek(today, { weekStartsOn: 1 }) 
    }
  if (period === 'two-weeks') 
    return { 
      from: 
      today, 
      to: 
      addDays(today, 13) 
    }
  if (period === 'month') 
    return { 
      from: 
      startOfMonth(today), 
      to: endOfMonth(today) 
    }
  if (period === 'next-month') 
    { const nextMonth = addMonths(today, 1); 
        return { 
          from: startOfMonth(nextMonth), 
          to: endOfMonth(nextMonth) 
        } 
    }
  if (period === 'custom' && dateFrom && dateTo) { 
    const from = parseISO(dateFrom); 
    const to = parseISO(dateTo);
     if (isValid(from) && isValid(to) && from <= to) 
        return { from, to } 
  }
}

export default async function Reservation({ searchParams }: ReservationPageProps) {
  const params = await searchParams
  const parentParam = getSingleParameter(params.parent)
  const childParam = getSingleParameter(params.child)
  const periodParam = getSingleParameter(params.period)
  const mealTypeParam = getSingleParameter(params.mealType)
  const schoolingParam = getSingleParameter(params.schooling)
  const dateFrom = getSingleParameter(params.dateFrom)
  const dateTo = getSingleParameter(params.dateTo)
  const selectedParent = parentParam ?? 'all'
  const selectedChild = childParam ?? 'all'
  const selectedPeriod = periodParam && validPeriods.has(periodParam) ? periodParam : 'all'
  const selectedMealType = mealTypeParam && validMealTypes.has(mealTypeParam) ? mealTypeParam : 'all'
  const selectedSchooling = schoolingParam && validSchoolings.has(schoolingParam) ? schoolingParam : 'all'
  const [reservations, children, users, meals] = await Promise.all([
    getAllRecords('reservation'), 
    getAllRecords('child'), 
    getAllRecords('users'), 
    getAllRecords('meal')
  ])
  const parents = users.filter((user) => user.type === 'USER')
  const childById = new Map(children.map((child) => [child.id, child]))
  const userById = new Map(users.map((user) => [user.id, user]))
  const mealById = new Map(meals.map((meal) => [meal.id, meal]))
  const dateRange = getDateRange(selectedPeriod, dateFrom, dateTo)
  const selectedChildId = selectedChild === 'all' ? undefined : Number(selectedChild)
  const sortedReservations = reservations.filter((reservation) => {
    const child = childById.get(reservation.id_child)
    const meal = mealById.get(reservation.meal_id)
    const reservationDate = parseISO(reservation.date)
    return (!parentParam || child?.parent === parentParam) 
    && (!childParam || reservation.id_child === selectedChildId) 
    && (!dateRange || (isValid(reservationDate) 
    && reservationDate >= dateRange.from 
    && reservationDate <= dateRange.to)) 
    && (selectedMealType === 'all' || meal?.type === selectedMealType)
    && (selectedSchooling === 'all' || child?.schooling === selectedSchooling)
  }).sort((first, second) => first.date.localeCompare(second.date))

  return (
  <main className='mx-auto w-full max-w-7xl px-4 py-8 md:px-6 lg:py-10'>
    <p className='text-sm font-medium text-emerald-700'>
      Administration
    </p>
    <h1 className='mt-1 text-3xl font-semibold tracking-tight'>
      Historique des réservations
    </h1>
    <p className='mt-2 text-muted-foreground'>
      Consultez les repas réservés par les familles.
    </p>
    <Card className='mt-8'>
      <CardHeader className='gap-6 border-b'>
        <div>
          <CardTitle>
            Réservations
          </CardTitle>
          <p className='mt-1 text-sm text-muted-foreground'>
            {sortedReservations.length}
             réservation{sortedReservations.length > 1 ? 's' : ''} 
             trouvée{sortedReservations.length > 1 ? 's' : ''}
          </p>
        </div>
        <ReservationFilters 
          parentList={parents} 
          childList={children} 
          selectedParent={selectedParent} 
          selectedChild={selectedChild} 
          selectedPeriod={selectedPeriod} 
          selectedMealType={selectedMealType} 
          selectedSchooling={selectedSchooling}
          selectedDateFrom={dateFrom} 
          selectedDateTo={dateTo} 
        />
      </CardHeader>
      <CardContent className='p-0'>
        {sortedReservations.length === 0 ? 
        <div className='flex flex-col items-center py-14 text-center'>
          <CalendarDays className='size-8 text-muted-foreground' />
          <p className='mt-3 font-medium'>
            Aucune réservation ne correspond aux filtres
          </p>
        </div> : 
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              Utilisateur
            </TableHead>
            <TableHead>
              Enfant
            </TableHead>
            <TableHead>
              Scolarité
            </TableHead>
            <TableHead>
              Date
            </TableHead>
            <TableHead>
              Repas
            </TableHead>
            <TableHead>
              Prix
            </TableHead>
            <TableHead>
              Statut
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>{sortedReservations.map((reservation) => {
          const child = childById.get(reservation.id_child)
          const user = child ? userById.get(child.parent) : undefined
          const meal = mealById.get(reservation.meal_id)
          const schoolingLabel =
            child?.schooling === 'primary'
              ? 'Primaire'
              : child?.schooling === 'preschool'
                ? 'Maternelle'
                : '—'

          return (
            <TableRow key={reservation.id}>
              <TableCell>
                {user?.email ?? 'Utilisateur inconnu'}
              </TableCell>
              <TableCell className='font-medium'>
                {child ? `${child.name} ${child.surname}` : 'Enfant inconnu'}
              </TableCell>
              <TableCell>
                {schoolingLabel}
              </TableCell>
              <TableCell>
                {format(parseISO(reservation.date), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                {meal?.type ?? 'Repas inconnu'}
              </TableCell>
              <TableCell>
                {meal?.price != null ? `${meal.price.toFixed(2)} €` : '—'}
              </TableCell>
              <TableCell>
                <Badge variant={reservation.status === false ? 'outline' : 'success'}>
                  {reservation.status === false ? 'Annulée' : 'Payé'}
                </Badge>
              </TableCell>
            </TableRow>
          )
        })}</TableBody>
      </Table>}</CardContent>
    </Card>
    <a
      href='/api/admin/export-reservations'
      className='inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-xs transition-colors hover:bg-primary/90'
    >
      Exporter les réservations
    </a>
  </main>
  )
}
