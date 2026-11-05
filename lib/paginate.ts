import type { Book, Page } from "@/types/book";

export type TocEntry = {
  chapterId: string;
  title: string;
  pageIndex: number; // where to jump to
  pageNumber: number; // what to print
};

// `index` is the position in the flat page list (0 = cover) and is what ?page= refers to.
// `number` is the printed page number; covers don't have one.
export type BookPage =
  | { kind: "cover"; index: number }
  | { kind: "toc"; index: number; number: number; entries: TocEntry[] }
  | {
      kind: "content";
      index: number;
      number: number;
      chapterId: string;
      chapterTitle: string;
      isChapterStart: boolean;
      page: Page;
    }
  | { kind: "back-cover"; index: number };

// One view of the open book on desktop. `null` is the inside of a cover board (endpaper).
export type Spread = { left: BookPage | null; right: BookPage | null };

/** Flattens a book into cover → table of contents → chapter pages → back cover. */
export function paginate(book: Book): BookPage[] {
  const chapters = book.chapters.filter((chapter) => chapter.pages.length > 0);

  const entries: TocEntry[] = [];
  const contentPages: BookPage[] = [];
  let index = 2; // 0 = cover, 1 = table of contents
  let number = 2;

  for (const chapter of chapters) {
    entries.push({ chapterId: chapter.id, title: chapter.title, pageIndex: index, pageNumber: number });
    chapter.pages.forEach((page, i) => {
      contentPages.push({
        kind: "content",
        index: index++,
        number: number++,
        chapterId: chapter.id,
        chapterTitle: chapter.title,
        isChapterStart: i === 0,
        page,
      });
    });
  }

  return [
    { kind: "cover", index: 0 },
    { kind: "toc", index: 1, number: 1, entries },
    ...contentPages,
    { kind: "back-cover", index },
  ];
}

/**
 * Pairs pages into two-page spreads, the way a real book opens:
 * the closed cover sits on the right, the first page faces the inside of the
 * front cover, and the closed back cover sits on the left.
 */
export function toSpreads(pages: BookPage[]): Spread[] {
  const cover = pages[0];
  const backCover = pages[pages.length - 1];
  const interior = pages.slice(1, -1);

  const spreads: Spread[] = [
    { left: null, right: cover },
    { left: null, right: interior[0] ?? null },
  ];
  for (let i = 1; i < interior.length; i += 2) {
    spreads.push({ left: interior[i], right: interior[i + 1] ?? null });
  }
  spreads.push({ left: backCover, right: null });

  return spreads;
}

/** The spread that shows the given page, or -1 if no spread contains it. */
export function spreadIndexOf(spreads: Spread[], pageIndex: number): number {
  return spreads.findIndex((spread) => spread.left?.index === pageIndex || spread.right?.index === pageIndex);
}
