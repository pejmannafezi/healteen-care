import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/components/site/coming-soon";

export const metadata = { title: "About" };

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      title="About Pejman Nafezi"
      description="A personal introduction, photo and background are coming here soon."
    />
  );
}
