type Props = {
  bookTitle: string;
  onContents: () => void;
  onClose: () => void;
};

/** The last page: a closing ornament and the ways out of the book. */
export function EndPage({ bookTitle, onContents, onClose }: Props) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-[12%] text-center">
      <span aria-hidden className="text-3xl text-brass">
        ❦
      </span>
      <p className="mt-4 font-display text-2xl tracking-[0.3em]">FINIS</p>
      <p className="mt-3 font-heading text-lg text-ink-faded italic">Thank you for reading {bookTitle}.</p>

      <div className="mt-8 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={onClose}
          className="cursor-pointer rounded-full border border-spine-oxblood/60 px-5 py-1.5 font-heading text-lg text-spine-oxblood transition-colors hover:bg-spine-oxblood hover:text-paper"
        >
          Return to shelf
        </button>
        <button
          type="button"
          onClick={onContents}
          className="cursor-pointer font-heading text-base text-ink-faded underline decoration-ink-faded/40 underline-offset-4 hover:text-ink"
        >
          Back to contents
        </button>
      </div>
    </div>
  );
}
