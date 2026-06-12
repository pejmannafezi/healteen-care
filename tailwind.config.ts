import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

/**
 * Healteen Care brand tokens — sourced directly from the brand guide.
 * Color ratio guidance: 60% Deep Forest · 25% Cream · 10% Gold · 5% Terracotta/Mint.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.5rem",
      screens: { "2xl": "1280px" },
    },
    extend: {
      colors: {
        // Brand palette
        forest: { DEFAULT: "#1A4D3A", 600: "#1A4D3A", 700: "#143C2D" },
        nature: { DEFAULT: "#2E7D5E" },
        mint: { DEFAULT: "#4CAF85" },
        gold: { DEFAULT: "#C89B3C", 600: "#B98A2E" },
        terracotta: { DEFAULT: "#B85C38" },
        cream: { DEFAULT: "#F8F5EE" },
        // New accent colors (from reference imagery)
        lime: { DEFAULT: "#C4F84E", 600: "#AEE63B" },
        honey: { DEFAULT: "#FFC107", light: "#F8E7B6", dark: "#D9A22E" },

        // Semantic aliases (used by shadcn-style components)
        background: "#F8F5EE",
        foreground: "#1A2E24",
        primary: { DEFAULT: "#1A4D3A", foreground: "#F8F5EE" },
        secondary: { DEFAULT: "#2E7D5E", foreground: "#F8F5EE" },
        accent: { DEFAULT: "#C89B3C", foreground: "#1A2E24" },
        muted: { DEFAULT: "#ECE6D9", foreground: "#5B6B61" },
        border: "#E2DACB",
        ring: "#2E7D5E",
        destructive: { DEFAULT: "#B85C38", foreground: "#F8F5EE" },
        card: { DEFAULT: "#FFFFFF", foreground: "#1A2E24" },
      },
      fontFamily: {
        // Wired to next/font CSS variables (see lib/fonts.ts)
        heading: ["var(--font-heading)", "Georgia", "serif"],
        sans: ["var(--font-body)", "system-ui", "sans-serif"],
        accent: ["var(--font-accent)", "serif"],
        fa: ["var(--font-fa)", "Tahoma", "sans-serif"],
      },
      // Type scale (design-system §3): base 16px, balanced wellness rhythm.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.375rem" }],
        base: ["1rem", { lineHeight: "1.625rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.85rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem", letterSpacing: "-0.01em" }],
        "5xl": ["3rem", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        "6xl": ["3.75rem", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        display: ["4.5rem", { lineHeight: "1", letterSpacing: "-0.025em" }],
      },
      // Organic Biophilic radius (16–24px) + softer small tiers.
      borderRadius: {
        sm: "0.5rem",
        md: "0.75rem",
        lg: "1rem",
        xl: "1.25rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      // Natural, forest-tinted soft elevation scale.
      boxShadow: {
        card: "0 2px 16px -6px rgba(26, 77, 58, 0.10)",
        soft: "0 8px 32px -8px rgba(26, 77, 58, 0.14)",
        lift: "0 16px 48px -12px rgba(26, 77, 58, 0.20)",
        gold: "0 8px 28px -10px rgba(200, 155, 60, 0.45)",
      },
      transitionTimingFunction: {
        "out-soft": "cubic-bezier(0.22, 1, 0.36, 1)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.5s ease-out both",
        "scale-in": "scale-in 0.4s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
