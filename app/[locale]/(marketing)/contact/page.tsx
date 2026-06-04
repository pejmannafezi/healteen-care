import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/site/coming-soon";

export const metadata = { title: "Contact" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      title="Contact Us"
      description="A contact form and our details will appear here soon. In the meantime, email info@healteencare.com."
    />
  );
}
