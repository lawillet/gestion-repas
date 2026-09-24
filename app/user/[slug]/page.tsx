'use server'
import ReservationCalendars from '@/components/reservationCalendars';
import { getAllRecords, getRecordById } from '@/actions/crud';
import { parseISO } from 'date-fns';
import { notFound } from 'next/navigation';
import {
    getCurrentCycleIndex,
    getEndYear,
    getFirstReservation,
    getFristCommand,
    getReservationPeriodsUntil,
} from '@/constants/constants';
type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

const Reservation = async ({ params }: PageProps) => {
    const { slug } = await params;
    const childId = Number(slug);

    if (!Number.isSafeInteger(childId) || childId < 1) {
        notFound();
    }

    const child = await getRecordById('child', childId);
    if (!child) {
        return <div>Enfant introuvable.</div>;
    }
    const meals = await getAllRecords('meal');
    const soup = meals.find(
        (meal) => meal.type === 'soup' && meal.portion === child?.schooling
    );
    const hotMeal = meals.find(
        (meal) => meal.type === 'meal' && meal.portion === child?.schooling
    );
    
    if (!soup || !hotMeal) {
        return <div>Repas non disponible pour le moment.</div>;
    }
    const soupPrice = soup?.price ?? 0;
    const hotMealPrice = hotMeal?.price ?? 0;

    const datas = await getAllRecords('blocked_day');
    const dates = datas.map((data) => new Date(data.blocked_date));
    const reservations = (await getAllRecords('reservation'))
        .filter((reservation) => reservation.id_child === child.id);
    const reservedDates = reservations.map((reservation) => parseISO(reservation.date));

    const [endYear, firstReservation, firstCommand] = await Promise.all([
        getEndYear(),
        getFirstReservation(),
        getFristCommand(),
    ]);

    const periods = await getReservationPeriodsUntil(endYear, dates);
    const currentCycleIndex = await getCurrentCycleIndex(new Date(), dates);
    const period = periods[currentCycleIndex] ?? periods.at(-1);
    const weeks = period?.weeks ?? [{ start: firstReservation, end: firstReservation }];

    const periodData = {
        commandDeadline: period?.commandDeadline ?? firstCommand,
        minSelectableDate: weeks[0]?.start ?? firstReservation,
        maxSelectableDate: weeks[weeks.length - 1]?.end ?? firstReservation,
        allowedWeeks: weeks,
    };

    return (
        <ReservationCalendars
            childId={child.id}
            soupPrice={soupPrice}
            hotMealPrice={hotMealPrice}
            soupMealId={soup.id}
            hotMealId={hotMeal.id}
            disabledDates={dates}
            reservedDates={reservedDates}
            blockedDays={datas}
            periodData={periodData}
        />

    )
}

export default Reservation


