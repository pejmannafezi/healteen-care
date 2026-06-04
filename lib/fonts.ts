import { Playfair_Display, Open_Sans, Lora, Vazirmatn } from "next/font/google";

/** Headlines — brand guide: Playfair Display (Georgia fallback). */
export const fontHeading = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-heading",
  display: "swap",
});

/** Body — brand guide: Open Sans (Calibri fallback). */
export const fontBody = Open_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
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
