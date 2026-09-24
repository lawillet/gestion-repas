import { getAllRecords } from '@/actions/crud';
import { getChildren } from '@/actions/user';
import Link from 'next/link';
import{ format } from 'date-fns'
import { getEndYear, getReservationPeriodsUntil } from '@/constants/constants';


const Account = async () => {
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
    <div>
      <h1>Mon compte</h1>
      <h2>Mes enfants</h2>
      {children.length > 0 ? (
        <ul>
          {children.map((child) => (
            <li key={child.id}>
              {child.name} {child.surname} - {child.schooling}{' '}
              <Link href={`/user/account/${child.id}`}>Modifier</Link>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <p>Vous n&apos;avez pas d&apos;enfant enregistré.</p>
          <Link href="/user/addChild">Ajouter un enfant</Link>
        </>
      )}

      <h2>Mes réservations</h2>
      {periodsWithReservations.length > 0 ? (
        <div>
          {periodsWithReservations.map((period) => (
            <div key={period.cycleIndex} style={{ marginBottom: '2rem' }}>
              <h3>
                start :{format(period.start, 'dd-MM-yyyy')} end :{format(period.end, 'dd-MM-yyyy')}
              </h3>
              <ul>
                {period.reservations.map((reservation) => {
                  const child = childById.get(reservation.id_child);
                  const meal = mealById.get(reservation.meal_id);
                  const date = new Date(reservation.date);
                  const formatDate = format(date, 'dd-MM-yyyy');

                  return (
                    <li key={reservation.id}>
                      {formatDate} - {child?.name} {child?.surname} -{' '}
                      {meal?.type ?? 'Repas'} -{' '}
                      {meal?.price} euros -{' '}
                      {reservation.status === false ? 'Annulee' : 'Active'}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <p>Aucune réservation enregistrée.</p>
      )}
    </div>
  );
};

export default Account;
