"use client";

import Image from "next/image";
import { saveCondition } from "@/app/[locale]/(admin)/admin/conditions/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ConditionLike = {
  id?: string; name?: string; description?: string | null; symptoms?: string | null;
  usage_notes?: string | null; who_should_not_use?: string | null; image_url?: string | null;
  is_published?: boolean;
};

const CHIP_CLS =
  "flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10";

const FILE_CLS =
  "block w-full max-w-md cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground transition-colors hover:border-nature/50 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream";

export function ConditionForm({
  condition,
  products,
  selectedProductIds,
}: {
  condition: ConditionLike | null;
  products: { id: string; name: string }[];
  selectedProductIds: string[];
}) {
  const set = new Set(selectedProductIds);

  return (
    <form action={saveCondition} className="space-y-6">
      <input type="hidden" name="id" value={condition?.id ?? "new"} />
      {condition?.image_url && <input type="hidden" name="existing_image" value={condition.image_url} />}

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-bold text-forest">Details</h2>
        <div className="mt-4 space-y-4">
          <div>
            <Label htmlFor="cf-name">Condition name <span aria-hidden className="text-terracotta">*</span></Label>
            <Input id="cf-name" name="name" defaultValue={condition?.name ?? ""} required />
          </div>
          <div>
            <Label htmlFor="cf-desc">Description</Label>
            <Textarea id="cf-desc" name="description" defaultValue={condition?.description ?? ""} />
          </div>
          <div>
            <Label htmlFor="cf-symptoms">Common symptoms</Label>
            <Textarea id="cf-symptoms" name="symptoms" defaultValue={condition?.symptoms ?? ""} />
          </div>
          <div>
            <Label htmlFor="cf-usage">How herbal options may help</Label>
            <Textarea id="cf-usage" name="usage_notes" defaultValue={condition?.usage_notes ?? ""} />
          </div>
          <div>
            <Label htmlFor="cf-avoid">Who should avoid these (safety)</Label>
            <Textarea id="cf-avoid" name="who_should_not_use" defaultValue={condition?.who_should_not_use ?? ""} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <Label htmlFor="cf-image" className="text-lg font-bold">Image</Label>
        {condition?.image_url && (
          <div className="relative my-3 size-28 overflow-hidden rounded-xl border border-border shadow-card">
            <Image src={condition.image_url} alt="" fill sizes="112px" className="object-cover" />
          </div>
        )}
        <input id="cf-image" type="file" name="image" accept="image/*" className={FILE_CLS} />
        <p className="mt-1.5 text-xs text-muted-foreground">Uploading a new image replaces the current one.</p>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
        <h2 className="text-lg font-bold text-forest">Suggested products</h2>
        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {products.map((p) => (
            <label key={p.id} className={CHIP_CLS}>
              <input
                type="checkbox"
                name="products"
                value={p.id}
                defaultChecked={set.has(p.id)}
                className="size-4 shrink-0 accent-forest"
              />
              <span className="min-w-0 truncate">{p.name}</span>
            </label>
          ))}
        </div>
      </section>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10">
        <input type="checkbox" name="is_published" defaultChecked={condition?.is_published ?? true} className="size-4 accent-forest" />
        Published (visible in Health Library)
      </label>

      <Button type="submit" size="lg">Save condition</Button>
    </form>
  );
}
