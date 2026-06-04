import { notFound } from "next/navigation";

// Catch-all: any unmatched path under a locale renders the locale 404
// (instead of falling through to the global not-found / crashing).
export default function CatchAll() {
  notFound();
}
