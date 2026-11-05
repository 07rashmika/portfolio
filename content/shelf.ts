import type { Book } from "@/types/book";
import { about } from "./books/about";
import { awards } from "./books/awards";
import { contact } from "./books/contact";
import { education } from "./books/education";
import { experience } from "./books/experience";
import { notes } from "./books/notes";
import { projects } from "./books/projects";
import { skills } from "./books/skills";

export type DecorKind = "plant" | "candle" | "book-stack";

export type ShelfItem =
  // `lean` tilts the book so its top rests against the book on its left.
  | { type: "book"; book: Book; lean?: boolean }
  | { type: "decor"; kind: DecorKind }
  | { type: "space" }; // an empty stretch of shelf that takes up the remaining width

/** The shelves, top to bottom; each row's items run left to right. */
export const shelves: ShelfItem[][] = [
  [
    { type: "decor", kind: "book-stack" },
    { type: "book", book: about },
    { type: "book", book: projects },
    { type: "book", book: experience },
    { type: "book", book: skills, lean: true },
    { type: "space" },
    { type: "decor", kind: "plant" },
  ],
  [
    { type: "decor", kind: "candle" },
    { type: "space" },
    { type: "book", book: education },
    { type: "book", book: awards },
    { type: "book", book: notes },
    { type: "book", book: contact },
  ],
];
