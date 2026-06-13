"use client";

import { Pencil, Check } from "lucide-react";
import { useEditMode } from "./edit-mode";
import { cn } from "@/lib/utils";

/**
 * Fixed floating control, only rendered for admins. Toggles inline edit mode.
 * While editing, a thin banner reminds the admin they're in edit mode.
 */
export function EditToolbar() {
  const { isAdmin, editMode, setEditMode } = useEditMode();
  if (!isAdmin) return null;

  return (
    <>
      {editMode && (
        <div
          aria-hidden
          className="fixed inset-x-0 top-0 z-[60] h-1 bg-gradient-to-r from-nature via-gold to-nature"
        />
      )}
      <button
        type="button"
        onClick={() => setEditMode(!editMode)}
        className={cn(
          // Bottom-LEFT so it never collides with the chat widget (bottom-right).
          "fixed bottom-5 left-5 z-[70] inline-flex min-h-12 items-center gap-2 rounded-full px-5 text-sm font-semibold shadow-lift transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          editMode
            ? "bg-nature text-cream hover:bg-nature/90"
            : "bg-forest text-cream hover:bg-forest/90"
        )}
      >
        {editMode ? <Check className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
        {editMode ? "Done editing" : "Edit content"}
      </button>
    </>
  );
}
