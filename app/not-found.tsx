import Link from "next/link";
import { fontVariables } from "@/lib/fonts";
import "./globals.css";

// Global 404 — rendered with the pass-through root layout, so it must supply
// its own <html>/<body>. Covers paths that don't match any locale.
export default function GlobalNotFound() {
  return (
    <html lang="en" className={fontVariables}>
      <body className="flex min-h-dvh flex-col items-center justify-center bg-background text-center">
        <div className="px-6">
          <p className="font-accent text-lg italic text-nature">Healteen Care</p>
          <h1 className="mt-2 text-4xl font-bold text-forest">Page not found</h1>
          <p className="mt-3 text-forest/70">
            The page you're looking for doesn't exist or has moved.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex h-11 items-center rounded-md bg-forest px-6 font-semibold text-cream hover:bg-forest-700"
          >
            Back to home
          </Link>
        </div>
      </body>
    </html>
  );
}
