"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { useCart } from "@/lib/store/cart";
import { Button } from "@/components/ui/button";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-12 animate-spin text-nature" />
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}

function SuccessInner() {
  const params = useSearchParams();
  const sessionId = params.get("session_id");
  const clear = useCart((s) => s.clear);
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!sessionId) {
      setState("error");
      return;
    }
    (async () => {
      try {
        const res = await fetch(`/api/checkout/confirm?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        if (data.ok) {
          clear();
          setOrderId(data.orderId);
          setState("ok");
        } else {
          setState("error");
        }
      } catch {
        setState("error");
      }
    })();
  }, [sessionId, clear]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      {state === "loading" && (
        <>
          <Loader2 className="size-12 animate-spin text-nature" />
          <p className="mt-4 text-forest/70">Confirming your order…</p>
        </>
      )}

      {state === "ok" && (
        <>
          <CheckCircle2 className="size-16 text-nature" />
          <h1 className="mt-4 text-3xl font-bold">Thank you for your order!</h1>
          <p className="mt-2 text-forest/70">
            Your payment was successful and your order is confirmed. A receipt has been prepared
            for you.
          </p>
          {orderId && (
            <p className="mt-1 text-sm text-forest/50">Order ref: {orderId.slice(0, 8).toUpperCase()}</p>
          )}
          <div className="mt-8 flex gap-3">
            <Link href="/account">
              <Button>View my orders</Button>
            </Link>
            <Link href="/shop">
              <Button variant="outline">Continue shopping</Button>
            </Link>
          </div>
        </>
      )}

      {state === "error" && (
        <>
          <AlertCircle className="size-16 text-terracotta" />
          <h1 className="mt-4 text-2xl font-bold">We couldn't confirm your order</h1>
          <p className="mt-2 max-w-md text-forest/70">
            If you were charged, don't worry — your order will still be processed. Please check
            your account or contact us.
          </p>
          <Link href="/account" className="mt-8">
            <Button>Go to my account</Button>
          </Link>
        </>
      )}
    </div>
  );
}
