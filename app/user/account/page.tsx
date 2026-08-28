import { getAllRecords } from '@/actions/crud';
import { getChildren } from '@/actions/user';
import Link from 'next/link';

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
      {userReservations.length > 0 ? (
        <ul>
          {userReservations.map((reservation) => {
            const child = childById.get(reservation.id_child);
            const meal = mealById.get(reservation.meal_id);

            return (
              <li key={reservation.id}>
                {reservation.date} - {child?.name} {child?.surname} -{' '}
                {meal?.type ?? 'Repas'} -{' '}
                {meal?.price} euros -{' '}
                {reservation.status === false ? 'Annulee' : 'Active'}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>Aucune réservation enregistrée.</p>
      )}
    </div>
  );
};

export default Account;
