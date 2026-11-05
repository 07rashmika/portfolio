import type { BookPage } from "@/lib/paginate";

type Props = { page: Extract<BookPage, { kind: "toc" }> };

/** The contents page. Entries become links to their chapters once pages can turn (Phase 4). */
export function TableOfContents({ page }: Props) {
  return (
    <div className="flex h-full flex-col px-[11%] pt-[13%] pb-[7%]">
      <h3 className="text-center font-heading text-3xl font-semibold sm:text-4xl">Contents</h3>
      <span aria-hidden className="mx-auto mt-3 block text-center text-ink-faded">
        ❦
      </span>

      <ol className="mt-6 space-y-2.5 text-lg sm:mt-8">
        {page.entries.map((entry) => (
          <li key={entry.chapterId} className="flex items-baseline gap-2">
            <span>{entry.title}</span>
            <span aria-hidden className="flex-1 border-b border-dotted border-ink-faded/60" />
            <span className="text-ink-faded">{entry.pageNumber}</span>
          </li>
        ))}
      </ol>

      <p className="mt-auto text-center text-sm text-ink-faded">{page.number}</p>
    </div>
  );
}
