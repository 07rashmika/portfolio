"use client";

import { AnimatePresence } from "motion/react";
import type { SpineBox } from "@/lib/bookLayout";
import type { Book } from "@/types/book";
import { OpenBook } from "./OpenBook";

type Props = {
  book: Book | undefined; // the open book, if any
  initialPageIndex: number;
  measureSpine: (bookId: string) => SpineBox | null;
  onDepart: (bookId: string) => void;
  onReturn: (bookId: string) => void;
  onPageChange: (bookId: string, pageIndex: number) => void;
  onRequestClose: () => void;
};

/**
 * Everything that runs once a book is open, in its own module: <Library> loads it separately
 * after the page is interactive, so the animation library isn't part of the initial page load.
 */
export default function BookOverlay({
  book,
  initialPageIndex,
  measureSpine,
  onDepart,
  onReturn,
  onPageChange,
  onRequestClose,
}: Props) {
  return (
    <AnimatePresence>
      {book && (
        <OpenBook
          key={book.id}
          book={book}
          initialPageIndex={initialPageIndex}
          measureSpine={() => measureSpine(book.id)}
          onDepart={() => onDepart(book.id)}
          onReturn={() => onReturn(book.id)}
          onPageChange={(pageIndex) => onPageChange(book.id, pageIndex)}
          onRequestClose={onRequestClose}
        />
      )}
    </AnimatePresence>
  );
}
