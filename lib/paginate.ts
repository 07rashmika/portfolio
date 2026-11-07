import type { Book, Page } from "@/types/book";

export type TocEntry = {
  chapterId: string;
  title: string;
  pageIndex: number; // where to jump to
  pageNumber: number; // what to print
};

// `index` is the position in the flat page list (0 = cover) and is what ?page= refers to.
// `number` is the printed page number; the cover and the end page don't have one.
export type BookPage =
  | { kind: "cover"; index: number }
  | { kind: "toc"; index: number; number: number; entries: TocEntry[] }
  | {
      kind: "content";
      index: number;
      number: number;
      chapterId: string;
      chapterTitle: string;
      chapterNumber: number; // 1-based
      isChapterStart: boolean;
      page: Page;
    }
  | { kind: "end"; index: number }; // the closing page, with the way back to the shelf

/** One sheet of paper: the front is a right-hand page, the back a left-hand page once turned. */
export type Leaf = { front: BookPage | null; back: BookPage | null };

/** Flattens a book into cover → table of contents → chapter pages → end page. */
export function paginate(book: Book): BookPage[] {
  const chapters = book.chapters.filter((chapter) => chapter.pages.length > 0);

  const entries: TocEntry[] = [];
  const contentPages: BookPage[] = [];
  let index = 2; // 0 = cover, 1 = table of contents
  let number = 2;

  chapters.forEach((chapter, c) => {
    entries.push({ chapterId: chapter.id, title: chapter.title, pageIndex: index, pageNumber: number });
    chapter.pages.forEach((page, i) => {
      contentPages.push({
        kind: "content",
        index: index++,
        number: number++,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        chapterNumber: c + 1,
        isChapterStart: i === 0,
        page,
      });
    });
  });

  return [
    { kind: "cover", index: 0 },
    { kind: "toc", index: 1, number: 1, entries },
    ...contentPages,
    { kind: "end", index },
  ];
}

/**
 * Prints the pages after the cover onto leaves.
 * As a two-page spread both sides are printed; in single-page mode (phones) each page gets its
 * own leaf with a blank back, so every page lands on the right-hand side where it can be seen.
 */
export function toLeaves(pages: BookPage[], spread: boolean): Leaf[] {
  const interior = pages.slice(1);
  if (!spread) return interior.map((front) => ({ front, back: null }));

  const leaves: Leaf[] = [];
  for (let i = 0; i < interior.length; i += 2) {
    leaves.push({ front: interior[i], back: interior[i + 1] ?? null });
  }
  return leaves;
}

// A "position" is how many leaves have been turned. At position p the open book shows the back
// of leaf p - 1 on the left (or the inside of the front cover) and the front of leaf p on the right.

/** The position that shows a page. The cover, or an unknown page, gives the first position. */
export function positionOf(leaves: Leaf[], pageIndex: number): number {
  for (let k = 0; k < leaves.length; k++) {
    if (leaves[k].front?.index === pageIndex) return k;
    if (leaves[k].back?.index === pageIndex) return k + 1;
  }
  return 0;
}

/** The furthest position worth turning to: the one that shows the last page. */
export function lastPosition(leaves: Leaf[]): number {
  const last = leaves.at(-1);
  if (!last) return 0;
  return last.back ? leaves.length : leaves.length - 1;
}

/** The pages showing at a position, left then right; null where there's a cover board instead. */
export function visiblePages(leaves: Leaf[], position: number): [BookPage | null, BookPage | null] {
  return [leaves[position - 1]?.back ?? null, leaves[position]?.front ?? null];
}

/** The first page in reading order at a position: the left page, or the right one if the left is a board. */
export function pageAt(leaves: Leaf[], position: number): BookPage | null {
  const [left, right] = visiblePages(leaves, position);
  return left ?? right;
}
