// Phase 0 placeholder: shows the theme on a static shelf.
// Replaced by <Library /> (components/library) in Phase 2.

const books = [
  { title: "About Me", color: "bg-spine-oxblood", height: "h-64" },
  { title: "Projects", color: "bg-spine-forest", height: "h-72" },
  { title: "Experience", color: "bg-spine-navy", height: "h-68" },
  { title: "Skills", color: "bg-spine-ochre", height: "h-60" },
  { title: "Education", color: "bg-spine-plum", height: "h-70" },
  { title: "Awards", color: "bg-spine-teal", height: "h-64" },
  { title: "Notes", color: "bg-spine-tan", height: "h-58" },
  { title: "Contact", color: "bg-spine-red", height: "h-66" },
];

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-10 px-4 py-16">
      <header className="text-center">
        <h1 className="font-display text-4xl tracking-widest text-brass sm:text-5xl">The Bookshelf</h1>
        <p className="mt-3 font-heading text-xl italic text-paper-shade">Pick a book and turn its pages.</p>
      </header>

      <section
        aria-label="Bookshelf"
        className="wood w-full max-w-4xl rounded-sm border-8 border-wood-dark p-4 shadow-warm"
      >
        <div className="flex items-end gap-1.5 overflow-x-auto px-2">
          {books.map((book) => (
            <div
              key={book.title}
              className={`${book.color} ${book.height} flex w-12 shrink-0 items-center justify-center rounded-t-sm border-x border-black/30 shadow-warm`}
            >
              <span className="font-display text-sm tracking-widest text-brass [writing-mode:vertical-rl]">
                {book.title}
              </span>
            </div>
          ))}
        </div>
        {/* shelf plank */}
        <div className="h-4 bg-wood-light shadow-warm" />
      </section>

      <article className="paper max-w-xl rounded-sm p-8 shadow-warm">
        <h2 className="font-heading text-3xl font-semibold">Chapter I</h2>
        <p className="mt-3 text-lg leading-relaxed">
          Body text in EB Garamond on parchment, with <span className="text-ink-faded">faded ink</span> for
          captions and <code className="font-mono text-sm">mono</code> for tech tags.
        </p>
      </article>
    </main>
  );
}
