import { setRequestLocale } from "next-intl/server";
import { Video, Phone, ShieldCheck, Clock } from "lucide-react";
import { getConsultationSettings, getAvailableSlots } from "@/lib/services/consultations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConsultationBooking } from "@/components/consultation/booking";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Book a Consultation" };

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [settings, slots] = await Promise.all([getConsultationSettings(), getAvailableSlots()]);
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="container-page py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">Personal Consultation</p>
        <h1 className="mt-2 text-4xl font-bold">Book a private wellness consultation</h1>
        <p className="mt-3 text-forest/70">
          A one-on-one paid session — by video or phone — for personalized, natural-wellness
          guidance. Educational support only, not a substitute for medical care.
        </p>
        <div className="mt-5 flex flex-wrap gap-5 text-sm text-forest/80">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="size-4 text-nature" /> {settings.duration_min} minutes
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Video className="size-4 text-nature" /> Video or
            <Phone className="size-4 text-nature" /> Phone
          </span>
          <span className="inline-flex items-center gap-1.5 font-semibold text-forest">
            {formatPrice(settings.price_cents / 100)}
          </span>
        </div>
      </header>

      <div className="mt-10">
        {!settings.is_enabled ? (
          <p className="rounded-xl border border-dashed border-border bg-cream p-8 text-center text-forest/60">
            Consultations are temporarily unavailable. Please check back soon.
          </p>
        ) : (
          <ConsultationBooking
            slots={slots}
            priceCents={settings.price_cents}
            isLoggedIn={Boolean(user)}
          />
        )}
      </div>

      <p className="mt-10 inline-flex items-center gap-2 rounded-lg bg-nature/5 px-4 py-3 text-xs text-forest/70">
        <ShieldCheck className="size-4 text-nature" />
        Payments are processed securely by Stripe. You'll receive confirmation and joining details by email.
      </p>
    </div>
  );
}
