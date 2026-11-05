import { describe, expect, it } from "vitest";
import type { Book, Chapter, Page } from "@/types/book";
import { paginate, spreadIndexOf, toSpreads, type BookPage } from "./paginate";

const text = (heading: string): Page => ({ kind: "text", heading, body: "" });

function makeBook(chapters: Chapter[]): Book {
  return { id: "test", title: "Test", spineColor: "forest", height: 1, chapters };
}

// Two chapters: "a" has 2 pages, "b" has 1 → cover, toc, a1, a2, b1, back cover.
const twoChapters = makeBook([
  { id: "a", title: "Chapter A", pages: [text("a1"), text("a2")] },
  { id: "b", title: "Chapter B", pages: [text("b1")] },
]);

const kinds = (pages: (BookPage | null)[]) => pages.map((page) => page?.kind ?? null);
const headingOf = (page: BookPage | null) =>
  page?.kind === "content" && page.page.kind === "text" ? page.page.heading : page?.kind ?? null;

describe("paginate", () => {
  it("puts the cover first, then the table of contents, chapter pages, and back cover", () => {
    const pages = paginate(twoChapters);
    expect(kinds(pages)).toEqual(["cover", "toc", "content", "content", "content", "back-cover"]);
    expect(pages.map(headingOf)).toEqual(["cover", "toc", "a1", "a2", "b1", "back-cover"]);
  });

  it("gives every page its position in the list", () => {
    paginate(twoChapters).forEach((page, i) => expect(page.index).toBe(i));
  });

  it("numbers interior pages from 1 and leaves covers unnumbered", () => {
    const numbers = paginate(twoChapters).map((page) => ("number" in page ? page.number : null));
    expect(numbers).toEqual([null, 1, 2, 3, 4, null]);
  });

  it("marks the first page of each chapter", () => {
    const starts = paginate(twoChapters).map((page) => (page.kind === "content" ? page.isChapterStart : null));
    expect(starts).toEqual([null, null, true, false, true, null]);
  });

  it("builds a table of contents that points at each chapter's first page", () => {
    const toc = paginate(twoChapters)[1];
    expect(toc.kind === "toc" && toc.entries).toEqual([
      { chapterId: "a", title: "Chapter A", pageIndex: 2, pageNumber: 2 },
      { chapterId: "b", title: "Chapter B", pageIndex: 4, pageNumber: 4 },
    ]);
  });

  it("skips chapters that have no pages", () => {
    const pages = paginate(
      makeBook([
        { id: "empty", title: "Empty", pages: [] },
        { id: "a", title: "Chapter A", pages: [text("a1")] },
      ]),
    );
    expect(pages.map(headingOf)).toEqual(["cover", "toc", "a1", "back-cover"]);
    expect(pages[1].kind === "toc" && pages[1].entries.map((e) => e.chapterId)).toEqual(["a"]);
  });

  it("still has a cover, contents and back cover when the book has no chapters", () => {
    expect(kinds(paginate(makeBook([])))).toEqual(["cover", "toc", "back-cover"]);
  });
});

describe("toSpreads", () => {
  const spreadHeadings = (book: Book) =>
    toSpreads(paginate(book)).map((spread) => [headingOf(spread.left), headingOf(spread.right)]);

  it("opens like a real book: cover alone on the right, back cover alone on the left", () => {
    // interior = toc, a1, a2, b1 (even count) → toc faces the inside of the front cover
    expect(spreadHeadings(twoChapters)).toEqual([
      [null, "cover"],
      [null, "toc"],
      ["a1", "a2"],
      ["b1", null],
      ["back-cover", null],
    ]);
  });

  it("fills the last spread when the interior has an odd number of pages", () => {
    const book = makeBook([{ id: "a", title: "A", pages: [text("a1"), text("a2")] }]);
    // interior = toc, a1, a2
    expect(spreadHeadings(book)).toEqual([
      [null, "cover"],
      [null, "toc"],
      ["a1", "a2"],
      ["back-cover", null],
    ]);
  });

  it("handles a book with only a table of contents", () => {
    expect(spreadHeadings(makeBook([]))).toEqual([
      [null, "cover"],
      [null, "toc"],
      ["back-cover", null],
    ]);
  });

  it("includes every page exactly once, in order", () => {
    const pages = paginate(twoChapters);
    const shown = toSpreads(pages)
      .flatMap((spread) => [spread.left, spread.right])
      .filter((page) => page !== null)
      .map((page) => page.index);
    expect(shown).toEqual(pages.map((page) => page.index));
  });
});

describe("spreadIndexOf", () => {
  const spreads = toSpreads(paginate(twoChapters));

  it("finds the spread for pages on either side", () => {
    expect(spreadIndexOf(spreads, 0)).toBe(0); // cover
    expect(spreadIndexOf(spreads, 1)).toBe(1); // toc
    expect(spreadIndexOf(spreads, 2)).toBe(2); // a1, left
    expect(spreadIndexOf(spreads, 3)).toBe(2); // a2, right
    expect(spreadIndexOf(spreads, 5)).toBe(4); // back cover
  });

  it("returns -1 for a page that doesn't exist", () => {
    expect(spreadIndexOf(spreads, 99)).toBe(-1);
  });
});
