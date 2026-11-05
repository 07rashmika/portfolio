import { describe, expect, it } from "vitest";
import {
  bookSize,
  bookThickness,
  closedPose,
  gutter,
  openPose,
  shelfPose,
  TOP_BAR,
  type Viewport,
} from "./bookLayout";

const viewports: Record<string, Viewport> = {
  desktop: { width: 1440, height: 900 },
  laptop: { width: 1280, height: 720 },
  tablet: { width: 768, height: 1024 },
  phone: { width: 390, height: 844 },
  "phone landscape": { width: 844, height: 390 },
  "small phone": { width: 320, height: 568 },
};

describe("bookSize", () => {
  it("shows a two-page spread on desktop and tablet", () => {
    expect(bookSize(viewports.desktop).spread).toBe(true);
    expect(bookSize(viewports.tablet).spread).toBe(true);
  });

  it("shows a single page on phones", () => {
    expect(bookSize(viewports.phone).spread).toBe(false);
    expect(bookSize(viewports["phone landscape"]).spread).toBe(false);
  });

  it("caps the height on large screens", () => {
    expect(bookSize({ width: 2560, height: 1440 }).height).toBe(680);
  });

  describe.each(Object.entries(viewports))("%s", (_, viewport) => {
    const size = bookSize(viewport);
    const g = gutter(viewport);

    it("keeps the cover's proportions", () => {
      expect(size.width / size.height).toBeCloseTo(0.7, 1);
    });

    it("fits below the top bar", () => {
      const { y } = closedPose(viewport, size);
      expect(y).toBeGreaterThanOrEqual(TOP_BAR + g - 1);
      expect(y + size.height).toBeLessThanOrEqual(viewport.height - g + 1);
    });

    it("fits the open pages inside the gutters", () => {
      const { x } = openPose(viewport, size);
      const left = size.spread ? x - size.width : x; // a spread's left page lies left of the spine
      expect(left).toBeGreaterThanOrEqual(g - 1);
      expect(x + size.width).toBeLessThanOrEqual(viewport.width - g + 1);
    });
  });
});

describe("poses", () => {
  const viewport = viewports.desktop;
  const size = bookSize(viewport);

  it("centres the closed book, on whole pixels", () => {
    const { x, y } = closedPose(viewport, size);
    expect(Math.abs(x + size.width / 2 - viewport.width / 2)).toBeLessThanOrEqual(0.5);
    expect(Number.isInteger(x) && Number.isInteger(y)).toBe(true);
  });

  it("centres an open spread on the spine", () => {
    expect(Math.abs(openPose(viewport, size).x - viewport.width / 2)).toBeLessThanOrEqual(0.5);
  });

  it("doesn't move a single-page book when it opens", () => {
    const phone = viewports.phone;
    const phoneSize = bookSize(phone);
    expect(openPose(phone, phoneSize)).toEqual(closedPose(phone, phoneSize));
  });

  it("starts spine-out, over the shelf spine, at the shelf spine's size", () => {
    const spine = { centerX: 500, centerY: 400, width: 54, height: 216, rotate: -6 };
    const pose = shelfPose(spine, size);
    expect(pose.rotateY).toBe(90);
    expect(pose.rotate).toBe(-6);
    expect(pose.x).toBe(500);
    expect(pose.y + size.height / 2).toBe(400);
    expect(pose.scale * size.height).toBeCloseTo(216);
    // the full-size spine, scaled down, is exactly as thick as the shelf spine
    expect(bookThickness(spine, size) * pose.scale).toBeCloseTo(54);
  });
});
