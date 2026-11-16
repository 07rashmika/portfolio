import type { DecorKind } from "@/content/shelf";
import type { Rect, Size } from "@/lib/shelf3d";

export type BookLayout = { id: string; rect: Rect; lean: number }; // lean in CSS degrees (negative = left)
export type DecorLayout = { kind: DecorKind; rect: Rect };

/** The CSS shelf, measured: every part's box relative to the 3D layer's top-left corner. */
export type ShelfLayout = {
  view: Size;
  frame: Rect;
  crown: Rect;
  plinth: Rect;
  backs: Rect[]; // the openings of each shelf row
  planks: Rect[];
  books: BookLayout[];
  decor: DecorLayout[];
  depth: number; // how deep the case is, from the front of the books to the back panel
};

/**
 * Measures the CSS shelf (components/library/Bookshelf.tsx marks its parts with data-shelf) so the
 * 3D shelf can be built to match it exactly. Returns null if the shelf isn't laid out yet.
 */
export function measureShelf(layer: HTMLElement): ShelfLayout | null {
  const section = layer.closest("section");
  if (!section) return null;
  const box = layer.getBoundingClientRect();
  if (box.width === 0 || box.height === 0) return null;

  const relative = (r: DOMRect): Rect => ({ x: r.left - box.left, y: r.top - box.top, width: r.width, height: r.height });
  const part = (name: string) => {
    const el = section.querySelector(`[data-shelf="${name}"]`);
    return el ? relative(el.getBoundingClientRect()) : null;
  };
  const parts = (name: string) =>
    [...section.querySelectorAll(`[data-shelf="${name}"]`)].map((el) => relative(el.getBoundingClientRect()));

  const frame = part("frame");
  const crown = part("crown");
  const plinth = part("plinth");
  if (!frame || !crown || !plinth) return null;

  const books = [...section.querySelectorAll<HTMLElement>("[data-book-id]")].map((button) => {
    // A leaning book's button is tilted, so measure its list item instead (never tilted):
    // the button sits at the item's bottom-right.
    const slot = relative(button.parentElement!.getBoundingClientRect());
    const width = button.offsetWidth;
    const height = button.offsetHeight;
    return {
      id: button.dataset.bookId!,
      rect: { x: slot.x + slot.width - width, y: slot.y + slot.height - height, width, height },
      lean: parseFloat(button.style.getPropertyValue("--lean")) || 0,
    };
  });

  const decor = [...section.querySelectorAll<HTMLElement>("[data-decor]")].flatMap((slot) => {
    const rect = slot.querySelector("svg")?.getBoundingClientRect();
    // hidden decorations (the book stack on phones) have no size
    return rect && rect.width > 0 ? [{ kind: slot.dataset.decor as DecorKind, rect: relative(rect) }] : [];
  });

  const tallest = Math.max(1, ...books.map((book) => book.rect.height));

  return {
    view: { width: box.width, height: box.height },
    frame,
    crown,
    plinth,
    backs: parts("back"),
    planks: parts("plank"),
    books,
    decor,
    depth: Math.max(60, tallest * 0.62),
  };
}
