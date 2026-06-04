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

      <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div>
          <Label>Condition name <span className="text-terracotta">*</span></Label>
          <Input name="name" defaultValue={condition?.name ?? ""} required />
        </div>
        <div>
          <Label>Description</Label>
          <Textarea name="description" defaultValue={condition?.description ?? ""} />
        </div>
        <div>
          <Label>Common symptoms</Label>
          <Textarea name="symptoms" defaultValue={condition?.symptoms ?? ""} />
        </div>
        <div>
          <Label>How herbal options may help</Label>
          <Textarea name="usage_notes" defaultValue={condition?.usage_notes ?? ""} />
        </div>
        <div>
          <Label>Who should avoid these (safety)</Label>
          <Textarea name="who_should_not_use" defaultValue={condition?.who_should_not_use ?? ""} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <Label>Image</Label>
        {condition?.image_url && (
          <div className="relative my-2 size-28 overflow-hidden rounded-lg border border-border">
            <Image src={condition.image_url} alt="" fill sizes="112px" className="object-cover" />
          </div>
        )}
        <input type="file" name="image" accept="image/*" className="text-sm" />
        <p className="mt-1 text-xs text-forest/50">Uploading a new image replaces the current one.</p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <Label>Suggested products</Label>
        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {products.map((p) => (
            <label key={p.id} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="products" value={p.id} defaultChecked={set.has(p.id)} />
              {p.name}
            </label>
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="is_published" defaultChecked={condition?.is_published ?? true} />
        Published (visible in Health Library)
      </label>

      <Button type="submit" size="lg">Save condition</Button>
    </form>
  );
}
