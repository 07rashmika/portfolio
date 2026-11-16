import { Bookshelf } from "@/components/library/Bookshelf";
import { Library } from "@/components/library/Library";
import { ReadingRoom } from "@/components/ReadingRoom";
import { site } from "@/content/site";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4">
      <a
        href="#reading-room"
        className="sr-only rounded-full bg-wood-darkest px-4 py-2 font-heading text-lg text-brass-bright focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50"
      >
        Skip to the reading room (plain text)
      </a>

      <section className="flex min-h-dvh w-full flex-col items-center justify-center gap-8 py-10 sm:py-14 lg:gap-5 lg:py-6">
        <header className="text-center">
          <p className="font-display text-sm tracking-[0.3em] text-paper-shade uppercase">The bookshelf of</p>
          <h1 className="mt-2 font-display text-3xl tracking-widest text-brass sm:text-5xl">{site.name}</h1>
          <p className="mt-2 font-heading text-lg text-paper-shade italic sm:text-xl">
            {site.role} · Pick a book and turn its pages.
          </p>
        </header>

        <Library>
          <Bookshelf />
        </Library>

        <a
          href="#reading-room"
          className="font-heading text-lg text-paper-shade italic underline decoration-brass/50 underline-offset-4 transition-colors hover:text-brass-bright"
        >
          Prefer plain text? Read everything in the reading room ↓
        </a>
      </section>

      <ReadingRoom />

      <footer className="py-12 text-center font-heading text-base text-paper-shade/70 italic">
        {site.name} · {site.role}
      </footer>
    </main>
  );
}
