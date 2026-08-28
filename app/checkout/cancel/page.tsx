import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <p>
      Payment cancelled. <Link href="/user">Return to your account.</Link>
    </p>
  );
}
