import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Healteen Care — Natural Healthcare & Herbal Wellness",
    template: "%s · Healteen Care",
  },
  description:
    "Lab-tested herbal products and personal consultations for pain relief, healthy aging, and daily body care. Care Today. Live Strong Tomorrow.",
  applicationName: "Healteen Care",
  manifest: "/manifest.json",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Healteen Care — Natural Healthcare & Herbal Wellness",
    description: "Care Today. Live Strong Tomorrow.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A4D3A",
  width: "device-width",
  initialScale: 1,
};

// Pass-through root: the <html>/<body> tags live in app/[locale]/layout.tsx
// so we can set lang/dir from the active locale (next-intl App Router pattern).
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
