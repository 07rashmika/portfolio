"use client";

import { useCallback } from "react";
import { SpineFace } from "@/components/book/SpineFace";
import { spineWidth } from "@/lib/shelf";
import type { Book } from "@/types/book";
import { useLibrary } from "./Library";

// How far a leaning book tilts, and the gap its foot needs so its top rests on the book to its left.
const LEAN_DEGREES = -6;
const LEAN_OFFSET = Math.sin((Math.abs(LEAN_DEGREES) * Math.PI) / 180);

type Props = {
  book: Book;
  lean?: boolean;
};

export function BookSpine({ book, lean }: Props) {
  const { away, open, registerSpine } = useLibrary();
  const rotate = lean ? LEAN_DEGREES : 0;
  const height = `calc(var(--book-max-h) * ${book.height})`;

  // The open-book animation starts from wherever this spine is on screen.
  const spineRef = useCallback(
    (element: HTMLButtonElement | null) => (element ? registerSpine(book.id, element, rotate) : undefined),
    [registerSpine, book.id, rotate],
  );

  return (
    // Hover and focus pull the book towards you (.book-spine in globals.css). That's plain CSS so
    // the shelf works without loading the animation library.
    <button
      ref={spineRef}
      type="button"
      aria-label={`Open ${book.title} book`}
      onClick={() => open(book)}
      className="book-spine group relative shrink-0 cursor-pointer rounded-t-[3px] shadow-[2px_0_4px_rgb(0_0_0/0.45)]"
      style={{
        width: `calc(${spineWidth(book)}px * var(--spine-scale))`,
        height,
        marginLeft: lean ? `calc(${height} * ${LEAN_OFFSET})` : undefined,
        backgroundColor: `var(--spine-${book.spineColor})`,
        // While the book is open, its slot on the shelf is empty.
        visibility: away.includes(book.id) ? "hidden" : "visible",
        ["--lean" as string]: `${rotate}deg`,
      }}
    >
      <SpineFace book={book} />

      {book.subtitle && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-full left-1/2 mb-3 hidden -translate-x-1/2 whitespace-nowrap rounded-sm border border-brass/40 bg-wood-darkest/95 px-2.5 py-1 font-heading text-base italic text-brass-bright opacity-0 shadow-warm transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
        >
          {book.subtitle}
        </span>
      )}
    </button>
  );
}
