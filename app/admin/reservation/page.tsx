import { getAllRecords } from '@/actions/crud';
import React from 'react'

const Reservation = async () => {
  const [reservations, children, users, meals] = await Promise.all([
    getAllRecords('reservation'),
    getAllRecords('child'),
    getAllRecords('users'),
    getAllRecords('meal'),
  ]);

  const childById = new Map(children.map((child) => [child.id, child]));
  const userById = new Map(users.map((user) => [user.id, user]));
  const mealById = new Map(meals.map((meal) => [meal.id, meal]));
  const sortedReservations = [...reservations].sort((first, second) =>
    first.date.localeCompare(second.date),
  );

  return (
    <main>
      <h1>Réservations des utilisateurs</h1>

      {sortedReservations.length === 0 ? (
        <p>Aucune réservation enregistrée.</p>
      ) : (
        <div className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Enfant</th>
                <th>Date</th>
                <th>Repas</th>
                <th>Prix</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {sortedReservations.map((reservation) => {
                const child = childById.get(reservation.id_child);
                const user = child ? userById.get(child.parent) : undefined;
                const meal = mealById.get(reservation.meal_id);
                

                return (
                  <tr key={reservation.id}>
                    <td>{user?.email ?? 'Utilisateur inconnu'}</td>
                    <td>
                      {child ? `${child.name} ${child.surname}` : 'Enfant inconnu'}
                    </td>
                    <td>{reservation.date}</td>
                    <td>{meal?.type ?? 'Repas inconnu'}</td>
                    <td>
                      {meal?.price != null ? `${meal.price.toFixed(2)} €` : 'Prix indisponible'}
                    </td>
                    <td>
                      {reservation.status === false ? 'Annulée' : 'Active'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default Reservation