/* TOO MANY ERRORS IN THIS FILE, SO IT IS COMMENTED OUT FOR NOW. */

/*"use server";

import { headers } from "next/headers";
import { getOneTimePaymentPrice, stripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";

function getApplicationUrl(requestHeaders: Headers) {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL;

  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");
  if (!host) throw new Error("Unable to determine the application URL for Stripe Checkout.");

  return `${requestHeaders.get("x-forwarded-proto") ?? "http"}://${host}`;
}

/** Creates a hosted Checkout page for the blueprint's $20 USD one-time product. */
/*export async function createOneTimePaymentCheckoutSession() {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) throw authError;
  if (!authData.user) throw new Error("You must be signed in to start checkout.");

  const price = await getOneTimePaymentPrice();
  if (price.unit_amount === null) {
    throw new Error("The one-time payment price has no amount.");
  }
  const { data: payment, error: paymentError } = await supabase
    .from("payment")
    .insert({
      user_id: authData.user.id,
      amount: price.unit_amount,
      currency: price.currency,
      status: "pending",
      stripe_product_id: price.product as string,
      stripe_price_id: price.id,
    })
    .select("id")
    .single();
  if (paymentError) throw paymentError;

  const applicationUrl = getApplicationUrl(await headers());
  const checkoutSession = await stripe.checkout.sessions.create({
    line_items: [{ price: price.id, quantity: 1 }],
    mode: "payment",
    success_url: `${applicationUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${applicationUrl}/checkout/cancel`,
    metadata: { payment_id: payment.id },
  });

  const { error: updateError } = await supabase
    .from("payment")
    .update({ stripe_checkout_session_id: checkoutSession.id })
    .eq("id", payment.id);
  if (updateError) throw updateError;
  if (!checkoutSession.url) throw new Error("Stripe did not return a Checkout URL.");

  return { url: checkoutSession.url };
}
*/