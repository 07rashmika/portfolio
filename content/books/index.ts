import type { Book } from "@/types/book";
import { about } from "./about";
import { projects } from "./projects";

/** Every book, in shelf order (left to right). */
export const books: Book[] = [about, projects];

export function getBook(id: string): Book | undefined {
  return books.find((book) => book.id === id);
}
