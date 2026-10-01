import { getAllRecords } from '@/actions/crud';
import { getChildren } from '@/actions/user';
import { getEndYear, getReservationPeriodsUntil } from '@/constants/constants';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarX } from 'lucide-react';
import MyReservationPeriod from '@/components/myReservationPeriod';



const MyRerservation = async () => {
  const [children, reservations, meals] = await Promise.all([
    getChildren(),
    getAllRecords('reservation'),
    getAllRecords('meal'),
  ]);

  const childIds = new Set(children.map((child) => child.id));
  const userReservations = reservations
    .filter((reservation) => childIds.has(reservation.id_child))
    .sort((first, second) => first.date.localeCompare(second.date));

  const mealById = new Map(meals.map((meal) => [meal.id, meal]));
  const childById = new Map(children.map((child) => [child.id, child]));
  
  const blockedDates = (await getAllRecords('blocked_day')).map(
    (row) => new Date(row.blocked_date)
  )
  const endYear = await getEndYear();

  const listOfPeriods = await getReservationPeriodsUntil(endYear, blockedDates);

  const periodsWithReservations = listOfPeriods
    .map((period) => {
      const reservationsForPeriod = userReservations.filter((reservation) => {
        const reservationDate = new Date(reservation.date);
        return reservationDate >= period.start && reservationDate <= period.end;
      });

      return {
        ...period,
        reservations: reservationsForPeriod,
      };
    })
    .filter((period) => period.reservations.length > 0);

  return (
    <div className="container mx-auto py-10">
          <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-semibold text-primary">
          Mes réservations
        </CardTitle>
      </CardHeader>

      <CardContent>
        {periodsWithReservations.length > 0 ? (
          <div className="space-y-6">
            {periodsWithReservations.map((period) => (
              <MyReservationPeriod
                key={period.cycleIndex}
                cycleIndex={period.cycleIndex}
                start={period.start}
                end={period.end}
                reservations={period.reservations.map((reservation) => {
                  const child = childById.get(reservation.id_child)
                  const meal = mealById.get(reservation.meal_id)

                  return {
                    id: reservation.id,
                    date: reservation.date,
                    childId: reservation.id_child,
                    childName: child?.name ?? 'Enfant inconnu',
                    childSurname: child?.surname ?? '',
                    mealType: meal?.type ?? null,
                    mealPrice: meal?.price ?? null,
                  }
                })}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 rounded-lg border border-dashed py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CalendarX className="h-7 w-7" />
            </div>
            <p className="text-muted-foreground">
              Aucune réservation enregistrée.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
    </div>
  );
};

export default MyRerservation;
