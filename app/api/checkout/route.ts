import { stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { reservationSchema } from "@/schema/reservation.schema";

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
        reservations: JSON.stringify(reservations),
      },
    });

  return NextResponse.json({
    url: session.url,
  });
}
