import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

// Locale-aware 404 — rendered inside the [locale] layout (has header/footer).
export default function LocaleNotFound() {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="font-accent text-lg italic text-nature">404</p>
      <h1 className="mt-2 text-4xl font-bold text-forest">Page not found</h1>
      <p className="mt-3 max-w-md text-forest/70">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Link href="/" className="mt-8">
        <Button>Back to home</Button>
      </Link>
    </div>
  );
}
