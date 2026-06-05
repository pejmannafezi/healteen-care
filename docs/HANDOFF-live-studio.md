# Handoff Spec: Live Studio (Live Shopping + Stories + Notifications)

> Stack: Next.js 15 (App Router) · React 19 · Tailwind v3 · next-intl · Supabase · Stripe.
> Tokens live in `tailwind.config.ts`; reusable UI in `components/ui/*`. Brand: Healteen Care.

## Overview
A "live shopping" experience: the owner goes live on YouTube and the stream embeds **inside the
site** (`/live`) alongside featured products customers can buy in real time. A **Stories** bar
(Instagram-style, ≤3 image/video) sits at the top of the home page. Customers can **subscribe**
("Notify me") and get **email + web-push** alerts when a live starts. A **LIVE NOW** banner
appears site-wide while live.

User context: mostly mobile, one-handed, may arrive from an Instagram bio link. Connection can be
slow → progressive/graceful loading. Educational/wellness tone (no medical claims).

---

## Layout
- Container: `.container-page` (max-width **1280px**, horizontal padding **1.5rem / 24px**).
- `/live`: two-column on desktop `lg:grid-cols-[1fr_360px]` (player left, featured products right);
  single column stacked on mobile (player first, products below).
- Stories bar: full-width strip under the header, horizontally scrollable.
- LIVE banner: full-width sticky strip directly under the site header (`top: var(--header-h)`).

## Design Tokens Used
| Token (Tailwind) | Value | Usage |
|---|---|---|
| `forest` (primary) | `#1A4D3A` | Primary buttons, headings, banner bg |
| `nature` | `#2E7D5E` | Links, accents, focus ring (`ring`) |
| `mint` | `#4CAF85` | Story ring gradient, success accents |
| `gold` | `#C89B3C` | Secondary CTA (`variant="gold"`), trust |
| `terracotta` | `#B85C38` | Destructive/alerts, "LIVE" dot |
| `cream` | `#F8F5EE` | Page bg (`background`), text on dark |
| `lime` | `#C4F84E` | Notify/energetic CTA accents |
| `border` | `#E2DACB` | Card/section borders |
| `font-heading` | Playfair Display, 600–700 | Titles |
| `font-sans` | Open Sans, 400–700 | Body |
| `font-accent` | Lora italic | Eyebrows / "LIVE" label |
| radius `lg` | `0.75rem` | Cards, player frame |
| shadow `soft` / `card` | see config | Elevated cards |

## Components
| Component | File | Variant/Props | Notes |
|---|---|---|---|
| `LiveBanner` | `components/live/live-banner.tsx` | `{ live }` | Sticky "LIVE NOW" → `/live`; pulsing terracotta dot |
| `LivePlayer` | `components/live/live-player.tsx` | `{ youtubeUrl }` | 16:9 YouTube iframe (`youtube-nocookie`), lazy |
| `LiveFeaturedProducts` | reuse `ProductCard` + `CardAddToCart` | `{ products }` | Buy during live |
| `NotifyButton` | `components/live/notify-button.tsx` | `{}` | Email input + web-push opt-in |
| `StoriesBar` | `components/site/stories-bar.tsx` (built) | `{ stories }` | ≤3 circles + fullscreen viewer |
| `Button` | `components/ui/button.tsx` | `primary`/`gold`/`outline`/`ghost`; `sm`/`default`/`lg`/`icon` | Brand button |

## States and Interactions
| Element | State | Behavior |
|---|---|---|
| Story circle | default | 64px, gradient ring `from-gold via-nature to-mint`, 3px |
| Story circle | tap | Opens fullscreen viewer at that index |
| Story viewer | nav | ◀/▶ change story; past last/before first → close; `Esc`/X closes; backdrop `bg-black/90` |
| Story (video) | open | `autoPlay muted playsInline controls`; images `object-contain` |
| LIVE banner | live only | Visible when `live_sessions.status='live'`; hidden otherwise |
| Go Live (admin) | toggle | Sets status `live`, fires notifications once; "End" → `ended` |
| Notify button | default | "Notify me" (lime/forest) |
| Notify button | submitting | Spinner, disabled; on success → "You're subscribed ✓" (mint) |
| Notify button | push denied | Falls back to email-only; small note "We'll email you" |
| Featured product | in stock | `CardAddToCart` adds to cart, button flips to "Added" 1.5s |
| Featured product | out of stock | Disabled "Out of stock" (outline) |
| Player | no stream | Placeholder: "The live hasn't started yet" + countdown |

## Responsive Behavior
| Breakpoint | Changes |
|---|---|
| Desktop (>1024px) | Player + featured-products sidebar side-by-side; stories show captions |
| Tablet (768–1024px) | Player full width; products in a 2-col grid below |
| Mobile (<768px) | Single column; sticky LIVE banner; stories scroll horizontally; CTAs full-width |

## Edge Cases
- **No live / none scheduled**: `/live` shows friendly empty state + Notify form + link to Shop.
- **Scheduled (future)**: show date/time + live countdown + Notify; no player.
- **>3 stories**: only first 3 active (`is_active`, `sort_order`) render; admin blocked from 4th.
- **Long caption**: truncate to one line on the bar (`truncate`, max ~72px); full text in viewer.
- **Slow video**: stories video `preload="metadata"`; player iframe lazy (`loading="lazy"`).
- **Missing media**: story falls back to nature-tinted placeholder; product → leaf placeholder.
- **Duplicate subscribe**: upsert by email / push endpoint (unique constraints) → idempotent.
- **International/RTL**: layout mirrors under `dir="rtl"` (fa locale); fonts switch to Vazirmatn.

## Animation / Motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| LIVE dot | always (live) | pulse opacity/scale | 1.2s loop | ease-in-out |
| Story viewer | open | fade + slight scale-in | 200ms | ease-out |
| Story bar item | tap | active scale 0.97 | 120ms | ease |
| Add-to-cart | click | icon→check swap | 1500ms hold | — |
| Cards (hover) | hover | translateY(-4px) + shadow `soft` | 200ms | default |

## Accessibility Notes
- Story circles are `<button>` with `aria-label` = caption ("Story"); viewer traps focus, `Esc` closes,
  prev/next have `aria-label`; viewer container `role="dialog" aria-modal="true"`.
- LIVE banner is a link with descriptive text ("Live now — watch & shop"); the pulsing dot is decorative (`aria-hidden`).
- Player iframe has `title="Healteen Care live stream"`.
- Notify input has a visible `<Label>`; success/error announced via `aria-live="polite"`.
- Focus order on `/live`: skip link → header → LIVE banner → player → featured products → Notify.
- All interactive targets ≥ 44×44px (mobile). Contrast: cream text on forest ≥ 4.5:1.

## Data / Backend (already migrated — `0006_live.sql`)
- `live_sessions(status scheduled|live|ended, youtube_url, instagram_url, meeting_url, scheduled_at)`
- `live_featured_products(live_session_id, product_id)`
- `live_subscribers(email unique, push_endpoint unique, push_subscription jsonb)`
- `stories(media_url, media_type image|video, caption, link_url, sort_order, is_active)` — RLS: public read active, admin write.
- Notify API: `POST /api/live/subscribe` (Zod + rate-limit). Go-live send via `web-push` (VAPID) + Resend.
- Service worker `public/sw.js` handles `push` + `notificationclick` → opens `/live`.

## Build order (implementation)
1. YouTube embed util + `LivePlayer` + `/live` page (live/scheduled/empty states).
2. Admin `/admin/live` (CRUD session, featured products, Go Live/End toggle).
3. `LiveBanner` on home + global.
4. Notifications: VAPID + `public/sw.js` + `NotifyButton` + `/api/live/subscribe` + send on Go Live.
