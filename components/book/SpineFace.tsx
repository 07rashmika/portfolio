import type { Book } from "@/types/book";

/**
 * The spine artwork: leather shading, raised bands, gold title.
 * Sized in container units, so it looks the same on the shelf and on the full-size flying book.
 * The parent sets the size and the spine colour.
 */
export function SpineFace({ book }: { book: Book }) {
  return (
    <span className="spine-face absolute inset-0 flex flex-col items-center overflow-hidden rounded-t-[3px]">
      <span aria-hidden className="spine-leather absolute inset-0" />
      <span aria-hidden className="spine-band top-[7%]" />
      <span aria-hidden className="spine-band bottom-[7%]" />
      <span className="spine-title absolute top-[14%] font-display">{book.title}</span>
      <span aria-hidden className="spine-title spine-ornament absolute bottom-[12%]">
        ◆
      </span>
    </span>
  );
}
