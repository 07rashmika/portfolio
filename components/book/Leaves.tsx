"use client";

import { animate, motion, motionValue, useTransform, type MotionValue, type Transition } from "motion/react";
import { useEffect, useImperativeHandle, useMemo, useRef } from "react";
import type { Leaf as LeafData } from "@/lib/paginate";
import { PageContent } from "./pages/PageContent";

// Leaves are a fraction of a pixel apart, so the browser knows which one is on top.
const GAP = 0.4;
const PAGE_TURN: Transition = { duration: 0.7, ease: [0.4, 0, 0.2, 1] };
const RIFFLE: Transition = { duration: 0.5, ease: [0.4, 0, 0.2, 1] }; // each leaf when jumping several
const RIFFLE_STAGGER = 0.08;
const SNAP_BACK: Transition = { duration: 0.35, ease: "easeOut" };

// Dragging this far (as a share of the page width) turns a leaf the whole way over.
const DRAG_SPAN = 1.2;
const DRAG_THRESHOLD = 6; // px before a press counts as a drag rather than a click
const COMMIT_PROGRESS = 0.3; // let go past this and the turn completes
const FLICK_SPEED = 0.4; // px/ms; a quick flick completes the turn from anywhere

export type LeavesHandle = {
  /** Swing every turned leaf back to the right, alongside the cover as the book closes. */
  closeAll: (transition: Transition) => void;
};

type Props = {
  leaves: LeafData[];
  position: number; // how many leaves are turned
  lastPosition: number;
  spread: boolean;
  thickness: number;
  interactive: boolean;
  reduceMotion: boolean;
  bookTitle: string;
  onTurnTo: (position: number) => void;
  onJump: (pageIndex: number) => void;
  onClose: () => void;
  ref?: React.Ref<LeavesHandle>;
};

type Drag = {
  pointerId: number;
  startX: number;
  lastX: number;
  lastTime: number;
  velocity: number;
  leaf: number | null; // null until the pointer has moved far enough to pick a direction; -1: nothing to turn
  forward: boolean;
};

/**
 * The pages of the open book, as physical leaves hinged on the spine. Turning is driven by one
 * angle per leaf (0 = lying on the right, -180 = turned over onto the left).
 */
export function Leaves({
  leaves,
  position,
  lastPosition,
  spread,
  thickness,
  interactive,
  reduceMotion,
  bookTitle,
  onTurnTo,
  onJump,
  onClose,
  ref,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const drag = useRef<Drag | null>(null);

  // One angle per leaf, starting where the book currently is. Rebuilt only when the leaves change
  // (switching between spread and single-page mode); after that, turns animate them.
  const angles = useMemo(
    () => leaves.map((_, k) => motionValue(k < position ? -180 : 0)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [leaves],
  );

  // Where each leaf is heading, so a turn only animates the leaves whose destination changed.
  const targets = useRef<number[]>([]);
  useEffect(() => {
    targets.current = angles.map((angle) => angle.get());
  }, [angles]);

  useEffect(() => {
    const next = angles.map((_, k) => (k < position ? -180 : 0));
    const moving = next.map((_, k) => k).filter((k) => next[k] !== targets.current[k]);
    targets.current = next;
    // Turn in reading order: forwards from the first leaf, backwards from the last.
    if (moving.length > 0 && next[moving[0]] === 0) moving.reverse();

    moving.forEach((k, i) => {
      if (reduceMotion) angles[k].set(next[k]);
      else if (moving.length === 1) animate(angles[k], next[k], PAGE_TURN);
      else animate(angles[k], next[k], { ...RIFFLE, delay: i * RIFFLE_STAGGER });
    });
  }, [position, angles, reduceMotion]);

  useImperativeHandle(
    ref,
    () => ({
      closeAll: (transition) => {
        angles.forEach((angle) => {
          if (angle.get() !== 0) animate(angle, 0, transition);
        });
      },
    }),
    [angles],
  );

  // ── Pointer: click a side to turn, or drag / swipe the page over ──

  const turnFrom = (forward: boolean) => onTurnTo(forward ? position + 1 : position - 1);

  const angleFor = (d: Drag, dx: number) => {
    const span = (wrapperRef.current?.offsetWidth ?? 1) * DRAG_SPAN;
    const delta = (dx / span) * 180;
    return Math.max(-180, Math.min(0, d.forward ? delta : -180 + delta));
  };

  const onPointerDown = (event: React.PointerEvent) => {
    if (!interactive || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("a, button")) return; // let links and buttons work
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      lastX: event.clientX,
      lastTime: event.timeStamp,
      velocity: 0,
      leaf: null,
      forward: true,
    };
  };

  const onPointerMove = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    const dx = event.clientX - d.startX;

    if (d.leaf === null) {
      if (Math.abs(dx) < DRAG_THRESHOLD) return;
      d.forward = dx < 0; // pulling the page leftwards turns forwards
      const leaf = d.forward ? position : position - 1;
      const canTurn = d.forward ? position < lastPosition : position > 0;
      d.leaf = canTurn ? leaf : -1;
      wrapperRef.current?.setPointerCapture(event.pointerId);
    }

    const elapsed = event.timeStamp - d.lastTime;
    if (elapsed > 0) d.velocity = (event.clientX - d.lastX) / elapsed;
    d.lastX = event.clientX;
    d.lastTime = event.timeStamp;

    if (d.leaf >= 0) angles[d.leaf].set(angleFor(d, dx));
  };

  const onPointerUp = (event: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.pointerId !== event.pointerId) return;
    drag.current = null;

    if (d.leaf === null) {
      // A click: the left page (or the left edge of a single page) goes back, anything else goes on.
      const rect = wrapperRef.current!.getBoundingClientRect();
      const backZone = spread ? rect.left : rect.left + rect.width * 0.3;
      turnFrom(event.clientX >= backZone);
      return;
    }
    if (d.leaf < 0) return;

    const angle = angles[d.leaf].get();
    const progress = d.forward ? -angle / 180 : (angle + 180) / 180;
    const flicked = d.forward ? d.velocity < -FLICK_SPEED : d.velocity > FLICK_SPEED;
    if (progress > COMMIT_PROGRESS || (flicked && progress > 0.03)) turnFrom(d.forward);
    else animate(angles[d.leaf], targets.current[d.leaf], SNAP_BACK);
  };

  const onPointerCancel = () => {
    const d = drag.current;
    drag.current = null;
    if (d && d.leaf !== null && d.leaf >= 0) animate(angles[d.leaf], targets.current[d.leaf], SNAP_BACK);
  };

  // Page edges on each side thicken or thin as you read.
  const edge = (count: number) => Math.min(7, count * 0.8);

  return (
    <div
      ref={wrapperRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerCancel}
      className={`book-box absolute top-[1.2%] right-[1.5%] bottom-[1.2%] left-0 touch-none select-none ${interactive ? "cursor-pointer" : ""}`}
    >
      {/* inside of the back cover, under the last leaf */}
      <div
        aria-hidden
        className="book-face endpaper-back absolute inset-0 rounded-r-sm"
        style={{ transform: `translateZ(${thickness - (leaves.length + 1) * GAP - 0.5}px)` }}
      />
      <div
        aria-hidden
        className="page-edges absolute inset-y-0 left-full transition-[width] duration-500"
        style={{ width: edge(leaves.length - position), transform: `translateZ(${thickness - 0.5}px)` }}
      />
      <div
        aria-hidden
        className="page-edges absolute inset-y-0 transition-[width] duration-500"
        style={{
          width: edge(position),
          right: "200%",
          transform: `translateZ(${thickness + 0.5}px)`,
          // it would stay behind, flat, while the left pile swings shut with the cover
          display: spread && interactive ? undefined : "none",
        }}
      />

      {leaves.map((leaf, k) => (
        <Leaf
          key={leaf.front?.index ?? k}
          leaf={leaf}
          index={k}
          angle={angles[k]}
          thickness={thickness}
          frontVisible={k === position}
          backVisible={k === position - 1}
          bookTitle={bookTitle}
          onJump={onJump}
          onClose={onClose}
        />
      ))}
    </div>
  );
}

type LeafProps = {
  leaf: LeafData;
  index: number;
  angle: MotionValue<number>;
  thickness: number;
  frontVisible: boolean;
  backVisible: boolean;
  bookTitle: string;
  onJump: (pageIndex: number) => void;
  onClose: () => void;
};

function Leaf({ leaf, index, angle, thickness, frontVisible, backVisible, bookTitle, onJump, onClose }: LeafProps) {
  // Lying on the right the first leaf is on top; lying on the left the last one turned is on top.
  // In between, the leaf moves from one height to the other.
  const z = useTransform(angle, (a) => thickness + (index + 1) * GAP * (2 * (-a / 180) - 1));
  // Lit from above: a page darkens as it lifts towards upright, and lightens again as it lands.
  const frontShade = useTransform(angle, [0, -90], [0, 1]);
  const backShade = useTransform(angle, [-90, -180], [1, 0]);

  const pageProps = { bookTitle, onJump, onClose };

  return (
    <motion.div className="book-box absolute inset-0" style={{ z, rotateY: angle, originX: 0 }}>
      {/* Pages that aren't showing are inert: no tabbing into them, and screen readers skip them. */}
      <div className="book-face paper page-right absolute inset-0 overflow-hidden rounded-r-sm" inert={!frontVisible}>
        {leaf.front && <PageContent page={leaf.front} {...pageProps} />}
        <motion.div aria-hidden className="page-shade page-shade-front" style={{ opacity: frontShade }} />
      </div>
      <div
        className="book-face paper page-left absolute inset-0 overflow-hidden rounded-l-sm"
        style={{ transform: "rotateY(180deg)" }}
        inert={!backVisible}
      >
        {leaf.back && <PageContent page={leaf.back} {...pageProps} />}
        <motion.div aria-hidden className="page-shade page-shade-back" style={{ opacity: backShade }} />
      </div>
    </motion.div>
  );
}
