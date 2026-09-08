"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Confirmation de la réservation...");
  const [timer, setTimer] = useState(10);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimer((currentTimer) => {
        if (currentTimer <= 1) {
          window.clearInterval(interval);
          return 0;
        }

        return currentTimer - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [router]);

  useEffect(() => {
    if (timer === 0) {
      router.push("/user");
    }
  }, [timer, router]);

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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p>
        {message}
      </p>
      <p>Vous allez être redirigé vers votre espace client dans quelques instants... ({timer} secondes)</p>
      <Link href="/user" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Accéder à mon espace client maintenant
      </Link>
    </div>
  );
}
