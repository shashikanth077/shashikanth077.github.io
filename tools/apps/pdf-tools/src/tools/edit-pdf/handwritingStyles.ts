/**
 * "Handwriting style" gallery for the Type-a-signature tab.
 *
 * Downloading webfonts here would mean a network request every time someone
 * signs a document, which is exactly the kind of thing the platform's "runs
 * entirely in your browser" claim promises doesn't happen — so this uses
 * only font stacks already installed on the visitor's OS (with a generic
 * `cursive`/`serif` fallback everywhere they aren't), varying weight, slant
 * and spacing for visual range instead of the font file itself.
 */

export interface HandwritingStyle {
  id: string;
  label: string;
  fontFamily: string;
  fontStyle?: "normal" | "italic";
  fontWeight?: number;
  letterSpacing?: string;
}

export const HANDWRITING_STYLES: HandwritingStyle[] = [
  {
    id: "classic",
    label: "Classic",
    fontFamily: "'Segoe Script', 'Bradley Hand', 'Comic Sans MS', cursive",
  },
  {
    id: "elegant",
    label: "Elegant",
    fontFamily: "'Lucida Handwriting', 'Apple Chancery', 'Segoe Script', cursive",
  },
  {
    id: "flowing",
    label: "Flowing",
    fontFamily: "'Brush Script MT', 'Brush Script Std', 'Segoe Script', cursive",
  },
  {
    id: "bold",
    label: "Bold",
    fontFamily: "'Segoe Script', 'Bradley Hand', cursive",
    fontWeight: 700,
  },
  {
    id: "formal",
    label: "Formal",
    fontFamily: "Georgia, 'Times New Roman', serif",
    fontStyle: "italic",
  },
  {
    id: "modern",
    label: "Modern",
    fontFamily: "Helvetica, Arial, sans-serif",
    fontStyle: "italic",
    letterSpacing: "0.02em",
  },
];

export function handwritingFont(style: HandwritingStyle, sizePx: number): string {
  const weight = style.fontWeight ?? 400;
  const slant = style.fontStyle ?? "normal";
  return `${slant} ${weight} ${sizePx}px ${style.fontFamily}`;
}
