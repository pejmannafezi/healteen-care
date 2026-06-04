import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/site/coming-soon";

export const metadata = { title: "Book a Consultation" };

export default async function ConsultationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      title="Personal Consultation"
      description="Private paid consultations — by video or phone — with online booking and secure payment are being set up. Check back soon."
    />
  );
}
