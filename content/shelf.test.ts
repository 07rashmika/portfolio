import { describe, expect, it } from "vitest";
import { shelves } from "./shelf";

describe("shelf layout", () => {
  it("places each book only once", () => {
    const ids = shelves.flat().flatMap((item) => (item.type === "book" ? [item.book.id] : []));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has at least one book on every shelf", () => {
    shelves.forEach((row) => expect(row.some((item) => item.type === "book")).toBe(true));
  });

  it("only leans a book that has another book to its left", () => {
    shelves.forEach((row) =>
      row.forEach((item, i) => {
        if (item.type === "book" && item.lean) expect(row[i - 1]?.type, item.book.id).toBe("book");
      }),
    );
  });
});
