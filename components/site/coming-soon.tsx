import { Link } from "@/i18n/navigation";
import { Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
      <Leaf className="size-14 text-nature/50" strokeWidth={1.2} />
      <p className="eyebrow mt-4">Coming soon</p>
      <h1 className="mt-2 text-3xl font-bold md:text-4xl">{title}</h1>
      {description && (
        <p className="mt-3 max-w-md text-forest/70">{description}</p>
      )}
      <Link href="/" className="mt-8">
        <Button variant="outline">Back to home</Button>
      </Link>
    </div>
  );
}
