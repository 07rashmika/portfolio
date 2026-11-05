import { Bookshelf } from "@/components/library/Bookshelf";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-8 px-4 py-10 sm:py-14">
      <header className="text-center">
        <h1 className="font-display text-3xl tracking-widest text-brass sm:text-5xl">The Bookshelf</h1>
        <p className="mt-2 font-heading text-lg italic text-paper-shade sm:text-xl">Pick a book and turn its pages.</p>
      </header>

      <Bookshelf />
    </main>
  );
}
