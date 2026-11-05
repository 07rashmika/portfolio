import { describe, expect, it } from "vitest";
import type { Book, Page } from "@/types/book";
import { contentPageCount, MAX_SPINE_WIDTH, MIN_SPINE_WIDTH, spineWidth } from "./shelf";

const page: Page = { kind: "text", body: "" };

function bookWithPages(...chapterSizes: number[]): Book {
  return {
    id: "test",
    title: "Test",
    spineColor: "forest",
    height: 1,
    chapters: chapterSizes.map((size, i) => ({ id: `c${i}`, title: `C${i}`, pages: Array(size).fill(page) })),
  };
}

describe("contentPageCount", () => {
  it("adds up the pages of every chapter", () => {
    expect(contentPageCount(bookWithPages(2, 3, 1))).toBe(6);
  });

  it("is 0 for a book with no chapters", () => {
    expect(contentPageCount(bookWithPages())).toBe(0);
  });
});

describe("spineWidth", () => {
  it("grows with the page count", () => {
    expect(spineWidth(bookWithPages(4))).toBeGreaterThan(spineWidth(bookWithPages(2)));
  });

  it("never goes below the minimum, even for an empty book", () => {
    expect(spineWidth(bookWithPages())).toBe(MIN_SPINE_WIDTH);
  });

  it("never goes above the maximum", () => {
    expect(spineWidth(bookWithPages(100))).toBe(MAX_SPINE_WIDTH);
  });
});
