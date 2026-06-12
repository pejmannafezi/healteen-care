"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Loader2, AlertCircle, ArrowRight } from "lucide-react";
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
    <div className="bg-cream">
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        {state === "loading" && (
          <div className="animate-fade-in flex flex-col items-center">
            <Loader2 className="size-12 animate-spin text-nature" aria-hidden="true" />
            <p className="mt-5 text-muted-foreground">Confirming your order…</p>
          </div>
        )}

        {state === "ok" && (
          <div className="animate-scale-in flex w-full max-w-xl flex-col items-center rounded-3xl border border-gold/25 bg-white px-6 py-12 shadow-soft sm:px-12">
            <span className="flex size-20 items-center justify-center rounded-full bg-nature/10 ring-8 ring-nature/5">
              <CheckCircle2 className="size-10 text-nature" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-3xl font-bold text-forest [text-wrap:balance]">
              Thank you for your order!
            </h1>
            <div className="gold-divider mt-4 max-w-[10rem]" />
            <p className="mt-4 max-w-md leading-relaxed text-muted-foreground">
              Your payment was successful and your order is confirmed. A receipt has been prepared
              for you.
            </p>
            {orderId && (
              <p className="mt-3 rounded-full border border-border bg-cream px-4 py-1.5 text-sm font-semibold tabular-nums text-forest/70">
                Order ref: {orderId.slice(0, 8).toUpperCase()}
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link href="/account">
                <Button size="lg">View my orders</Button>
              </Link>
              <Link href="/shop">
                <Button size="lg" variant="outline">
                  Continue shopping
                  <ArrowRight aria-hidden="true" className="rtl:-scale-x-100" />
                </Button>
              </Link>
            </div>
          </div>
        )}

        {state === "error" && (
          <div className="animate-fade-up flex w-full max-w-xl flex-col items-center rounded-3xl border border-terracotta/25 bg-white px-6 py-12 shadow-soft sm:px-12">
            <span className="flex size-20 items-center justify-center rounded-full bg-terracotta/10 ring-8 ring-terracotta/5">
              <AlertCircle className="size-10 text-terracotta" aria-hidden="true" />
            </span>
            <h1 className="mt-6 text-2xl font-bold text-forest [text-wrap:balance]">
              We couldn't confirm your order
            </h1>
            <p className="mt-3 max-w-md leading-relaxed text-muted-foreground">
              If you were charged, don't worry — your order will still be processed. Please check
              your account or contact us.
            </p>
            <Link href="/account" className="mt-8">
              <Button size="lg">Go to my account</Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
