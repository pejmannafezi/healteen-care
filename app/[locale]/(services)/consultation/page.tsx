import { setRequestLocale } from "next-intl/server";
import { Video, Phone, ShieldCheck, Clock, Leaf, CalendarX2 } from "lucide-react";
import { getConsultationSettings, getAvailableSlots } from "@/lib/services/consultations";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { ConsultationBooking } from "@/components/consultation/booking";
import { Badge } from "@/components/ui/badge";
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
    <>
      {/* ── Consultation hero ── */}
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-cream to-[#EFEADD]/40">
        <div className="pointer-events-none absolute -bottom-12 -end-12 opacity-[0.04]" aria-hidden>
          <Leaf className="size-72 text-forest" strokeWidth={1} />
        </div>
        <div className="container-page py-16 md:py-20">
          <div className="max-w-2xl animate-fade-up">
            <p className="eyebrow">Personal Consultation</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-forest md:text-5xl">
              Book a private wellness consultation
            </h1>
            <div className="gold-divider mt-5 max-w-[10rem]" />
            <p className="mt-5 text-lg leading-relaxed text-forest/75">
              A one-on-one paid session — by video or phone — for personalized, natural-wellness
              guidance. Educational support only, not a substitute for medical care.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Badge variant="nature" className="px-3.5 py-1.5 text-sm">
                <Clock aria-hidden /> {settings.duration_min} minutes
              </Badge>
              <Badge variant="forest" className="px-3.5 py-1.5 text-sm">
                <Video aria-hidden /> Video
              </Badge>
              <Badge variant="forest" className="px-3.5 py-1.5 text-sm">
                <Phone aria-hidden /> Phone
              </Badge>
              <Badge variant="gold" className="px-3.5 py-1.5 text-sm font-bold">
                {formatPrice(settings.price_cents / 100)}
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <div className="container-page py-12 md:py-16">
        {!settings.is_enabled ? (
          <div className="mx-auto max-w-lg rounded-2xl border border-dashed border-border bg-cream p-10 text-center">
            <CalendarX2 className="mx-auto size-10 text-nature/50" strokeWidth={1.2} aria-hidden />
            <p className="mt-4 font-semibold text-forest">
              Consultations are temporarily unavailable. Please check back soon.
            </p>
          </div>
        ) : (
          <ConsultationBooking
            slots={slots}
            priceCents={settings.price_cents}
            isLoggedIn={Boolean(user)}
          />
        )}

        <div className="mt-12 flex items-start gap-3 rounded-2xl border border-nature/15 bg-nature/5 p-5 text-xs leading-relaxed text-forest/70 sm:items-center">
          <ShieldCheck className="size-5 shrink-0 text-nature" aria-hidden />
          <p>
            Payments are processed securely by Stripe. You&apos;ll receive confirmation and joining
            details by email.
          </p>
        </div>
      </div>
    </>
  );
}
