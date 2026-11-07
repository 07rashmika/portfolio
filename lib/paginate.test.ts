import { describe, expect, it } from "vitest";
import type { Book, Chapter, Page } from "@/types/book";
import {
  lastPosition,
  pageAt,
  paginate,
  positionOf,
  toLeaves,
  visiblePages,
  type BookPage,
  type Leaf,
} from "./paginate";

const text = (heading: string): Page => ({ kind: "text", heading, body: "" });

function makeBook(chapters: Chapter[]): Book {
  return { id: "test", title: "Test", spineColor: "forest", height: 1, chapters };
}

// Two chapters: "a" has 2 pages, "b" has 1 → cover, toc, a1, a2, b1, end.
const twoChapters = makeBook([
  { id: "a", title: "Chapter A", pages: [text("a1"), text("a2")] },
  { id: "b", title: "Chapter B", pages: [text("b1")] },
]);

const kinds = (pages: (BookPage | null)[]) => pages.map((page) => page?.kind ?? null);
const name = (page: BookPage | null) =>
  page?.kind === "content" && page.page.kind === "text" ? page.page.heading : (page?.kind ?? null);
const leafNames = (leaves: Leaf[]) => leaves.map((leaf) => [name(leaf.front), name(leaf.back)]);

describe("paginate", () => {
  it("puts the cover first, then the table of contents, chapter pages, and the end page", () => {
    const pages = paginate(twoChapters);
    expect(kinds(pages)).toEqual(["cover", "toc", "content", "content", "content", "end"]);
    expect(pages.map(name)).toEqual(["cover", "toc", "a1", "a2", "b1", "end"]);
  });

  it("gives every page its position in the list", () => {
    paginate(twoChapters).forEach((page, i) => expect(page.index).toBe(i));
  });

  it("numbers the contents and chapter pages from 1, and not the cover or end page", () => {
    const numbers = paginate(twoChapters).map((page) => ("number" in page ? page.number : null));
    expect(numbers).toEqual([null, 1, 2, 3, 4, null]);
  });

  it("marks the first page of each chapter and numbers the chapters", () => {
    const chapterInfo = paginate(twoChapters).flatMap((page) =>
      page.kind === "content" ? [[page.chapterNumber, page.isChapterStart]] : [],
    );
    expect(chapterInfo).toEqual([
      [1, true],
      [1, false],
      [2, true],
    ]);
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
    expect(pages.map(name)).toEqual(["cover", "toc", "a1", "end"]);
    expect(pages[1].kind === "toc" && pages[1].entries.map((e) => e.chapterId)).toEqual(["a"]);
  });

  it("still has a cover, contents and end page when the book has no chapters", () => {
    expect(kinds(paginate(makeBook([])))).toEqual(["cover", "toc", "end"]);
  });
});

describe("toLeaves", () => {
  it("prints two pages per leaf for a spread, front then back", () => {
    // interior = toc, a1, a2, b1, end
    expect(leafNames(toLeaves(paginate(twoChapters), true))).toEqual([
      ["toc", "a1"],
      ["a2", "b1"],
      ["end", null],
    ]);
  });

  it("prints one page per leaf in single-page mode", () => {
    expect(leafNames(toLeaves(paginate(twoChapters), false))).toEqual([
      ["toc", null],
      ["a1", null],
      ["a2", null],
      ["b1", null],
      ["end", null],
    ]);
  });

  it.each([true, false])("includes every page after the cover exactly once, in order (spread: %s)", (spread) => {
    const pages = paginate(twoChapters);
    const printed = toLeaves(pages, spread)
      .flatMap((leaf) => [leaf.front, leaf.back])
      .filter((page) => page !== null)
      .map((page) => page.index);
    expect(printed).toEqual(pages.slice(1).map((page) => page.index));
  });
});

describe("positions", () => {
  const pages = paginate(twoChapters);
  const spread = toLeaves(pages, true);
  const single = toLeaves(pages, false);
  const shown = (leaves: Leaf[], position: number) => visiblePages(leaves, position).map(name);

  it("opens on the contents, facing the inside of the front cover", () => {
    expect(shown(spread, 0)).toEqual([null, "toc"]);
  });

  it("shows the back of the last turned leaf beside the front of the next", () => {
    expect(shown(spread, 1)).toEqual(["a1", "a2"]);
    expect(shown(spread, 2)).toEqual(["b1", "end"]);
  });

  it("stops at the position that shows the last page", () => {
    expect(lastPosition(spread)).toBe(2); // the end page is a front, so its leaf stays unturned
    // toc, a1, a2, end → [toc | a1], [a2 | end]: the end page is a back, so its leaf is turned too
    const endOnBack = toLeaves(paginate(makeBook([{ id: "a", title: "A", pages: [text("a1"), text("a2")] }])), true);
    expect(lastPosition(endOnBack)).toBe(2);
    expect(name(visiblePages(endOnBack, 2)[0])).toBe("end");
    expect(lastPosition(single)).toBe(4);
    expect(lastPosition([])).toBe(0);
  });

  it("finds the position for a page on either side", () => {
    expect(positionOf(spread, 1)).toBe(0); // toc, right
    expect(positionOf(spread, 2)).toBe(1); // a1, left
    expect(positionOf(spread, 3)).toBe(1); // a2, right
    expect(positionOf(single, 3)).toBe(2);
  });

  it("treats the cover and unknown pages as the first position", () => {
    expect(positionOf(spread, 0)).toBe(0);
    expect(positionOf(spread, 99)).toBe(0);
  });

  it("names the first page in reading order at each position", () => {
    expect(name(pageAt(spread, 0))).toBe("toc"); // left is the cover board
    expect(name(pageAt(spread, 1))).toBe("a1");
    expect(name(pageAt(single, 2))).toBe("a2");
  });

  it("round-trips between pages and positions", () => {
    for (const leaves of [spread, single]) {
      for (let p = 0; p <= lastPosition(leaves); p++) {
        expect(positionOf(leaves, pageAt(leaves, p)!.index)).toBe(p);
      }
    }
  });
});
