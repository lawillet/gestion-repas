import Stripe from "stripe";
import { headers } from "next/headers";

import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { createReservation } from "@/actions/reservation";
import { reservationSchema } from "@/schema/reservation.schema";

export async function GET(req: Request) {
  const sessionId = new URL(req.url).searchParams.get("session_id");

  if (!sessionId) {
    return new Response("Session Stripe manquante", { status: 400 });
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    await handleCheckoutCompleted(session);
    return new Response("Réservation enregistrée", { status: 200 });
  } catch (error) {
    console.error("Confirmation de réservation échouée:", error);
    return new Response("Réservation non enregistrée", { status: 500 });
  }
}

export async function POST(req: Request) {
  const body = await req.text();

  const signature = (await headers()).get(
    "stripe-signature"
  );

  if (!signature) {
    return new Response("Signature manquante", {
      status: 400,
    });
  }

  let event: Stripe.Event;

  const webhookSecret =
    process.env.WEBHOOK_SIGNING_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error("WEBHOOK_SIGNING_SECRET est manquant.");
    return new Response("Configuration webhook manquante", {
      status: 500,
    });
  }

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (error) {
    console.error("Signature Stripe invalide:", error);
    return new Response("Signature invalide", {
      status: 400,
    });
  }

  if (
    event.type === "checkout.session.completed"
  ) {
    const session =
      event.data.object as Stripe.Checkout.Session;

    try {
      await handleCheckoutCompleted(session);
    } catch (error) {
      console.error("Création des réservations échouée:", error);
      return new Response("Création des réservations échouée", {
        status: 500,
      });
    }
  }

  return new Response("OK");
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session
) {

  const parentId = session.metadata?.parent_id;
  const childId = session.metadata?.child_id;

  if (!childId) {
    throw new Error("Identifiant enfant manquant.");
  }

  const childIdNumber = Number(childId);

  if (!Number.isFinite(childIdNumber)) {
    throw new Error("Identifiant enfant invalide.");
  }

  let reservations: unknown;

  try {
    reservations = JSON.parse(session.metadata?.reservations ?? "[]");
  } catch {
    throw new Error("Réservations invalides.");
  }

  const reservationsResult = reservationSchema.array().safeParse(reservations);

  if (!reservationsResult.success || reservationsResult.data.length === 0) {
    throw new Error("Aucune réservation fournie.");
  }

  const reservationsToInsert = reservationsResult.data;

  const dates = reservationsToInsert.map(({ date }) => date);

  // Vérifier que le paiement est bien payé
  if (session.payment_status !== "paid") {
    throw new Error("Paiement non confirmé.");
  }

  // Vérifier que l'enfant appartient au parent
  const { data: child } =
    await supabaseAdmin
      .from("child")
      .select("id,parent")
      .eq("id", childIdNumber)
      .single();

  if (!child || child.parent !== parentId) {
    throw new Error("Enfant invalide.");
  }

  // Vérifier les jours bloqués
  const { data: blockedDays } =
    await supabaseAdmin
      .from("blocked_day")
      .select("blocked_date")
      .in("blocked_date", dates);

  if ((blockedDays ?? []).length > 0) {
    throw new Error("Jour bloqué.");
  }

  // Préparer les réservations
  const reservationsForChild = reservationsToInsert.map((reservation) => ({
    ...reservation,
    id_child: childIdNumber,
    status: true,
  }));

  // ignorées, ce qui rend le webhook idempotent.
  const { data: existingReservations, error: existingReservationsError } =
    await supabaseAdmin
      .from("reservation")
      .select("date, meal_id")
      .eq("id_child", childIdNumber)
      .in("date", dates);

  if (existingReservationsError) {
    throw existingReservationsError;
  }

  const existingReservationKeys = new Set(
    existingReservations.map(({ date, meal_id }) => `${date}:${meal_id}`),
  );
  const newReservations = reservationsForChild.filter(
    ({ date, meal_id }) => !existingReservationKeys.has(`${date}:${meal_id}`),
  );

  if (newReservations.length > 0) {
    await createReservation(newReservations, supabaseAdmin);
  }
}
