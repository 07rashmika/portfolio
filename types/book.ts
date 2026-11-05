// Matches the --spine-* tokens in app/globals.css.
export type SpineColor = "oxblood" | "forest" | "navy" | "ochre" | "plum" | "teal" | "tan" | "red";

export type Link = { label: string; href: string };

export type Page =
  // `body` is plain text; separate paragraphs with a blank line.
  | { kind: "text"; heading?: string; body: string }
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "project-summary"; title: string; year?: string; summary: string; stack: string[]; links?: Link[] }
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "contact"; heading?: string; email: string; links: Link[] };

export type Chapter = {
  id: string; // URL-safe, unique within its book
  title: string;
  pages: Page[];
};

export type Book = {
  id: string; // URL-safe, unique across the shelf; used as ?book=<id>
  title: string;
  subtitle?: string;
  spineColor: SpineColor;
  height: number; // 0.85–1, relative to the tallest book, so the shelf isn't uniform
  chapters: Chapter[];
};
