"use client";

import { motion, useReducedMotion } from "motion/react";
import { spineWidth } from "@/lib/shelf";
import type { Book } from "@/types/book";

// How far a leaning book tilts, and the gap its foot needs so its top rests on the book to its left.
const LEAN_DEGREES = -6;
const LEAN_OFFSET = Math.sin((Math.abs(LEAN_DEGREES) * Math.PI) / 180);

type Props = {
  book: Book;
  lean?: boolean;
  onOpen?: (book: Book) => void;
};

export function BookSpine({ book, lean, onOpen }: Props) {
  const reduceMotion = useReducedMotion();
  const height = `calc(var(--book-max-h) * ${book.height})`;
  // Pull the book toward the viewer; with reduced motion, just brighten it.
  const pulled = reduceMotion ? { filter: "brightness(1.2)" } : { y: -14, scale: 1.03 };

  return (
    <motion.button
      type="button"
      aria-label={`Open ${book.title} book`}
      onClick={() => onOpen?.(book)}
      className="group relative flex shrink-0 cursor-pointer flex-col items-center rounded-t-[3px] shadow-[2px_0_4px_rgb(0_0_0/0.45)]"
      style={{
        width: `calc(${spineWidth(book)}px * var(--spine-scale))`,
        height,
        marginLeft: lean ? `calc(${height} * ${LEAN_OFFSET})` : undefined,
        backgroundColor: `var(--spine-${book.spineColor})`,
        rotate: lean ? LEAN_DEGREES : 0,
        originX: 0,
        originY: 1,
      }}
      whileHover={pulled}
      whileFocus={pulled}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {/* rounded leather: dark edges, soft highlight */}
      <span aria-hidden className="spine-leather absolute inset-0 rounded-t-[3px]" />

      {/* raised bands near the top and bottom */}
      <span aria-hidden className="spine-band top-[7%]" />
      <span aria-hidden className="spine-band bottom-[7%]" />

      {/* top/bottom percentages are of the spine's height, so these always clear the bands */}
      <span className="spine-title absolute top-[14%] font-display text-[0.7rem] tracking-[0.18em] sm:text-xs lg:text-sm">
        {book.title}
      </span>
      <span aria-hidden className="spine-title absolute bottom-[12%] text-[0.6rem]">
        ◆
      </span>

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
