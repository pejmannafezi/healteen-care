# Healteen Care — Redesign Design System

Derived from the **ui-ux-pro-max** skill (v2.2.1) for product type *herbal / natural-wellness
e-commerce marketplace*, stack *Next.js + Tailwind + shadcn/ui*. This is the single source of truth for
the `redesign/ui-ux-pro-max` branch. Pages must consume these tokens/components — do **not** fork tokens
or hardcode hex in components.

## 1. Style direction (skill: §Style Selection)
**Primary: Organic Biophilic** (styles.csv #42) — nature, organic rounded shapes (16–24px radius),
soft natural shadows, earthy/green palette, calm wellness feel; WCAG AA; excellent perf;
conversion-friendly.
**Blended with: Soft UI Evolution** (#19, accessible soft depth for health/wellness) and **premium
E-commerce Luxury** cream+gold accents (#4/#33). Result: calm, premium, botanical — an elevation of the
existing brand, not a teardown.

Anti-patterns to avoid: emoji-as-icons (use Lucide SVG), random shadow values, raw hex in components,
hover-only interactions, removing focus rings, mixing flat + skeuomorphic.

## 2. Color system (skill: colors.csv #4/#32/#33 + brand guide)
Keep the brand palette — it already maps onto Organic Biophilic + Luxury Gold. Tokens stay in
`tailwind.config.ts`; refine semantics:

| Role | Token | Hex |
|---|---|---|
| Primary (60%) | `forest` | `#1A4D3A` |
| Secondary | `nature` | `#2E7D5E` |
| Tint | `mint` | `#4CAF85` |
| Accent / luxury (10%) | `gold` | `#C89B3C` (hover `#B98A2E`) |
| Conversion accent | `honey` | `#FFC107` |
| Fresh accent (sparing) | `lime` | `#C4F84E` |
| Destructive | `terracotta` | `#B85C38` |
| Background (25%) | `cream` | `#F8F5EE` |
| Surface | `card` | `#FFFFFF` |
| Foreground | `foreground` | `#1A2E24` |
| Muted text | `muted-foreground` | `#5B6B61` |
| Border | `border` | `#E2DACB` |
| Focus ring | `ring` | `#2E7D5E` |

Rules: semantic tokens only; every functional color also carries icon/text (color-not-only);
foreground/background pairs ≥ 4.5:1 (gold text only on forest/dark, never on cream for body).

## 3. Typography (skill: typography.csv #1 Classic Elegant + #8 Wellness Calm)
Brand fonts already are the recommended pairings — keep them, fix the **scale & hierarchy**:
- Heading: **Playfair Display** (`--font-heading`) — weights 500/600/700, tight leading (1.1–1.2), `text-wrap: balance`.
- Body: **Open Sans** (`--font-body`) — 400/500/600/700, line-height 1.5–1.7, measure 60–75ch.
- Accent / eyebrow / pull-quote: **Lora italic** (`--font-accent`).
- Farsi/RTL: **Vazirmatn** (`--font-fa`).

Type scale (rem): `xs .75 · sm .875 · base 1 · lg 1.125 · xl 1.25 · 2xl 1.5 · 3xl 1.875 · 4xl 2.25 ·
5xl 3 · 6xl 3.75 · display 4.5`. Base body 16px (never < 12px). Weight hierarchy: headings 600–700,
labels 500, body 400.

## 4. Spacing, radius, elevation, motion
- **Spacing**: 4/8px rhythm. Section vertical rhythm tiers: 16 / 24 / 32 / 48 / 64 / 96px. Container
  `max-w` 1280px, gutter 1.5rem.
- **Radius** (Organic Biophilic 16–24px): `sm .5rem · md .75rem · lg 1rem · xl 1.25rem · 2xl 1.5rem ·
  3xl 2rem`; pills/CTAs `rounded-full`.
- **Elevation** (natural, forest-tinted, soft): `card 0 2px 16px -6px rgba(26,77,58,.10)` ·
  `soft 0 8px 32px -8px rgba(26,77,58,.14)` · `lift 0 16px 48px -12px rgba(26,77,58,.20)` (hover).
- **Motion**: micro-interactions 150–300ms, ease-out enter / ease-in exit; one or two animated
  elements per view; `prefers-reduced-motion` respected. Keep `fade-up`; add `fade-in`, `scale-in`.
  Card hover = `-translate-y-1` + shadow lift (transform/opacity only — no width/height animation).

## 5. UX guardrails (skill: Quick Reference §1–§9, CRITICAL first)
- **Accessibility**: contrast ≥4.5:1; visible 2–3px focus rings (never remove); alt text; aria-labels on
  icon-only buttons; sequential headings; skip-link; reduced-motion.
- **Touch**: targets ≥44×44px; ≥8px gaps; loading/disabled states; pressed feedback.
- **Performance**: next/image WebP + width/height (no CLS); lazy below-fold; skeletons >300ms.
- **Forms**: visible labels (not placeholder-only); error below field + `role="alert"`; required mark;
  semantic input types; inline-validate on blur; empty states with guidance.
- **Nav**: active state highlighted; predictable back; ≤5 primary items; sidebar on ≥1024px (admin);
  breadcrumbs for deep pages; consistent placement.

## 6. Landing pattern (skill: landing.csv #1 + #2)
Home & key marketing pages: **Hero + Features + Social-Proof + CTA**. Sticky nav CTA; hero with one
primary CTA (`shop`) + one secondary (`consultation`); trust signals band; testimonials/social proof
before the final CTA; CTA in contrasting forest-on-cream / gold.

## 7. Component conventions (reuse — do not duplicate)
- `components/ui/button.tsx` — variants: primary(forest), secondary(nature), gold, honey(conversion),
  outline, ghost, link; sizes sm/default/lg/icon; ≥44px height for default/lg; `rounded-full` option.
- `components/ui/card.tsx` — `rounded-2xl`, soft shadow, hover-lift helper; `Card/Header/Title/Content`.
- New shared primitives to add as needed: `badge`, `section` heading helper (eyebrow + title + divider).
- Site chrome in `components/site/` (header/footer/chat-widget/stories-bar) restyled to tokens.
- Utilities live in `app/globals.css` (`.container-page`, `.gold-divider`, `.eyebrow`, add
  `.section`, `.card-hover`, `.surface-glass`).

## 8. i18n / RTL
Preserve all `next-intl` `t()` keys; mirror any new copy keys into **both** `messages/en.json` and
`messages/fa.json`. Keep `html[dir="rtl"]` Vazirmatn behavior; use logical spacing where practical.
