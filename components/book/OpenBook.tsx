"use client";

import {
  motion,
  useAnimate,
  useMotionValue,
  usePresence,
  useReducedMotion,
  type MotionValue,
  type Transition,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  bookSize,
  bookThickness,
  closedPose,
  openPose,
  shelfPose,
  type Pose,
  type SpineBox,
  type Viewport,
} from "@/lib/bookLayout";
import type { Book } from "@/types/book";
import { BookNav } from "./BookNav";
import { CoverFace } from "./CoverFace";
import { Leaves, type LeavesHandle } from "./Leaves";
import { SpineFace } from "./SpineFace";
import { useBookPages } from "./useBookPages";

const FLY = { duration: 0.6, ease: [0.22, 1, 0.36, 1] } as const; // shelf ↔ centre, turning as it goes
const TURN = { duration: 0.55, ease: [0.45, 0, 0.25, 1] } as const; // the cover swinging open or shut

type Props = {
  book: Book;
  initialPageIndex: number;
  measureSpine: () => SpineBox | null;
  onDepart: () => void; // the book has left the shelf: hide its spine
  onReturn: () => void; // the book is back in its slot: show its spine
  onPageChange: (pageIndex: number) => void;
  onRequestClose: () => void;
};

const readViewport = (): Viewport => ({ width: window.innerWidth, height: window.innerHeight });

type PoseValues = { [K in keyof Pose]: MotionValue<number> };

function usePoseValues(initial: Pose): PoseValues {
  return {
    x: useMotionValue(initial.x),
    y: useMotionValue(initial.y),
    scale: useMotionValue(initial.scale),
    rotate: useMotionValue(initial.rotate),
    rotateY: useMotionValue(initial.rotateY),
  };
}

/**
 * The open book: a 3D box (spine, leaves, front cover) that flies from its slot on the shelf
 * to the centre, turns to face the viewer, and opens its cover. Closing plays it in reverse.
 */
export function OpenBook({
  book,
  initialPageIndex,
  measureSpine,
  onDepart,
  onReturn,
  onPageChange,
  onRequestClose,
}: Props) {
  const reduceMotion = useReducedMotion() ?? false;
  const [isPresent, safeToRemove] = usePresence();
  const [dialogRef, animate] = useAnimate<HTMLDialogElement>();
  const backdropRef = useRef<HTMLDivElement>(null);
  const leftShadowRef = useRef<HTMLDivElement>(null); // under the left page of a spread
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const leavesRef = useRef<LeavesHandle>(null);
  const closingRef = useRef(false);

  const [viewport, setViewport] = useState(readViewport);
  const [startSpine] = useState(measureSpine); // where the book was taken from
  const size = bookSize(viewport);
  const thickness = bookThickness(startSpine, size);
  const animated = !reduceMotion && startSpine !== null;

  const { leaves, position, last, totalPages, turnTo, jumpTo } = useBookPages(
    book,
    size.spread,
    initialPageIndex,
    onPageChange,
  );
  // Everything that moves in 3D is driven by motion values, so the box, cover and leaves update
  // together on every frame. (Animating the elements directly hands the box and cover to the
  // browser's own animation engine, out of step with the leaves, and Chrome then sorts the 3D
  // layers wrongly: the pages show through the cover as the book lands on the shelf.)
  const pose = usePoseValues(animated && startSpine ? shelfPose(startSpine, size) : openPose(viewport, size));
  const coverAngle = useMotionValue(animated ? 0 : -180);
  const movePose = (target: Pose, transition: Transition) =>
    Promise.all((Object.keys(target) as (keyof Pose)[]).map((key) => animate(pose[key], target[key], transition)));

  // Pages can be turned once the cover is open. Until then the book shows its first page, so a
  // deep link to page 7 opens on the contents and then riffles through to page 7.
  const [ready, setReady] = useState(!animated);
  const shownPosition = ready ? position : 0;

  // Open: fly out, turn, open the cover.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal();
    // Start on "Return to shelf", not on whatever comes first inside the book (a contents entry).
    closeButtonRef.current?.focus({ preventScroll: true });
    onDepart();

    const root = document.documentElement;
    const overflow = root.style.overflow;
    root.style.overflow = "hidden";

    if (animated) {
      const open = async () => {
        animate(backdropRef.current!, { opacity: [0, 1] }, { duration: 0.4 });
        await movePose(closedPose(viewport, size), FLY);
        if (closingRef.current) return;

        const lateInTurn = { duration: 0.3, delay: TURN.duration - 0.3 };
        await Promise.all([
          animate(coverAngle, -180, TURN),
          animate(pose.x, openPose(viewport, size).x, TURN),
          // only once the cover is nearly flat and hides the plane itself
          animate(leftShadowRef.current!, { opacity: 1 }, { duration: 0.2, delay: TURN.duration - 0.2 }),
          animate(closeButtonRef.current!, { opacity: [0, 1] }, lateInTurn),
          animate(navRef.current!, { opacity: [0, 1] }, lateInTurn),
        ]);
        if (!closingRef.current) setReady(true);
      };
      open();
    } else {
      animate(dialog, { opacity: [0, 1] }, { duration: 0.2 });
    }

    return () => {
      root.style.overflow = overflow;
    };
    // Runs once, when the book is taken off the shelf.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Close: shut the cover (with the turned pages on it), fly back, then let AnimatePresence remove the overlay.
  useEffect(() => {
    if (isPresent) return;
    closingRef.current = true;
    const dialog = dialogRef.current;
    if (!dialog.open) dialog.showModal(); // the browser may have closed it already (repeated Esc)

    const spine = animated ? measureSpine() : null; // re-measure: the window may have changed
    const close = async () => {
      if (!spine) {
        await animate(dialog, { opacity: 0 }, { duration: 0.2 });
        return;
      }
      animate(closeButtonRef.current!, { opacity: 0 }, { duration: 0.2 });
      animate(navRef.current!, { opacity: 0 }, { duration: 0.2 });
      animate(leftShadowRef.current!, { opacity: 0 }, { duration: 0.15 });
      leavesRef.current?.closeAll(TURN); // the turned pages close with the cover
      await Promise.all([animate(coverAngle, 0, TURN), animate(pose.x, closedPose(viewport, size).x, TURN)]);

      animate(backdropRef.current!, { opacity: 0 }, { duration: 0.45 });
      await movePose(shelfPose(spine, size), FLY);
    };

    close().then(() => {
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
      const target = openPose(next, bookSize(next));
      (Object.keys(target) as (keyof Pose)[]).forEach((key) => pose[key].set(target[key]));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // the pose values never change identity
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If the focused element was on a page that has just turned away, that page is now inert and
  // focus has dropped to the body. Move it to the page buttons so keyboard users aren't lost.
  useEffect(() => {
    if (!ready) return;
    const frame = requestAnimationFrame(() => {
      const active = document.activeElement;
      if (active && active !== document.body && !active.closest("[inert]")) return;
      const nav = navRef.current;
      const button =
        nav?.querySelector<HTMLButtonElement>('[aria-label="Next page"]:not(:disabled)') ??
        nav?.querySelector<HTMLButtonElement>('[aria-label="Previous page"]:not(:disabled)');
      button?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [ready, position]);

  // ← and → turn the pages. Listening on the window keeps working when focus was on a page
  // that has just turned away (and so became inert).
  useEffect(() => {
    if (!ready) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (closingRef.current || event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.key === "ArrowRight") turnTo(position + 1);
      else if (event.key === "ArrowLeft") turnTo(position - 1);
      else return;
      event.preventDefault();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [ready, position, turnTo]);

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
          className="book-box pointer-events-auto absolute top-0 left-0"
          style={{
            ...pose,
            width: size.width,
            height: size.height,
            originX: 0,
            originY: 0.5,
            originZ: thickness / 2,
          }}
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

          <Leaves
            ref={leavesRef}
            leaves={leaves}
            position={shownPosition}
            lastPosition={last}
            spread={size.spread}
            thickness={thickness}
            interactive={ready && isPresent}
            reduceMotion={reduceMotion}
            bookTitle={book.title}
            onTurnTo={turnTo}
            onJump={jumpTo}
            onClose={onRequestClose}
          />

          {/* front cover, hinged on the spine */}
          <motion.div
            className="book-box absolute inset-0"
            style={{ z: thickness, originX: 0, rotateY: coverAngle }}
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

      <BookNav
        ref={navRef}
        style={{ opacity: animated ? 0 : 1 }}
        leaves={leaves}
        position={position}
        last={last}
        totalPages={totalPages}
        onTurnTo={turnTo}
        onContents={() => jumpTo(1)}
      />
    </dialog>
  );
}
