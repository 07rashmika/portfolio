import type { Book } from "@/types/book";
import { shelves } from "../shelf";

/** Every book, in shelf order (top shelf first, left to right). Add new books in content/shelf.ts. */
export const books: Book[] = shelves.flat().flatMap((item) => (item.type === "book" ? [item.book] : []));

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
