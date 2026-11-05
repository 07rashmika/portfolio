"use client";

import { motion, useReducedMotion } from "motion/react";
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
  const reduceMotion = useReducedMotion();
  const { away, open, registerSpine } = useLibrary();
  const rotate = lean ? LEAN_DEGREES : 0;
  const height = `calc(var(--book-max-h) * ${book.height})`;
  // Pull the book toward the viewer; with reduced motion, just brighten it.
  const pulled = reduceMotion ? { filter: "brightness(1.2)" } : { y: -14, scale: 1.03 };

  // The open-book animation starts from wherever this spine is on screen.
  const spineRef = useCallback(
    (element: HTMLButtonElement | null) => (element ? registerSpine(book.id, element, rotate) : undefined),
    [registerSpine, book.id, rotate],
  );

  return (
    <motion.button
      ref={spineRef}
      type="button"
      aria-label={`Open ${book.title} book`}
      onClick={() => open(book)}
      className="group relative shrink-0 cursor-pointer rounded-t-[3px] shadow-[2px_0_4px_rgb(0_0_0/0.45)]"
      style={{
        width: `calc(${spineWidth(book)}px * var(--spine-scale))`,
        height,
        marginLeft: lean ? `calc(${height} * ${LEAN_OFFSET})` : undefined,
        backgroundColor: `var(--spine-${book.spineColor})`,
        // While the book is open, its slot on the shelf is empty.
        visibility: away.includes(book.id) ? "hidden" : "visible",
        rotate,
        originX: 0,
        originY: 1,
      }}
      whileHover={pulled}
      whileFocus={pulled}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
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
    </motion.button>
  );
}
