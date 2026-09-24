import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { reservationSchema } from "@/schema/reservation.schema";
import { format } from "date-fns";
import { 
  getCurrentCycleIndex, 
  getReservationPeriodsUntil,
  getEndYear,
  getFristCommand,
  getFirstReservation
} from "@/constants/constants";
import { getAllRecords } from "@/actions/crud";
export async function POST(req: Request) {

  const body: unknown = await req.json();

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const reservationsResult = reservationSchema.array().safeParse(
    (body as { reservations?: unknown }).reservations,
  );

  if (!reservationsResult.success || reservationsResult.data.length === 0) {
    return NextResponse.json({ error: "Réservations invalides." }, { status: 400 });
  }

  const reservations = reservationsResult.data;
  const childId = reservations[0].id_child;
  if (reservations.some((reservation) => reservation.id_child !== childId)) {
    return NextResponse.json({ error: "Les réservations doivent concerner un seul enfant." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.json({ error: "Utilisateur non authentifié." }, { status: 401 });
  }

  const { data: child, error: childError } = await supabase
    .from("child")
    .select("id, parent")
    .eq("id", childId)
    .eq("parent", user.id)
    .single();

  if (childError || !child) {
    return NextResponse.json({ error: "Enfant introuvable." }, { status: 400 });
  }

  const datas = await getAllRecords('blocked_day');
  const dates = datas.map((data) => new Date(data.blocked_date));
  const [endYear, firstReservation] = await Promise.all([
    getEndYear(),
    getFirstReservation(),
  ]);

  const periods = await getReservationPeriodsUntil(endYear, dates);
  const currentCycleIndex = await getCurrentCycleIndex(new Date(), dates);
  const periodData = periods[currentCycleIndex] ?? periods.at(-1);
  const weeks = periodData?.weeks ?? [{ start: firstReservation, end: firstReservation }];

  const period = {
    start: format(weeks[0]?.start ?? firstReservation, 'yyyy-MM-dd'),
    end: format(weeks[weeks.length - 1]?.end ?? firstReservation, 'yyyy-MM-dd'),
  };

  const hasOutOfRangeDate = reservations.some(({ date }) => {
    const reservationDate = new Date(`${date}T00:00:00`);
    const periodStart = new Date(`${period.start}T00:00:00`);
    const periodEnd = new Date(`${period.end}T00:00:00`);

    return reservationDate < periodStart || reservationDate > periodEnd;
  });

  if (hasOutOfRangeDate) {
    return NextResponse.json(
      {
        error: `La date de réservation doit être comprise entre ${period.start} et ${period.end}.`,
      },
      { status: 400 },
    );
  }

  const hasForbiddenWeekday = reservations.some(({ date }) => {
    const reservationDate = new Date(`${date}T00:00:00`);
    return [3, 6, 0].includes(reservationDate.getDay());
  });

  if (hasForbiddenWeekday) {
    return NextResponse.json(
      {
        error: "Les commandes ne sont pas acceptées les mercredi, samedi et dimanche.",
      },
      { status: 400 },
    );
  }

  const blockedDates = reservations
    .map(({ date }) => date)
    .filter((date) => {
      const normalizedDate = new Date(`${date}T00:00:00`).toISOString().slice(0, 10);
      return dates.some((blockedDate) => {
        const normalizedBlockedDate = new Date(blockedDate).toISOString().slice(0, 10);
        return normalizedBlockedDate === normalizedDate;
      });
    });

  if (blockedDates.length > 0) {
    const blockedDateList = [...new Set(blockedDates)].sort().join(', ');

    return NextResponse.json(
      {
        error: `La date ${blockedDateList} est bloquée et ne peut pas être commandée.`,
      },
      { status: 400 },
    );
  }

  // Check if there are existing reservations for the child within the active reservation period
  const { data: existingReservation, error: reservationError } = await supabase
    .from("reservation")
    .select("id")
    .eq("id_child", childId)
    .gte("date", period.start)
    .lte("date", period.end)
    .limit(1);
  console.log('reservation', existingReservation);
  if (reservationError) {
    return NextResponse.json(
      { error: "Impossible de vérifier les réservations existantes." },
      { status: 500 },
    );
  }
  
  if (existingReservation.length > 0) {
    return NextResponse.json(
      {
        error:
          "Une commande existe déjà pour cet enfant durant cette période de 15 jours.",
      },
      { status: 409 },
    );
  }

  const mealIds = [...new Set(reservations.map(({ meal_id }) => meal_id))];
  const { data: meals, error: mealsError } = await supabase
    .from("meal")
    .select("id, price, type")
    .in("id", mealIds);

  if (mealsError || !meals || meals.length !== mealIds.length) {
    return NextResponse.json({ error: "Repas introuvable." }, { status: 400 });
  }

  const mealsById = new Map(meals.map((meal) => [meal.id, meal]));
  const lineItems = reservations.map((reservation) => {
    const meal = mealsById.get(reservation.meal_id);
    if (!meal || meal.price === null || meal.price <= 0) {
      throw new Error("Le prix d'un repas est invalide.");
    }

    return {
      price_data: {
        currency: "eur",
        product_data: { name: meal.type },
        unit_amount: Math.round(meal.price * 100),
      },
      quantity: 1,
    };
  });

  const origin = new URL(req.url).origin;

  const metadataReservations = JSON.stringify(
    reservations.map(({ date, meal_id }) => ({ d: date, m: meal_id })),
  );
  console.log("metadataReservations: ", metadataReservations.length);

  const session =
    await stripe.checkout.sessions.create({
      mode: "payment",

      success_url:
        `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${origin}/checkout/cancel`,

      line_items: lineItems,

      metadata: {
        parent_id: child.parent,
        child_id: String(childId),
        reservations: metadataReservations,
      },
    });

  return NextResponse.json({
    url: session.url,
  });
}
