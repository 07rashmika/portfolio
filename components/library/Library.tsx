"use client";

import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { createContext, Suspense, useCallback, useContext, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { getBook } from "@/content/books";
import type { SpineBox } from "@/lib/bookLayout";
import type { Book } from "@/types/book";

// The open book and its animations load separately, after the page is interactive, so the
// shelf doesn't wait for them. Nothing is lost: until a book is opened the overlay renders nothing.
const BookOverlay = dynamic(() => import("@/components/book/BookOverlay"), { ssr: false });

type Spine = { element: HTMLElement; rotate: number };

type LibraryContextValue = {
  /** Books that are off the shelf (open, or flying back); their spines are hidden. */
  away: string[];
  open: (book: Book) => void;
  registerSpine: (bookId: string, element: HTMLElement, rotate: number) => () => void;
};

const LibraryContext = createContext<LibraryContextValue | null>(null);

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) throw new Error("useLibrary must be used inside <Library>");
  return context;
}

/**
 * Owns which book is open. The URL is the source of truth (?book=<id>), so links are shareable
 * and the back button closes the book. The shelf is passed in as children so it stays a Server Component.
 */
export function Library({ children }: { children: React.ReactNode }) {
  const spines = useRef(new Map<string, Spine>());
  const openedFromShelf = useRef(false);
  const [away, setAway] = useState<string[]>([]);

  const registerSpine = useCallback((bookId: string, element: HTMLElement, rotate: number) => {
    spines.current.set(bookId, { element, rotate });
    return () => {
      spines.current.delete(bookId);
    };
  }, []);

  const open = useCallback((book: Book) => {
    openedFromShelf.current = true;
    window.history.pushState(null, "", `?book=${book.id}`);
  }, []);

  // Page turns replace the URL rather than adding history entries, so Back still closes the book.
  const showPage = useCallback((bookId: string, pageIndex: number) => {
    const query = pageIndex > 1 ? `?book=${bookId}&page=${pageIndex}` : `?book=${bookId}`;
    window.history.replaceState(null, "", query);
  }, []);

  const close = useCallback(() => {
    if (openedFromShelf.current) {
      // We added the history entry, so going back removes it instead of piling up entries.
      openedFromShelf.current = false;
      window.history.back();
    } else {
      // Arrived on a deep link: there may be no shelf entry to go back to.
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const measureSpine = useCallback((bookId: string): SpineBox | null => {
    const spine = spines.current.get(bookId);
    if (!spine) return null;
    // The bounding box is rotated for a leaning book, but its centre is still the spine's centre.
    const rect = spine.element.getBoundingClientRect();
    return {
      centerX: rect.left + rect.width / 2,
      centerY: rect.top + rect.height / 2,
      width: spine.element.offsetWidth,
      height: spine.element.offsetHeight,
      rotate: spine.rotate,
    };
  }, []);

  const depart = useCallback((bookId: string) => setAway((ids) => [...ids, bookId]), []);

  const returnToShelf = useCallback((bookId: string) => {
    // Show the spine in the same frame the flying book lands on it, so nothing flickers.
    flushSync(() => setAway((ids) => ids.filter((id) => id !== bookId)));
    // Then give it focus so keyboard users continue where they were. This waits a frame because
    // the page behind the dialog is inert (unfocusable) until OpenBook has closed it.
    requestAnimationFrame(() => spines.current.get(bookId)?.element.focus({ preventScroll: true }));
  }, []);

  const value = useMemo(() => ({ away, open, registerSpine }), [away, open, registerSpine]);

  return (
    <LibraryContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <OpenBookFromUrl
          measureSpine={measureSpine}
          onDepart={depart}
          onReturn={returnToShelf}
          onPageChange={showPage}
          onRequestClose={close}
        />
      </Suspense>
    </LibraryContext.Provider>
  );
}

type OpenBookFromUrlProps = {
  measureSpine: (bookId: string) => SpineBox | null;
  onDepart: (bookId: string) => void;
  onReturn: (bookId: string) => void;
  onPageChange: (bookId: string, pageIndex: number) => void;
  onRequestClose: () => void;
};

// Reads ?book= and ?page= in its own Suspense boundary so the rest of the page can be prerendered.
function OpenBookFromUrl({ measureSpine, onDepart, onReturn, onPageChange, onRequestClose }: OpenBookFromUrlProps) {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("book");
  const book = bookId ? getBook(bookId) : undefined; // unknown ids just show the shelf
  // Only read when the book opens; after that the book keeps the URL up to date itself.
  const page = Number(searchParams.get("page"));
  const initialPageIndex = Number.isInteger(page) && page > 0 ? page : 1;

  return (
    <BookOverlay
      book={book}
      initialPageIndex={initialPageIndex}
      measureSpine={measureSpine}
      onDepart={onDepart}
      onReturn={onReturn}
      onPageChange={onPageChange}
      onRequestClose={onRequestClose}
    />
  );
}
