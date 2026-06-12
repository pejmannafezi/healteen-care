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

const CHIP_CLS =
  "flex cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3 py-2.5 text-sm text-foreground transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10";

const FILE_CLS =
  "block w-full max-w-md cursor-pointer rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground transition-colors hover:border-nature/50 file:me-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-forest file:px-4 file:py-2 file:text-xs file:font-semibold file:text-cream";

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

      <Section title="Basics" description="Name, price and inventory.">
        <Field label="Product name" required>
          <Input name="name" defaultValue={product?.name ?? ""} required />
        </Field>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Type">
            <select
              name="type"
              defaultValue={product?.type ?? "tablet"}
              className="block h-11 w-full rounded-lg border border-border bg-white px-3 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
            >
              {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Price (USD)" required>
            <Input name="price" type="number" step="0.01" min="0" defaultValue={product ? (product.price_cents! / 100).toFixed(2) : ""} required />
          </Field>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <Section title="Brand product details" description="The story shoppers read on the product page.">
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

      <Section title="Trust signals" description="Only check badges you can back with documentation.">
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {BADGES.map((b) => (
            <label key={b.value} className={CHIP_CLS}>
              <input
                type="checkbox"
                name="trust_badges"
                value={b.value}
                defaultChecked={badges.has(b.value)}
                className="size-4 shrink-0 accent-forest"
              />
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

      <Section title="Images" description="PNG/JPG/WebP, up to 6MB each.">
        {images.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {images.map((url) => (
              <div key={url} className="relative size-24 overflow-hidden rounded-xl border border-border shadow-card">
                <Image src={url} alt="" fill sizes="96px" className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImages((imgs) => imgs.filter((u) => u !== url))}
                  className="absolute end-1 top-1 rounded-full bg-terracotta p-1 text-cream transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1"
                  aria-label="Remove image"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input type="file" name="images" accept="image/*" multiple className={FILE_CLS} />
      </Section>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 rounded-xl border border-border bg-white px-3.5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-nature/50 has-[:checked]:border-nature has-[:checked]:bg-mint/10">
        <input type="checkbox" name="is_active" defaultChecked={product?.is_active ?? true} className="size-4 accent-forest" />
        Active (visible in shop)
      </label>

      <div className="flex gap-3">
        <Button type="submit" size="lg">Save product</Button>
      </div>
    </form>
  );
}

function Section({
  title, description, children,
}: {
  title: string; description?: string; children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-card">
      <h2 className="text-lg font-bold text-forest">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}{required && <span aria-hidden className="text-terracotta"> *</span>}</Label>
      {children}
    </div>
  );
}

function CheckboxGrid({ name, items, selected }: { name: string; items: Taxo[]; selected: string[] }) {
  const set = new Set(selected);
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((it) => (
        <label key={it.id} className={CHIP_CLS}>
          <input
            type="checkbox"
            name={name}
            value={it.id}
            defaultChecked={set.has(it.id)}
            className="size-4 shrink-0 accent-forest"
          />
          <span className="min-w-0 truncate">{it.name}</span>
        </label>
      ))}
    </div>
  );
}
