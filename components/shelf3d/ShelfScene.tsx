"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { useLibrary } from "@/components/library/Library";
import { cameraDistance, FOV, projectPoint, PULL, tiltedCenter } from "@/lib/shelf3d";
import { measureShelf, type ShelfLayout } from "./layout";
import { Book3D, CameraRig, Decor3D, Dust, Lights, ShelfCase, type Pull } from "./parts";

const INTRO_SEEN = "shelf-intro-seen";

type Props = {
  onReady: () => void; // the first frames are drawn: the 3D shelf can be shown
  onLost: () => void; // the GPU dropped the context: go back to the CSS shelf
};

/**
 * The 3D bookshelf. It's built from measurements of the CSS shelf and drawn right over it, with the
 * camera set so the books' fronts line up with the HTML spine buttons. Those buttons stay on top,
 * invisible, and still do all the work: hover, focus, clicks, keyboard and screen readers.
 */
export default function ShelfScene({ onReady, onLost }: Props) {
  const layerRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ShelfLayout | null>(null);
  const [font, setFont] = useState<string | null>(null);
  const [onScreen, setOnScreen] = useState(true);
  const [settings] = useState(() => ({
    // phones and tablets: lighter (lower resolution, smaller shadows, no dust or parallax, draw only on change)
    small: window.matchMedia("(max-width: 639px), (pointer: coarse)").matches,
    intro: !readIntroSeen(),
  }));
  const { away, setSpineProjector } = useLibrary();
  const pulls = useRef(new Map<string, Pull>());

  // Measure the CSS shelf, and again whenever it changes size (the observer also fires straight away).
  useEffect(() => {
    const layer = layerRef.current!;
    const observer = new ResizeObserver(() => setLayout(measureShelf(layer)));
    observer.observe(layer.closest("section")!);
    return () => observer.disconnect();
  }, []);

  // Spine titles are drawn with the page's own Cinzel, once it has loaded.
  useEffect(() => {
    let alive = true;
    const family = getComputedStyle(document.querySelector(".font-display") ?? document.body).fontFamily;
    document.fonts
      .load(`600 32px ${family}`)
      .catch(() => undefined)
      .finally(() => {
        if (alive) setFont(family);
      });
    return () => {
      alive = false;
    };
  }, []);

  // Stop drawing while the shelf is scrolled out of view.
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting));
    observer.observe(layerRef.current!);
    return () => observer.disconnect();
  }, []);

  // Tell the open-book animation where a 3D spine is on screen, pulled out or not, so it takes
  // off from (and lands back on) the 3D book itself.
  useEffect(() => {
    if (!layout) return;
    const distance = cameraDistance(layout.view.height);
    setSpineProjector((bookId) => {
      const book = layout.books.find((b) => b.id === bookId);
      const layer = layerRef.current;
      if (!book || !layer) return null;
      const pull = pulls.current.get(bookId)?.value ?? 0;
      const lean = book.lean * (1 - Math.min(1, Math.max(0, pull)));
      const rect = { ...book.rect, y: book.rect.y - pull * PULL.y };
      const center = projectPoint(tiltedCenter(rect, lean), pull * PULL.z, layout.view, distance);
      const box = layer.getBoundingClientRect();
      return {
        centerX: box.left + center.x,
        centerY: box.top + center.y,
        width: rect.width * center.scale,
        height: rect.height * center.scale,
        rotate: lean,
      };
    });
    return () => setSpineProjector(null);
  }, [layout, setSpineProjector]);

  // Draw every frame while there's something alive to show (dust, candle, parallax); on phones,
  // or while a book is open over the shelf, only draw when something changes.
  const frameloop = !onScreen ? "never" : settings.small || away.length > 0 ? "demand" : "always";

  return (
    <div ref={layerRef} className="absolute inset-0">
      {layout && font && (
        <Canvas
          flat
          shadows="percentage"
          dpr={[1, settings.small ? 1.5 : 2]}
          frameloop={frameloop}
          gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
          camera={{ fov: FOV, position: [0, 0, cameraDistance(layout.view.height)], near: 1, far: 20000 }}
          onCreated={({ gl }) => {
            gl.domElement.addEventListener("webglcontextlost", (event) => {
              event.preventDefault();
              onLost();
            });
          }}
        >
          <Scene layout={layout} font={font} small={settings.small} intro={settings.intro} away={away} pulls={pulls} onReady={onReady} />
        </Canvas>
      )}
    </div>
  );
}

type SceneProps = {
  layout: ShelfLayout;
  font: string;
  small: boolean;
  intro: boolean;
  away: string[];
  pulls: React.RefObject<Map<string, Pull>>;
  onReady: () => void;
};

function Scene({ layout, font, small, intro, away, pulls, onReady }: SceneProps) {
  const active = useActiveBooks();
  const dpr = useThree((state) => state.viewport.dpr);

  return (
    <>
      <CameraRig view={layout.view} parallax={!small} intro={intro} onIntroDone={markIntroSeen} />
      <Lights layout={layout} small={small} />
      <ShelfCase layout={layout} />
      {layout.books.map((book) => (
        <Book3D
          key={book.id}
          data={book}
          layout={layout}
          font={font}
          textureScale={Math.min(4, dpr * 1.5)}
          hidden={away.includes(book.id)}
          active={active}
          pulls={pulls}
        />
      ))}
      {layout.decor.map((item) => (
        <Decor3D key={item.kind} item={item} layout={layout} animate={!small} />
      ))}
      {!small && <Dust layout={layout} count={120} />}
      <ReadySignal onReady={onReady} />
    </>
  );
}

/**
 * Which books are hovered or keyboard-focused, read from the HTML spine buttons on top of the scene.
 * (Touch has no hover; a tap opens the book straight away.)
 */
function useActiveBooks() {
  const gl = useThree((state) => state.gl);
  const invalidate = useThree((state) => state.invalidate);
  const active = useRef(new Set<string>());

  useEffect(() => {
    const section = gl.domElement.closest("section");
    if (!section) return;
    let hovered: string | undefined;
    let focused: string | undefined;
    const bookOf = (target: EventTarget | null) =>
      target instanceof Element ? target.closest<HTMLElement>("[data-book-id]")?.dataset.bookId : undefined;
    const update = () => {
      active.current = new Set([hovered, focused].filter((id): id is string => !!id));
      invalidate();
    };
    const onOver = (event: PointerEvent) => {
      hovered = event.pointerType === "mouse" ? bookOf(event.target) : undefined;
      update();
    };
    const onLeave = () => {
      hovered = undefined;
      update();
    };
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element;
      focused = target.matches(":focus-visible") ? bookOf(target) : undefined;
      update();
    };
    const onFocusOut = () => {
      focused = undefined;
      update();
    };
    section.addEventListener("pointerover", onOver);
    section.addEventListener("pointerleave", onLeave);
    section.addEventListener("focusin", onFocusIn);
    section.addEventListener("focusout", onFocusOut);
    return () => {
      section.removeEventListener("pointerover", onOver);
      section.removeEventListener("pointerleave", onLeave);
      section.removeEventListener("focusin", onFocusIn);
      section.removeEventListener("focusout", onFocusOut);
    };
  }, [gl, invalidate]);

  return active;
}

/** Reports ready once two frames are drawn (the second has the shadows in place). */
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0);
  const invalidate = useThree((state) => state.invalidate);
  // When drawing only on demand (phones, or a book already open from a link), the canvas's first
  // frame can come before this is listening, so ask for one.
  useEffect(() => invalidate(), [invalidate]);
  useFrame(() => {
    frames.current += 1;
    if (frames.current < 2) invalidate();
    else if (frames.current === 2) setTimeout(onReady, 0);
  });
  return null;
}

function readIntroSeen() {
  try {
    return localStorage.getItem(INTRO_SEEN) === "1";
  } catch {
    return false;
  }
}

function markIntroSeen() {
  try {
    localStorage.setItem(INTRO_SEEN, "1");
  } catch {
    // private mode: the intro just plays again next time
  }
}
