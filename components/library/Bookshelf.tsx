import { shelves, type ShelfItem } from "@/content/shelf";
import { BookSpine } from "./BookSpine";
import { Decor } from "./Decor";

export function Bookshelf() {
  return (
    <section aria-label="Bookshelf" className="relative w-full max-w-4xl">
      {/* crown moulding */}
      <div aria-hidden className="wood -mx-2 h-4 rounded-t-sm border-b-2 border-wood-light/40 bg-wood-darkest sm:h-5" />

      <div className="wood bg-wood-dark px-2.5 pb-2.5 shadow-warm sm:px-4 sm:pb-4">
        {shelves.map((row, i) => (
          <Shelf key={i} items={row} />
        ))}
      </div>

      {/* plinth */}
      <div aria-hidden className="wood -mx-2 h-3 rounded-b-sm border-t-2 border-black/30 bg-wood-darkest sm:h-4" />

      {/* warm lamp light from the top-left */}
      <div aria-hidden className="shelf-lamp-light pointer-events-none absolute inset-0" />
    </section>
  );
}

function Shelf({ items }: { items: ShelfItem[] }) {
  return (
    <div className="pt-2.5 sm:pt-4">
      {/* Scrolls sideways on narrow screens if the books don't fit, so the top padding leaves room for
          the hover lift. On desktop nothing is clipped, so the space above the books can scale with them. */}
      <ul className="wood shelf-back flex items-end gap-1.5 overflow-x-auto bg-wood-darkest px-2 pt-14 lg:overflow-visible lg:px-4 lg:pt-[calc(var(--book-max-h)*0.2)]">
        {items.map((item, i) => (
          <ShelfSlot key={item.type === "book" ? item.book.id : `${item.type}-${i}`} item={item} />
        ))}
      </ul>
      {/* plank front edge */}
      <div aria-hidden className="wood relative z-10 h-4 border-t border-wood-grain/50 bg-wood-light shadow-warm sm:h-5" />
    </div>
  );
}

function ShelfSlot({ item }: { item: ShelfItem }) {
  switch (item.type) {
    case "book":
      return (
        <li className="flex shrink-0">
          <BookSpine book={item.book} lean={item.lean} />
        </li>
      );
    case "decor":
      return (
        <li aria-hidden className="flex shrink-0 px-1">
          <Decor kind={item.kind} />
        </li>
      );
    case "space":
      return <li aria-hidden className="min-w-4 flex-1" />;
  }
}
