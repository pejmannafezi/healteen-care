import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/site/coming-soon";

export const metadata = { title: "Classes & Webinars" };

export default async function WebinarsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      title="Classes & Webinars"
      description="Live online classes and recorded webinars on herbal wellness are on the way. You'll be able to register and join right here."
    />
  );
}
