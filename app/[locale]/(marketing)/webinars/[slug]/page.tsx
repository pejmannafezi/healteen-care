import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Users,
  CheckCircle2,
  PlayCircle,
  GraduationCap,
} from "lucide-react";
import { getWebinar } from "@/lib/services/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerWebinar } from "../actions";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const w = await getWebinar(slug);
  return { title: w?.title ?? "Webinar" };
}

export default async function WebinarPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const webinar = await getWebinar(slug);
  if (!webinar) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let registered = false;
  if (user) {
    const { data } = await supabase
      .from("class_registrations")
      .select("id")
      .eq("webinar_id", webinar.id)
      .eq("user_id", user.id)
      .maybeSingle();
    registered = Boolean(data);
  }

  return (
    <div className="container-page max-w-3xl py-14 md:py-20">
      <Link
        href="/webinars"
        className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-nature transition-colors hover:text-forest focus-visible:outline-none focus-visible:rounded-md focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ArrowLeft className="size-4 rtl:rotate-180" /> Back to classes
      </Link>

      <header className="mt-6 animate-fade-up">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex size-12 items-center justify-center rounded-xl bg-nature/10 text-nature">
            <GraduationCap className="size-6" />
          </span>
          <Badge variant={webinar.price_cents > 0 ? "gold" : "mint"}>
            {webinar.price_cents > 0 ? formatPrice(webinar.price_cents / 100) : "Free"}
          </Badge>
        </div>
        <h1 className="mt-5 text-balance text-4xl font-bold leading-tight text-forest md:text-5xl">
          {webinar.title}
        </h1>
        <div className="gold-divider mt-6" />
      </header>

      {/* Session details */}
      <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm text-forest/75">
        {webinar.scheduled_at && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4 text-gold-600" />
            {new Date(webinar.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
          </span>
        )}
        {webinar.duration_min && (
          <span className="inline-flex items-center gap-1.5">
            <Clock aria-hidden className="size-4 text-gold-600" /> {webinar.duration_min} min
          </span>
        )}
        {webinar.capacity && (
          <span className="inline-flex items-center gap-1.5">
            <Users aria-hidden className="size-4 text-gold-600" /> {webinar.capacity} seats
          </span>
        )}
      </div>

      {webinar.description && (
        <p className="mt-8 max-w-[70ch] whitespace-pre-line text-lg leading-relaxed text-forest/80">
          {webinar.description}
        </p>
      )}

      {/* Action panel */}
      <div className="mt-10 rounded-2xl border border-border bg-gradient-to-r from-cream via-honey/5 to-cream p-6 shadow-card md:p-8">
        {webinar.recording_url ? (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-accent text-base italic text-gold-600">Session recording</p>
              <p className="mt-1 text-sm text-forest/70">Watch this class whenever it suits you.</p>
            </div>
            <a href={webinar.recording_url} target="_blank" rel="noopener noreferrer">
              <Button size="lg">
                <PlayCircle /> Watch recording
              </Button>
            </a>
          </div>
        ) : registered ? (
          <p className="inline-flex items-center gap-2.5 font-semibold text-forest">
            <CheckCircle2 aria-hidden className="size-5 shrink-0 text-nature" />
            You&rsquo;re registered — we&rsquo;ll email you the details.
          </p>
        ) : (
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-accent text-base italic text-gold-600">Reserve your seat</p>
              <p className="mt-1 text-sm text-forest/70">
                Join live and bring your questions along.
              </p>
            </div>
            <form action={registerWebinar}>
              <input type="hidden" name="webinar_id" value={webinar.id} />
              <input type="hidden" name="slug" value={slug} />
              <Button size="lg" type="submit">
                {user ? "Register for this class" : "Log in to register"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
