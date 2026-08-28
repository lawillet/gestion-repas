"use client";

import { useEffect, useState } from "react";

export default function CheckoutSuccessPage() {
  const [message, setMessage] = useState("Confirmation de la réservation...");

  useEffect(() => {
    const confirmReservation = async () => {
      const sessionId = new URLSearchParams(window.location.search).get("session_id");

      if (!sessionId) {
        setMessage("Session de paiement manquante.");
        return;
      }

      try {
        const response = await fetch(`/api/stripe/webhook?session_id=${encodeURIComponent(sessionId)}`);
        if (!response.ok) {
          throw new Error("Réservation non enregistrée.");
        }
        setMessage("Paiement validé et réservation enregistrée.");
      } catch {
        setMessage("Le paiement est validé, mais la réservation n'a pas pu être enregistrée.");
      }
    };

    void confirmReservation();
  }, []);

  return <p>{message}</p>;
}
