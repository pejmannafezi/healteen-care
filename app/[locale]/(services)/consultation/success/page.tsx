"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ConsultationSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="container-page flex min-h-[60vh] items-center justify-center">
          <Loader2 className="size-12 animate-spin text-nature" aria-hidden />
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const sessionId = useSearchParams().get("session_id");
  const [state, setState] = useState<"loading" | "ok" | "error">("loading");
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
        const res = await fetch(`/api/consultation/confirm?session_id=${encodeURIComponent(sessionId)}`);
        const data = await res.json();
        setState(data.ok ? "ok" : "error");
      } catch {
        setState("error");
      }
    })();
  }, [sessionId]);

  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center py-16">
      {state === "loading" && (
        <div className="flex flex-col items-center text-center" aria-live="polite">
          <Loader2 className="size-12 animate-spin text-nature" aria-hidden />
          <p className="mt-4 text-forest/70">Confirming your booking…</p>
        </div>
      )}
      {state === "ok" && (
        <div className="animate-scale-in w-full max-w-xl rounded-3xl border border-gold/20 bg-card p-8 text-center shadow-soft md:p-12">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-nature/10">
            <CheckCircle2 className="size-11 text-nature" aria-hidden />
          </span>
          <h1 className="mt-6 text-3xl font-bold leading-tight text-forest md:text-4xl">
            Your consultation is booked!
          </h1>
          <div className="gold-divider mx-auto mt-5 max-w-[10rem]" />
          <p className="mx-auto mt-5 max-w-md leading-relaxed text-forest/70">
            Payment received and your session is confirmed. We&apos;ve emailed you the details and
            joining information. You can also see it in your account.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/account">
              <Button size="lg">View my bookings</Button>
            </Link>
            <Link href="/">
              <Button size="lg" variant="outline">
                Back to home
              </Button>
            </Link>
          </div>
        </div>
      )}
      {state === "error" && (
        <div className="animate-scale-in w-full max-w-xl rounded-3xl border border-terracotta/25 bg-card p-8 text-center shadow-soft md:p-12">
          <span className="mx-auto flex size-20 items-center justify-center rounded-full bg-terracotta/10">
            <AlertCircle className="size-11 text-terracotta" aria-hidden />
          </span>
          <h1 className="mt-6 text-2xl font-bold leading-tight text-forest md:text-3xl">
            We couldn&apos;t confirm your booking
          </h1>
          <p className="mx-auto mt-4 max-w-md leading-relaxed text-forest/70">
            If you were charged, your booking will still be processed. Please check your account or
            contact us at info@healteencare.com.
          </p>
          <div className="mt-8">
            <Link href="/account">
              <Button size="lg">Go to my account</Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
