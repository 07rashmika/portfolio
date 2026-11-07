"use client";

import { useCallback, useMemo, useState } from "react";
import { lastPosition, pageAt, paginate, positionOf, toLeaves } from "@/lib/paginate";
import type { Book } from "@/types/book";

/**
 * Which page of a book is open. The page (not the position) is the state, so switching between
 * spread and single-page mode keeps you on the same page.
 */
export function useBookPages(
  book: Book,
  spread: boolean,
  initialPageIndex: number,
  onPageChange: (pageIndex: number) => void,
) {
  const pages = useMemo(() => paginate(book), [book]);
  const leaves = useMemo(() => toLeaves(pages, spread), [pages, spread]);
  const [pageIndex, setPageIndex] = useState(initialPageIndex);

  const last = lastPosition(leaves);
  const position = Math.min(positionOf(leaves, pageIndex), last);

  const turnTo = useCallback(
    (target: number) => {
      const next = Math.max(0, Math.min(last, target));
      const page = pageAt(leaves, next);
      if (!page || next === position) return;
      setPageIndex(page.index);
      onPageChange(page.index);
    },
    [leaves, last, position, onPageChange],
  );

  const jumpTo = useCallback((index: number) => turnTo(positionOf(leaves, index)), [leaves, turnTo]);

  const totalPages = useMemo(() => Math.max(...pages.map((page) => ("number" in page ? page.number : 0))), [pages]);

  return { leaves, position, last, totalPages, turnTo, jumpTo };
}
