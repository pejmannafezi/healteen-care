import { Lora, Raleway, Vazirmatn } from "next/font/google";

/**
 * Headlines — Lora (organic serif curves).
 * "Wellness Calm" pairing from ui-ux-pro-max: best for wellness / organic brands.
 */
export const fontHeading = Lora({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

/**
 * Body — Raleway (elegant, light, clean sans).
 * "Wellness Calm" pairing from ui-ux-pro-max.
 */
export const fontBody = Raleway({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
  display: "swap",
});

/** Accent / pull quotes — brand guide: Lora italic. */
export const fontAccent = Lora({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["italic", "normal"],
  variable: "--font-accent",
  display: "swap",
});

/** Persian / Farsi content — brand guide: Vazirmatn. */
export const fontFa = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-fa",
  display: "swap",
});

export const fontVariables = `${fontHeading.variable} ${fontBody.variable} ${fontAccent.variable} ${fontFa.variable}`;
