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
          <Loader2 className="size-12 animate-spin text-nature" />
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
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      {state === "loading" && (
        <>
          <Loader2 className="size-12 animate-spin text-nature" />
          <p className="mt-4 text-forest/70">Confirming your booking…</p>
        </>
      )}
      {state === "ok" && (
        <>
          <CheckCircle2 className="size-16 text-nature" />
          <h1 className="mt-4 text-3xl font-bold">Your consultation is booked!</h1>
          <p className="mt-2 max-w-md text-forest/70">
            Payment received and your session is confirmed. We've emailed you the details and joining
            information. You can also see it in your account.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/account">
              <Button>View my bookings</Button>
            </Link>
            <Link href="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </>
      )}
      {state === "error" && (
        <>
          <AlertCircle className="size-16 text-terracotta" />
          <h1 className="mt-4 text-2xl font-bold">We couldn't confirm your booking</h1>
          <p className="mt-2 max-w-md text-forest/70">
            If you were charged, your booking will still be processed. Please check your account or
            contact us at info@healteencare.com.
          </p>
          <Link href="/account" className="mt-8">
            <Button>Go to my account</Button>
          </Link>
        </>
      )}
    </div>
  );
}
