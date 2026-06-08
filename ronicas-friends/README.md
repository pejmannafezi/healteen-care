# Ronica's friends

A self-contained marketing site for **Ronica's friends**, an "Original Dirty Soda" shop modeled on the look and feel of [swig.com](https://swig.com/). No build step or framework — just static `index.html` (homepage) + `menu.html` (full menu), sharing `styles.css`.

## Open it

Just double-click `index.html`, or serve the folder for a localhost URL:

```bash
# from inside ronicas-friends/
python -m http.server 5173
# then open http://localhost:5173
```

## What's inside

- **Announcement bar**, sticky **header** with mobile hamburger nav, and **Order Now** CTA.
- **Hero** — "Original Dirty Soda / Soda Meets Flavor".
- **Good Neighbors Club** banner.
- **Signature Sips** — tabbed menu (Summer Menu, Dirty Sodas, Refreshers, Reviews, Sweets & Treats); cards swap via vanilla JS.
- **Text signup** section (client-side only; shows an inline thank-you).
- **Social feed** grid + **footer**.

The **Menu page** (`menu.html`, populated by `menu.js`) lists every drink and treat by category with prices, and links back to the homepage. Drink visuals are inline SVG cups + CSS gradients, so the pages work fully offline.

## Bag / cart

`cart.js` (loaded on both pages) adds a working client-side bag:

- **Add to Bag** buttons on every drink (homepage Signature Sips) and every menu item.
- A **bag icon with a live count** in the header; opens a slide-out drawer.
- Drawer supports **quantity +/−, remove, running subtotal**, and a demo **Checkout** (no real payment — clears the bag and shows a confirmation).
- The bag **persists in `localStorage`** and carries across the home and menu pages. Fonts (Archivo + Fredoka) load from Google Fonts when online and fall back to system fonts otherwise.
