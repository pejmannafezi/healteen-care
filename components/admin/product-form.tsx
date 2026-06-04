"use client";

import { useState } from "react";
import Image from "next/image";
import { X } from "lucide-react";
import { saveProduct } from "@/app/[locale]/(admin)/admin/products/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const TYPES: { value: string; label: string }[] = [
  { value: "tablet", label: "Tablet" },
  { value: "herbal_tea", label: "Herbal Tea" },
  { value: "oil", label: "Oil" },
  { value: "cream", label: "Cream" },
  { value: "drops", label: "Drops" },
  { value: "supplement", label: "Herbal Supplement" },
  { value: "pain_relief_equipment", label: "Pain Relief Equipment" },
  { value: "medical_device", label: "Medical Device" },
  { value: "fitness", label: "Fitness Product" },
  { value: "skin_body", label: "Skin & Body Care" },
];

const BADGES: { value: string; label: string }[] = [
  { value: "gmp", label: "GMP Supported" },
  { value: "lab_tested", label: "Lab-Tested" },
  { value: "third_party", label: "Third-Party Tested" },
  { value: "doctor_approved", label: "Doctor-Approved" },
];

interface Taxo { id: string; name: string }

type ProductLike = {
  id?: string;
  name?: string; type?: string; price_cents?: number; size?: string | null;
  short_description?: string | null; history?: string | null; benefits?: string | null;
  symptoms_supported?: string | null; how_to_use?: string | null; contraindications?: string | null;
  ingredients?: string | null; trust_badges?: string[]; images?: string[];
  stock_qty?: number; low_stock_threshold?: number; is_active?: boolean;
};

export function ProductForm({
  product,
  categories,
  needs,
  selectedCategoryIds,
  selectedNeedIds,
}: {
  product: ProductLike | null;
  categories: Taxo[];
  needs: Taxo[];
  selectedCategoryIds: string[];
  selectedNeedIds: string[];
}) {
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const badges = new Set(product?.trust_badges ?? []);

  return (
    <form action={saveProduct} className="space-y-6">
      <input type="hidden" name="id" value={product?.id ?? "new"} />
      {images.map((url) => (
        <input key={url} type="hidden" name="existing_images" value={url} />
      ))}

      <Section title="Basics">
        <Field label="Product name" required>
          <Input name="name" defaultValue={product?.name ?? ""} required />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Type">
            <select
              name="type"
              defaultValue={product?.type ?? "tablet"}
              className="h-11 w-full rounded-md border border-border bg-white px-3 text-sm"
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Price (USD)" required>
            <Input name="price" type="number" step="0.01" min="0" defaultValue={product ? (product.price_cents! / 100).toFixed(2) : ""} required />
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Size / packaging">
            <Input name="size" defaultValue={product?.size ?? ""} />
          </Field>
          <Field label="Stock qty">
            <Input name="stock_qty" type="number" min="0" defaultValue={product?.stock_qty ?? 0} />
          </Field>
          <Field label="Low-stock alert at">
            <Input name="low_stock_threshold" type="number" min="0" defaultValue={product?.low_stock_threshold ?? 5} />
          </Field>
        </div>
        <Field label="Short description">
          <Textarea name="short_description" defaultValue={product?.short_description ?? ""} rows={2} />
        </Field>
      </Section>

      <Section title="Brand product details">
        <Field label="Product history (herb origin story)">
          <Textarea name="history" defaultValue={product?.history ?? ""} />
        </Field>
        <Field label="Benefits — what it supports">
          <Textarea name="benefits" defaultValue={product?.benefits ?? ""} />
        </Field>
        <Field label="Symptoms & needs it may support">
          <Textarea name="symptoms_supported" defaultValue={product?.symptoms_supported ?? ""} />
        </Field>
        <Field label="How to use">
          <Textarea name="how_to_use" defaultValue={product?.how_to_use ?? ""} />
        </Field>
        <Field label="Who should NOT use it (safety)">
          <Textarea name="contraindications" defaultValue={product?.contraindications ?? ""} />
        </Field>
        <Field label="Ingredients">
          <Textarea name="ingredients" defaultValue={product?.ingredients ?? ""} />
        </Field>
      </Section>

      <Section title="Trust signals">
        <p className="mb-2 text-xs text-forest/60">Only check badges you can back with documentation.</p>
        <div className="flex flex-wrap gap-4">
          {BADGES.map((b) => (
            <label key={b.value} className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="trust_badges" value={b.value} defaultChecked={badges.has(b.value)} />
              {b.label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Categories (Shop by Product Type)">
        <CheckboxGrid name="categories" items={categories} selected={selectedCategoryIds} />
      </Section>
      <Section title="Health needs (Shop by Health Need)">
        <CheckboxGrid name="needs" items={needs} selected={selectedNeedIds} />
      </Section>

      <Section title="Images">
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative size-24 overflow-hidden rounded-lg border border-border">
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((u) => u !== url))}
                  className="absolute right-1 top-1 rounded-full bg-terracotta p-0.5 text-cream"
                  aria-label="Remove image"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="file" name="images" accept="image/*" multiple className="text-sm" />
        <p className="mt-1 text-xs text-forest/50">PNG/JPG/WebP, up to 6MB each.</p>
      </Section>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} />
        Active (visible in shop)
      </label>

      <div className="flex gap-3">
        <Button type="submit" size="lg">Save product</Button>
      </div>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h2 className="mb-4 text-lg font-bold text-forest">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}{required && <span className="text-terracotta"> *</span>}</Label>
      {children}
    </div>
  );
}

function CheckboxGrid({ name, items, selected }: { name: string; items: Taxo[]; selected: string[] }) {
  const set = new Set(selected);
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {items.map((it) => (
        <label key={it.id} className="flex items-center gap-2 text-sm">
          <input type="checkbox" name={name} value={it.id} defaultChecked={set.has(it.id)} />
          {it.name}
        </label>
      ))}
    </div>
  );
}
