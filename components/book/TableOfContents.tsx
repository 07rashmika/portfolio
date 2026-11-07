import type { BookPage } from "@/lib/paginate";

type Props = {
  page: Extract<BookPage, { kind: "toc" }>;
  onJump: (pageIndex: number) => void;
};

/** The contents page. Each entry turns straight to its chapter. */
export function TableOfContents({ page, onJump }: Props) {
  return (
    <div className="flex h-full flex-col px-[11%] pt-[13%] pb-[6%]">
      <h3 className="text-center font-heading text-3xl font-semibold sm:text-4xl">Contents</h3>
      <span aria-hidden className="mx-auto mt-3 block text-center text-ink-faded">
        ❦
      </span>

      <ol className="mt-6 space-y-1 text-lg sm:mt-8">
        {page.entries.map((entry) => (
          <li key={entry.chapterId}>
            <button
              type="button"
              onClick={() => onJump(entry.pageIndex)}
              className="group flex w-full cursor-pointer items-baseline gap-2 py-1 text-left transition-colors hover:text-spine-oxblood"
            >
              <span>{entry.title}</span>
              <span
                aria-hidden
                className="flex-1 border-b border-dotted border-ink-faded/60 group-hover:border-spine-oxblood/60"
              />
              <span className="text-ink-faded group-hover:text-spine-oxblood">
                <span className="sr-only">page </span>
                {entry.pageNumber}
              </span>
            </button>
          </li>
        ))}
      </ol>

      <p className="mt-auto text-center text-sm text-ink-faded">{page.number}</p>
    </div>
  );
}
