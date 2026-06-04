import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CalendarDays, Clock, Users, CheckCircle2, PlayCircle } from "lucide-react";
import { getWebinar } from "@/lib/services/content";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { registerWebinar } from "../actions";
import { Button } from "@/components/ui/button";
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
    <div className="container-page max-w-3xl py-14">
      <Link href="/webinars" className="text-sm text-nature hover:underline">← Back to classes</Link>
      <h1 className="mt-4 text-4xl font-bold">{webinar.title}</h1>

      <div className="mt-4 flex flex-wrap gap-5 text-sm text-forest/75">
        {webinar.scheduled_at && (
          <span className="inline-flex items-center gap-1.5">
            <CalendarDays className="size-4 text-nature" />
            {new Date(webinar.scheduled_at).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })}
          </span>
        )}
        {webinar.duration_min && (
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-nature" /> {webinar.duration_min} min</span>
        )}
        {webinar.capacity && (
          <span className="inline-flex items-center gap-1.5"><Users className="size-4 text-nature" /> {webinar.capacity} seats</span>
        )}
        <span className="font-semibold text-forest">{webinar.price_cents > 0 ? formatPrice(webinar.price_cents / 100) : "Free"}</span>
      </div>

      {webinar.description && (
        <p className="mt-6 whitespace-pre-line text-lg leading-relaxed text-forest/80">{webinar.description}</p>
      )}

      <div className="mt-8">
        {webinar.recording_url ? (
          <a href={webinar.recording_url} target="_blank" rel="noopener noreferrer">
            <Button size="lg"><PlayCircle /> Watch recording</Button>
          </a>
        ) : registered ? (
          <p className="inline-flex items-center gap-2 rounded-lg bg-mint/15 px-5 py-3 font-semibold text-forest">
            <CheckCircle2 className="size-5 text-nature" /> You're registered — we'll email you the details.
          </p>
        ) : (
          <form action={registerWebinar}>
            <input type="hidden" name="webinar_id" value={webinar.id} />
            <input type="hidden" name="slug" value={slug} />
            <Button size="lg" type="submit">{user ? "Register for this class" : "Log in to register"}</Button>
          </form>
        )}
      </div>
    </div>
  );
}
