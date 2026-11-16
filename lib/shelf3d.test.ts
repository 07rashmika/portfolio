import { describe, expect, it } from "vitest";
import {
  cameraDistance,
  projectPoint,
  seededRandom,
  shouldUse3D,
  springStep,
  tiltedCenter,
  toWorld,
  type DeviceInfo,
} from "./shelf3d";

const view = { width: 900, height: 600 };

describe("cameraDistance", () => {
  it("shows exactly the view height on the plane z = 0", () => {
    const d = cameraDistance(600, 28);
    const visibleHeight = 2 * d * Math.tan((28 * Math.PI) / 360);
    expect(visibleHeight).toBeCloseTo(600);
  });

  it("is further away for taller views", () => {
    expect(cameraDistance(800)).toBeGreaterThan(cameraDistance(400));
  });
});

describe("toWorld", () => {
  it("puts the middle of the view at the origin, with y pointing up", () => {
    expect(toWorld({ x: 400, y: 250, width: 100, height: 100 }, view)).toEqual({ x: 0, y: 0 });
    expect(toWorld({ x: 0, y: 0, width: 100, height: 100 }, view)).toEqual({ x: -400, y: 250 });
  });
});

describe("projectPoint", () => {
  const d = cameraDistance(view.height);

  it("leaves a point on the page plane exactly where it is", () => {
    expect(projectPoint({ x: 100, y: 120 }, 0, view, d)).toEqual({ x: 100, y: 120, scale: 1 });
  });

  it("makes things pulled towards the camera bigger and further from the centre", () => {
    const p = projectPoint({ x: 100, y: 120 }, 30, view, d);
    expect(p.scale).toBeGreaterThan(1);
    expect(p.x).toBeLessThan(100);
    expect(p.y).toBeLessThan(120);
  });

  it("doesn't move the centre of the view", () => {
    const p = projectPoint({ x: 450, y: 300 }, 40, view, d);
    expect(p.x).toBeCloseTo(450);
    expect(p.y).toBeCloseTo(300);
  });
});

describe("tiltedCenter", () => {
  const rect = { x: 100, y: 100, width: 40, height: 200 };

  it("is the plain centre when upright", () => {
    const c = tiltedCenter(rect, 0);
    expect(c.x).toBeCloseTo(120);
    expect(c.y).toBeCloseTo(200);
  });

  it("moves left (and barely down) when the book leans left", () => {
    const c = tiltedCenter(rect, -6);
    expect(c.x).toBeLessThan(120);
    expect(c.x).toBeCloseTo(120 - 100 * Math.sin((6 * Math.PI) / 180), 0);
    expect(Math.abs(c.y - 200)).toBeLessThan(3);
  });

  it("matches CSS: the bottom-left corner stays put", () => {
    // Rotating about the bottom-left keeps the centre at the same distance from that corner.
    const c = tiltedCenter(rect, -6);
    expect(Math.hypot(c.x - 100, c.y - 300)).toBeCloseTo(Math.hypot(20, 100));
  });
});

describe("springStep", () => {
  const settle = (target: number) => {
    let state = { value: 0, velocity: 0 };
    let peak = 0;
    for (let i = 0; i < 240; i++) {
      state = springStep(state, target, 1 / 60);
      peak = Math.max(peak, state.value);
    }
    return { state, peak };
  };

  it("settles on the target", () => {
    expect(settle(1).state.value).toBeCloseTo(1, 3);
  });

  it("overshoots a little, like a spring", () => {
    const { peak } = settle(1);
    expect(peak).toBeGreaterThan(1);
    expect(peak).toBeLessThan(1.15);
  });

  it("stays stable after a very long frame", () => {
    const state = springStep({ value: 0, velocity: 0 }, 1, 5);
    expect(Number.isFinite(state.value)).toBe(true);
    expect(Math.abs(state.value)).toBeLessThan(2);
  });
});

describe("seededRandom", () => {
  it("gives the same sequence for the same seed, between 0 and 1", () => {
    const a = seededRandom(7);
    const b = seededRandom(7);
    const values = Array.from({ length: 50 }, () => a());
    expect(values).toEqual(Array.from({ length: 50 }, () => b()));
    values.forEach((v) => expect(v >= 0 && v < 1).toBe(true));
  });

  it("gives different sequences for different seeds", () => {
    expect(seededRandom(1)()).not.toBe(seededRandom(2)());
  });
});

describe("shouldUse3D", () => {
  const capable: DeviceInfo = {
    reducedMotion: false,
    saveData: false,
    deviceMemory: 8,
    cores: 8,
    webgl: true,
    fastWebgl: true,
    override: null,
  };

  it("uses 3D on a capable device", () => {
    expect(shouldUse3D(capable)).toBe(true);
  });

  it.each<[string, Partial<DeviceInfo>]>([
    ["reduced motion", { reducedMotion: true }],
    ["data saver", { saveData: true }],
    ["very little memory", { deviceMemory: 1 }],
    ["few cores", { cores: 2 }],
    ["software-only WebGL", { fastWebgl: false }],
    ["no WebGL", { webgl: false, fastWebgl: false }],
  ])("falls back to the flat shelf with %s", (_, change) => {
    expect(shouldUse3D({ ...capable, ...change })).toBe(false);
  });

  it("treats unknown memory and cores as fine (not every browser reports them)", () => {
    expect(shouldUse3D({ ...capable, deviceMemory: undefined, cores: undefined })).toBe(true);
  });

  it("can be forced off, or forced on wherever WebGL works at all", () => {
    expect(shouldUse3D({ ...capable, override: "off" })).toBe(false);
    expect(shouldUse3D({ ...capable, reducedMotion: true, fastWebgl: false, override: "on" })).toBe(true);
    expect(shouldUse3D({ ...capable, webgl: false, fastWebgl: false, override: "on" })).toBe(false);
  });
});
