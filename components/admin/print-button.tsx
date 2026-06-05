"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="inline-flex h-10 items-center gap-2 rounded-md border border-border bg-white px-4 text-sm font-medium text-forest transition-colors hover:bg-forest/5 print:hidden"
    >
      <Printer className="size-4" />
      Print / Save report
    </button>
  );
}
