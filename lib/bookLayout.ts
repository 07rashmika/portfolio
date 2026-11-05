// Geometry for the open-book overlay. All values are in CSS px, relative to the viewport.

export const TOP_BAR = 56; // room above the book for the "Return to shelf" button
const COVER_RATIO = 0.7; // cover width / height
const MAX_HEIGHT = 680;
const MIN_SPREAD_PAGE_WIDTH = 260; // narrower than this and pages become hard to read, so show one page

export type Viewport = { width: number; height: number };
export type BookSize = { width: number; height: number; spread: boolean };

// Where the spine stands on the shelf: its centre, its unrotated size, and its tilt.
export type SpineBox = { centerX: number; centerY: number; width: number; height: number; rotate: number };

// A transform for the book box. Its origin is the middle of the spine (left edge, half height),
// so x/y say where the spine's centre is and rotateY turns the book around its spine.
export type Pose = { x: number; y: number; scale: number; rotate: number; rotateY: number };

export function gutter(viewport: Viewport): number {
  return viewport.width < 640 ? 16 : 32;
}

/** The largest book that fits: as a two-page spread if the pages stay readable, otherwise one page. */
export function bookSize(viewport: Viewport): BookSize {
  const g = gutter(viewport);
  const maxHeight = Math.min(MAX_HEIGHT, viewport.height - TOP_BAR - 2 * g);

  const fit = (maxWidth: number) => {
    const height = Math.floor(Math.min(maxHeight, maxWidth / COVER_RATIO));
    return { width: Math.floor(height * COVER_RATIO), height };
  };

  const spread = fit((viewport.width - 2 * g) / 2);
  if (spread.width >= MIN_SPREAD_PAGE_WIDTH) return { ...spread, spread: true };
  return { ...fit(viewport.width - 2 * g), spread: false };
}

/** Spine thickness at full size, keeping the shelf spine's proportions so the hand-off is seamless. */
export function bookThickness(spine: Pick<SpineBox, "width" | "height"> | null, size: BookSize): number {
  return spine ? (spine.width / spine.height) * size.height : size.width * 0.12;
}

/** Turned spine-out and shrunk to sit exactly over the book on the shelf. */
export function shelfPose(spine: SpineBox, size: BookSize): Pose {
  return {
    x: spine.centerX,
    y: spine.centerY - size.height / 2,
    scale: spine.height / size.height,
    rotate: spine.rotate,
    rotateY: 90,
  };
}

/** Closed, cover facing the viewer, centred below the top bar. Whole pixels keep the text sharp. */
export function closedPose(viewport: Viewport, size: BookSize): Pose {
  return {
    x: Math.round((viewport.width - size.width) / 2),
    y: Math.round(TOP_BAR + (viewport.height - TOP_BAR - size.height) / 2),
    scale: 1,
    rotate: 0,
    rotateY: 0,
  };
}

/**
 * Cover open. A two-page spread moves right by half a page so both pages are centred;
 * in single-page mode the book stays put and the open cover swings off-screen to the left.
 */
export function openPose(viewport: Viewport, size: BookSize): Pose {
  const closed = closedPose(viewport, size);
  return size.spread ? { ...closed, x: Math.round(viewport.width / 2) } : closed;
}
