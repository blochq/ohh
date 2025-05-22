'use client';

import MultigatePaymentForm from "./MultigatePaymentForm";
import TransfiPaymentForm from "./TransfiPaymentForm";


const ACTIVE_RAIL = process.env.NEXT_PUBLIC_ACTIVE_RAIL;

export default function PaymentPage() {
  if (ACTIVE_RAIL === "TRANSFI") {
    return <TransfiPaymentForm />;
  }
  // Fallback: render your existing Multigate payment UI/component
  return <MultigatePaymentForm />;
}