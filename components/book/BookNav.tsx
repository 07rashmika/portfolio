import { visiblePages, type Leaf } from "@/lib/paginate";

type Props = {
  leaves: Leaf[];
  position: number;
  last: number;
  totalPages: number;
  onTurnTo: (position: number) => void;
  onContents: () => void;
  ref?: React.Ref<HTMLElement>;
  style?: React.CSSProperties;
};

/** Below the book: previous / next, a ribbon bookmark back to the contents, and where you are. */
export function BookNav({ leaves, position, last, totalPages, onTurnTo, onContents, ref, style }: Props) {
  const showing = visiblePages(leaves, position).filter((page) => page !== null);
  const numbers = showing.flatMap((page) => ("number" in page ? [page.number] : []));
  const label =
    numbers.length === 0
      ? "The end"
      : `${numbers.length > 1 ? "Pages" : "Page"} ${numbers.join("–")} of ${totalPages}`;
  const chapters = [...new Set(showing.flatMap((page) => (page.kind === "content" ? [page.chapterTitle] : [])))];

  const arrow =
    "grid size-10 cursor-pointer place-items-center rounded-full border border-brass/50 bg-wood-darkest/85 text-2xl leading-none text-brass-bright transition-colors hover:border-brass hover:text-paper disabled:cursor-default disabled:opacity-30 disabled:hover:border-brass/50 disabled:hover:text-brass-bright";

  return (
    <nav
      ref={ref}
      aria-label="Pages"
      style={style}
      className="absolute inset-x-0 bottom-0 z-10 flex h-[52px] items-center justify-center gap-3 px-4 pb-2"
    >
      <button
        type="button"
        aria-label="Previous page"
        disabled={position <= 0}
        onClick={() => onTurnTo(position - 1)}
        className={arrow}
      >
        ‹
      </button>

      <button type="button" onClick={onContents} className="ribbon cursor-pointer font-heading text-base">
        Contents
      </button>

      <p aria-hidden className="min-w-[8rem] text-center font-heading text-base text-paper-shade sm:min-w-[9.5rem] sm:text-lg">
        {label}
      </p>
      {/* Announced to screen readers on every turn. */}
      <p aria-live="polite" className="sr-only">
        {[label, ...chapters].join(" — ")}
      </p>

      <button
        type="button"
        aria-label="Next page"
        disabled={position >= last}
        onClick={() => onTurnTo(position + 1)}
        className={arrow}
      >
        ›
      </button>
    </nav>
  );
}
