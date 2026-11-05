import type { Book } from "@/types/book";

// Spine width in px at full size; scaled down on small screens by --spine-scale.
const BASE_WIDTH = 38;
const WIDTH_PER_PAGE = 4;
export const MIN_SPINE_WIDTH = 42;
export const MAX_SPINE_WIDTH = 72;

export function contentPageCount(book: Book): number {
  return book.chapters.reduce((count, chapter) => count + chapter.pages.length, 0);
}

/** Thicker books for more pages, within limits so one big book can't take over the shelf. */
export function spineWidth(book: Book): number {
  const width = BASE_WIDTH + WIDTH_PER_PAGE * contentPageCount(book);
  return Math.min(MAX_SPINE_WIDTH, Math.max(MIN_SPINE_WIDTH, width));
}
