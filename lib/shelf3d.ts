// Maths for the 3D shelf. The scene is laid out from the real (CSS) shelf on the page: one world
// unit is one CSS pixel, and the camera is placed so that the plane z = 0 lines up exactly with
// the page. The front of every book sits on that plane, right behind its (invisible) HTML button.

export type Rect = { x: number; y: number; width: number; height: number }; // CSS px, from the scene's top-left
export type Size = { width: number; height: number };

export const FOV = 28; // vertical field of view, degrees: narrow, so the shelf isn't distorted

/** A hovered or focused book slides this far out of its slot (towards you), and up a little. */
export const PULL = { z: 26, y: 5 };

/** How far the camera must be for the plane z = 0 to show `viewHeight` px exactly. */
export function cameraDistance(viewHeight: number, fov = FOV): number {
  return viewHeight / 2 / Math.tan((fov * Math.PI) / 360);
}

/** The centre of a rect in world units: x right, y up, origin at the middle of the view. */
export function toWorld(rect: Rect, view: Size): { x: number; y: number } {
  return {
    x: rect.x + rect.width / 2 - view.width / 2,
    y: view.height / 2 - (rect.y + rect.height / 2),
  };
}

/**
 * Where a point at depth z (positive = towards the camera) appears on screen, in view px, and how
 * much things there are scaled. Closer things look bigger and further from the centre.
 */
export function projectPoint(
  point: { x: number; y: number },
  z: number,
  view: Size,
  distance: number,
): { x: number; y: number; scale: number } {
  const scale = distance / (distance - z);
  return {
    x: view.width / 2 + (point.x - view.width / 2) * scale,
    y: view.height / 2 + (point.y - view.height / 2) * scale,
    scale,
  };
}

/**
 * The centre of a rect tilted by `degrees` about its bottom-left corner, like a leaning book on the
 * shelf. Uses the CSS sign: negative leans the top to the left. Screen y points down.
 */
export function tiltedCenter(rect: Rect, degrees: number): { x: number; y: number } {
  const a = (degrees * Math.PI) / 180;
  const dx = rect.width / 2;
  const dy = -rect.height / 2;
  return {
    x: rect.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: rect.y + rect.height + dx * Math.sin(a) + dy * Math.cos(a),
  };
}

/** One step of a spring towards `target`: a quick pull with a slight overshoot, like the CSS version. */
export function springStep(
  state: { value: number; velocity: number },
  target: number,
  dt: number,
  stiffness = 220,
  damping = 20,
): { value: number; velocity: number } {
  const step = Math.min(dt, 1 / 30); // a long frame (tab was hidden) mustn't make it explode
  const velocity = state.velocity + (stiffness * (target - state.value) - damping * state.velocity) * step;
  return { value: state.value + velocity * step, velocity };
}

/** A small seeded random number generator, so generated textures and dust look the same every time. */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export type DeviceInfo = {
  reducedMotion: boolean;
  saveData: boolean;
  deviceMemory?: number; // GB, where the browser reports it
  cores?: number;
  webgl: boolean; // WebGL 2 works at all
  fastWebgl: boolean; // ...without a "major performance caveat" (i.e. not software rendering)
  override: string | null; // localStorage "shelf-3d": "on" or "off"
};

/**
 * Whether to show the 3D shelf. Everything else gets the CSS shelf, which looks and works the same,
 * just flatter. "on"/"off" in localStorage forces it either way (for testing, or by choice).
 */
export function shouldUse3D(device: DeviceInfo): boolean {
  if (device.override === "off") return false;
  if (device.override === "on") return device.webgl;
  if (device.reducedMotion || device.saveData) return false;
  if (device.deviceMemory !== undefined && device.deviceMemory < 2) return false;
  if (device.cores !== undefined && device.cores < 4) return false;
  return device.fastWebgl;
}
