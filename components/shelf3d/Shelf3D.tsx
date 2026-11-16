"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { shouldUse3D } from "@/lib/shelf3d";

// three.js is large, so the scene loads separately, after the page (and its CSS shelf) is usable.
const ShelfScene = dynamic(() => import("./ShelfScene"), { ssr: false });

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

let webgl: { webgl: boolean; fastWebgl: boolean } | null = null;

// Renderers that draw on the CPU: they work, but far too slowly for a 3D scene.
const SOFTWARE_RENDERER = /swiftshader|llvmpipe|softpipe|software|basic render|mesa offscreen/i;

/** Whether WebGL 2 works, and whether it's fast (a real GPU, not a software fallback). Checked once. */
function probeWebgl() {
  if (webgl) return webgl;
  const test = (options: WebGLContextAttributes) => {
    try {
      const gl = document.createElement("canvas").getContext("webgl2", options);
      if (!gl) return { works: false, software: false };
      const info = gl.getExtension("WEBGL_debug_renderer_info");
      const renderer = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
      gl.getExtension("WEBGL_lose_context")?.loseContext(); // give the test context straight back
      return { works: true, software: SOFTWARE_RENDERER.test(renderer) };
    } catch {
      return { works: false, software: false };
    }
  };
  // Browsers flag a software fallback as a "major performance caveat", but not always (for example
  // when software rendering was asked for), so the renderer's name is checked as well.
  const fast = test({ failIfMajorPerformanceCaveat: true });
  webgl = { webgl: fast.works || test({}).works, fastWebgl: fast.works && !fast.software };
  return webgl;
}

function readOverride() {
  try {
    return localStorage.getItem("shelf-3d");
  } catch {
    return null;
  }
}

function canShow3D() {
  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const override = readOverride();
  const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
  // Don't even create a test WebGL context when the answer is already no.
  if (override === "off" || (override !== "on" && reducedMotion)) return false;
  return shouldUse3D({
    reducedMotion,
    saveData: !!nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    cores: nav.hardwareConcurrency,
    ...probeWebgl(),
    override,
  });
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/**
 * The 3D shelf, on devices that can handle it. It fades in over the CSS shelf once drawn; until then,
 * and on every other device (no fast WebGL, reduced motion, data saver, low memory), the CSS shelf is
 * what you see. If anything goes wrong in 3D, it quietly goes back to the CSS shelf.
 */
export function Shelf3D() {
  const capable = useSyncExternalStore(subscribe, canShow3D, () => false);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const layerRef = useRef<HTMLDivElement>(null);
  const active = capable && !failed;

  // Once the 3D shelf is drawn, the CSS shelf steps back (see [data-shelf-3d] in globals.css):
  // its spines become invisible buttons over the 3D books.
  useEffect(() => {
    const section = layerRef.current?.closest("section");
    if (!section || !active || !ready) return;
    section.setAttribute("data-shelf-3d", "");
    return () => section.removeAttribute("data-shelf-3d");
  }, [active, ready]);

  if (!active) return null;

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="shelf-3d-layer pointer-events-none absolute inset-y-0 -inset-x-2"
      style={{ opacity: ready ? 1 : 0 }}
    >
      <SceneBoundary onError={() => setFailed(true)}>
        <ShelfScene onReady={() => setReady(true)} onLost={() => setFailed(true)} />
      </SceneBoundary>
    </div>
  );
}

/** Anything that throws while loading or drawing the 3D shelf sends us back to the CSS shelf. */
class SceneBoundary extends Component<{ onError: () => void; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch() {
    this.props.onError();
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}
