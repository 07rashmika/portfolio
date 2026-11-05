import { describe, expect, it } from "vitest";
import { books, getBook } from "./index";

// Catches content mistakes (duplicate ids, empty chapters, bad heights) before they reach the site.
const urlSafe = /^[a-z0-9]+(-[a-z0-9]+)*$/;

describe("books content", () => {
  it("has unique, URL-safe book ids", () => {
    const ids = books.map((book) => book.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(urlSafe));
  });

  describe.each(books)("$title", (book) => {
    it("has a height between 0.85 and 1", () => {
      expect(book.height).toBeGreaterThanOrEqual(0.85);
      expect(book.height).toBeLessThanOrEqual(1);
    });

    it("has unique, URL-safe chapter ids", () => {
      const ids = book.chapters.map((chapter) => chapter.id);
      expect(new Set(ids).size).toBe(ids.length);
      ids.forEach((id) => expect(id).toMatch(urlSafe));
    });

    it("has no empty chapters", () => {
      book.chapters.forEach((chapter) => expect(chapter.pages.length, chapter.id).toBeGreaterThan(0));
    });
  });
});

describe("getBook", () => {
  it("finds a book by id", () => {
    expect(getBook("projects")?.title).toBe("Projects");
  });

  it("returns undefined for an unknown id", () => {
    expect(getBook("nope")).toBeUndefined();
  });
});
