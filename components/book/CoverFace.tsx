import type { Book } from "@/types/book";

/** The front cover: leather with a gold frame, title and subtitle. Fills its parent. */
export function CoverFace({ book }: { book: Book }) {
  return (
    <div
      className="cover-face absolute inset-0 overflow-hidden rounded-r-md"
      style={{ backgroundColor: `var(--spine-${book.spineColor})` }}
    >
      <div aria-hidden className="cover-leather absolute inset-0" />
      <div aria-hidden className="absolute inset-[6%] rounded-sm border-2 border-brass/70" />
      <div aria-hidden className="absolute inset-[8%] rounded-sm border border-brass/40" />

      <div className="relative flex h-full flex-col items-center justify-center px-[14%] text-center">
        <span aria-hidden className="cover-ornament text-brass">
          ❦
        </span>
        <h2 className="cover-title mt-[6%] font-display tracking-[0.12em] text-brass">{book.title}</h2>
        <span aria-hidden className="mt-[5%] h-px w-1/3 bg-brass/70" />
        {book.subtitle && (
          <p className="cover-subtitle mt-[5%] font-heading italic text-brass-bright/85">{book.subtitle}</p>
        )}
      </div>
    </div>
  );
}
