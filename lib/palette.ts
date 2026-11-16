import type { SpineColor } from "@/types/book";

// The theme colours as plain values, for code that draws without CSS: the link-preview image and
// the 3D shelf. They must match the tokens in app/globals.css.

export const SPINE_HEX: Record<SpineColor, string> = {
  oxblood: "#6e1f1f",
  forest: "#2f4a34",
  navy: "#22334d",
  ochre: "#9a5b1e",
  plum: "#4b2a40",
  teal: "#1f4a4a",
  tan: "#8a6a45",
  red: "#7a2a20",
};

export const PALETTE = {
  woodDarkest: "#2b1a10",
  woodDark: "#4a2c1a",
  woodMid: "#6b3f24",
  woodLight: "#9c6b3f",
  woodGrain: "#b8865a",
  paper: "#f3e9d2",
  paperShade: "#e4d4b0",
  brass: "#c29a4b",
  brassBright: "#e2c17a",
} as const;
