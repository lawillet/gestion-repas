import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <p>
        Paiement annulé. 
      </p>
      <Link href="/user" className="text-blue-500 hover:text-blue-700">
        Retour à mon espace client
      </Link>
    </div>
  );
}
