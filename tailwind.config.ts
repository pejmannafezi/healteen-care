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
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
      boxShadow: {
        soft: "0 4px 24px -8px rgba(26, 77, 58, 0.18)",
        card: "0 2px 16px -6px rgba(26, 77, 58, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [tailwindcssAnimate],
};

export default config;
