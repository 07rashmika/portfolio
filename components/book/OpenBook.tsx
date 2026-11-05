"use client";

import { motion, useAnimate, usePresence, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  bookSize,
  bookThickness,
  closedPose,
  openPose,
  shelfPose,
  type SpineBox,
  type Viewport,
} from "@/lib/bookLayout";
import { paginate, type BookPage } from "@/lib/paginate";
import type { Book } from "@/types/book";
import { CoverFace } from "./CoverFace";
import { SpineFace } from "./SpineFace";
import { TableOfContents } from "./TableOfContents";

const FLY = { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as const; // shelf ↔ centre, turning as it goes
const TURN = { duration: 0.55, ease: [0.45, 0, 0.25, 1] } as const; // the cover swinging open or shut

type Props = {
  book: Book;
  measureSpine: () => SpineBox | null;
  onDepart: () => void; // the book has left the shelf: hide its spine
  onReturn: () => void; // the book is back in its slot: show its spine
  onRequestClose: () => void;
};

const readViewport = (): Viewport => ({ width: window.innerWidth, height: window.innerHeight });
const isToc = (page: BookPage) => page.kind === "toc";

/**
 * The open book: a 3D box (spine, page block, front cover) that flies from its slot on the shelf
 * to the centre, turns to face the viewer, and opens its cover. Closing plays it in reverse.
 */
export function OpenBook({ book, measureSpine, onDepart, onReturn, onRequestClose }: Props) {
  const reduceMotion = useReducedMotion();
  const [isPresent, safeToRemove] = usePresence();
  const [dialogRef, animate] = useAnimate<HTMLDialogElement>();
  const backdropRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const leftShadowRef = useRef<HTMLDivElement>(null); // under the left page of a spread
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);

  const [viewport, setViewport] = useState(readViewport);
  const [startSpine] = useState(measureSpine); // where the book was taken from
  const size = bookSize(viewport);
  const thickness = bookThickness(startSpine, size);
  const animated = !reduceMotion && startSpine !== null;

  const toc = useMemo(() => paginate(book).find(isToc), [book]);

  // Open: fly out, turn, open the cover.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    onDepart();

    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";

    if (animated) {
      animate([
        [backdropRef.current!, { opacity: [0, 1] }, { duration: 0.4 }],
        [boxRef.current!, closedPose(viewport, size), { ...FLY, at: 0 }],
        [coverRef.current!, { rotateY: -180 }, TURN],
        [boxRef.current!, { x: openPose(viewport, size).x }, { ...TURN, at: "<" }],
        // only once the cover is nearly flat and hides the plane itself
        [leftShadowRef.current!, { opacity: 1 }, { duration: 0.2, at: `<+${TURN.duration - 0.2}` }],
        [closeButtonRef.current!, { opacity: [0, 1] }, { duration: 0.3, at: "<" }],
      ]);
    } else {
      animate(dialog, { opacity: [0, 1] }, { duration: 0.2 });
    }

    return () => {
      root.style.overflow = overflow;
    };
    // Runs once, when the book is taken off the shelf.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close: shut the cover, fly back, then let AnimatePresence remove the overlay.
  useEffect(() => {
    if (isPresent) return;
    closingRef.current = true;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal(); // the browser may have closed it already (repeated Esc)

    const spine = animated ? measureSpine() : null; // re-measure: the window may have changed
    const done = spine
      ? animate([
          [closeButtonRef.current!, { opacity: 0 }, { duration: 0.2 }],
          [coverRef.current!, { rotateY: 0 }, { ...TURN, at: 0 }],
          [boxRef.current!, { x: closedPose(viewport, size).x }, { ...TURN, at: "<" }],
          [leftShadowRef.current!, { opacity: 0 }, { duration: 0.15, at: "<" }],
          [boxRef.current!, shelfPose(spine, size), FLY],
          [backdropRef.current!, { opacity: 0 }, { duration: 0.45, at: "<" }],
        ])
      : animate(dialog, { opacity: 0 }, { duration: 0.2 });

    done.then(() => {
      onReturn();
      dialog.close(); // un-inert the page so the spine can take focus
      safeToRemove();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent]);

  // Keep the open book centred if the window is resized.
  useEffect(() => {
    const onResize = () => {
      if (closingRef.current) return;
      const next = readViewport();
      setViewport(next);
      animate(boxRef.current!, openPose(next, bookSize(next)), { duration: 0 });
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [animate]);

  return (
    <dialog
      ref={dialogRef}
      aria-label={book.title}
      onCancel={(event) => {
        event.preventDefault(); // Esc: animate closed instead of vanishing
        onRequestClose();
      }}
      onClose={() => {
        if (!closingRef.current) onRequestClose();
      }}
      className="fixed inset-0 m-0 h-dvh max-h-none w-dvw max-w-none overflow-hidden bg-transparent p-0 text-ink backdrop:bg-transparent"
    >
      <div
        ref={backdropRef}
        aria-hidden
        onClick={onRequestClose}
        className="absolute inset-0 bg-wood-darkest/75 backdrop-blur-[3px]"
        style={{ opacity: animated ? 0 : 1 }}
      />

      <div className="pointer-events-none absolute inset-0 [perspective:2400px]">
        <motion.div
          ref={boxRef}
          className="book-box pointer-events-auto absolute top-0 left-0"
          style={{ width: size.width, height: size.height, originX: 0, originY: 0.5, originZ: thickness / 2 }}
          initial={animated && startSpine ? shelfPose(startSpine, size) : openPose(viewport, size)}
        >
          {/* Shadows sit on flat planes at the back of the book. On the moving faces they
              confuse the browser's 3D sorting and the pages show through the opening cover. */}
          <div aria-hidden className="book-shadow absolute inset-0 rounded-r-md bg-wood-darkest" />
          <motion.div
            ref={leftShadowRef}
            aria-hidden
            className={`book-shadow absolute inset-y-0 right-full w-full rounded-l-md bg-wood-darkest ${size.spread ? "" : "hidden"}`}
            initial={{ opacity: animated ? 0 : 1 }}
          />

          {/* spine: the box's left side, facing outwards */}
          <div
            className="book-face absolute top-0 left-0"
            style={{
              width: thickness,
              height: size.height,
              transformOrigin: "left center",
              transform: "rotateY(-90deg)",
              backgroundColor: `var(--spine-${book.spineColor})`,
            }}
          >
            <SpineFace book={book} />
          </div>

          {/* page block, just under the front cover; shows the first right-hand page */}
          <div
            className="book-face paper page-right absolute top-[1.2%] right-[1.5%] bottom-[1.2%] left-0 rounded-r-sm"
            style={{ transform: `translateZ(${thickness - 1}px)` }}
          >
            {toc && <TableOfContents page={toc} />}
          </div>

          {/* front cover, hinged on the spine */}
          <motion.div
            ref={coverRef}
            className="book-box absolute inset-0"
            style={{ z: thickness, originX: 0 }}
            initial={{ rotateY: animated ? 0 : -180 }}
          >
            <div className="book-face absolute inset-0 rounded-r-md">
              <CoverFace book={book} />
            </div>
            <div className="book-face endpaper absolute inset-0 rounded-l-md" style={{ transform: "rotateY(180deg)" }} />
          </motion.div>
        </motion.div>
      </div>

      <button
        ref={closeButtonRef}
        type="button"
        onClick={onRequestClose}
        style={{ opacity: animated ? 0 : 1 }}
        className="absolute top-3 right-4 z-10 cursor-pointer rounded-full border border-brass/50 bg-wood-darkest/85 px-4 py-1.5 font-heading text-lg text-brass-bright transition-colors hover:border-brass hover:text-paper"
      >
        ← Return to shelf
      </button>
    </dialog>
  );
}
