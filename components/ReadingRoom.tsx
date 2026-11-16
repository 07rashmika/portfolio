import Link from "next/link";
import { ContentBody } from "@/components/book/pages/PageContent";
import { books } from "@/content/books";

/**
 * Every book on the shelf as plain, selectable text, below the shelf on the same page: for
 * visitors who want the information quickly, for screen readers, and for search engines.
 * It's rendered on the server, so all of it is in the page's HTML even while a section is folded.
 */
export function ReadingRoom() {
  return (
    <section id="reading-room" aria-labelledby="reading-room-title" className="w-full max-w-3xl scroll-mt-8">
      <div className="text-center">
        <h2 id="reading-room-title" className="font-display text-2xl tracking-widest text-brass sm:text-3xl">
          The Reading Room
        </h2>
        <p className="mt-2 font-heading text-lg text-paper-shade italic">Everything on the shelf, as plain text.</p>
      </div>

      <div className="mt-8 space-y-3">
        {books.map((book) => (
          <details key={book.id} id={`read-${book.id}`} className="paper group scroll-mt-8 rounded-sm shadow-warm">
            <summary className="grid cursor-pointer list-none grid-cols-[auto_1fr_auto] items-center gap-x-4 px-5 py-4 sm:px-6 [&::-webkit-details-marker]:hidden">
              <span
                aria-hidden
                className="row-span-2 h-11 w-2.5 rounded-sm"
                style={{ backgroundColor: `var(--spine-${book.spineColor})` }}
              />
              <h3 className="font-heading text-2xl leading-tight font-semibold">{book.title}</h3>
              <span aria-hidden className="row-span-2 text-ink-faded transition-transform group-open:rotate-90">
                ❯
              </span>
              {book.subtitle && <span className="font-heading text-base text-ink-faded italic">{book.subtitle}</span>}
            </summary>

            <div className="border-t border-ink-faded/20 px-5 pt-2 pb-8 sm:px-10">
              {book.chapters
                .filter((chapter) => chapter.pages.length > 0)
                .map((chapter) => (
                  <section key={chapter.id} aria-labelledby={`read-${book.id}-${chapter.id}`} className="mt-6">
                    <h4
                      id={`read-${book.id}-${chapter.id}`}
                      className="font-display text-sm tracking-[0.2em] text-ink-faded uppercase"
                    >
                      {chapter.title}
                    </h4>
                    <div className="mt-3 space-y-6">
                      {chapter.pages.map((page, i) => (
                        // An image page fills its box, so give it one with a fixed shape.
                        <div key={i} className={page.kind === "image" ? "relative aspect-[4/3]" : undefined}>
                          <ContentBody page={page} level={5} />
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

              <p className="mt-8">
                <Link
                  href={`/?book=${book.id}`}
                  scroll={false}
                  className="font-heading text-lg text-spine-oxblood underline decoration-brass/70 underline-offset-4 hover:decoration-spine-oxblood"
                >
                  Open the book ›
                </Link>
              </p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
