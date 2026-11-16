"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { getBook } from "@/content/books";
import { PALETTE, SPINE_HEX } from "@/lib/palette";
import { cameraDistance, FOV, PULL, seededRandom, springStep, toWorld, type Rect, type Size } from "@/lib/shelf3d";
import type { BookLayout, DecorLayout, ShelfLayout } from "./layout";
import { dustTexture, pagesTexture, spineTexture, woodTexture } from "./textures";

const DEG = Math.PI / 180;
const LIP = 10; // how far the planks stand out in front of the books
const WOOD_SCALE = 1 / 360; // world-space wood textures repeat every 360px

export type Pull = { value: number; velocity: number };

/** World position of a rect's bottom-left corner (x right, y up, origin at the middle of the view). */
function bottomLeft(rect: Rect, view: Size) {
  return { x: rect.x - view.width / 2, y: view.height / 2 - (rect.y + rect.height) };
}

/** Frees GPU memory held by textures, materials and geometries once they're replaced or removed. */
function useDispose(items: { dispose(): void }[]) {
  useEffect(() => () => items.forEach((item) => item.dispose()), [items]);
}

function worldWood(base: string, grain: string, seed: number) {
  const texture = woodTexture(base, grain, seed);
  texture.repeat.set(WOOD_SCALE, WOOD_SCALE);
  return texture;
}

// ── The case ────────────────────────────────────────────────────

/** The bookcase: a frame with an opening per shelf, back panels, planks, crown and plinth. */
export function ShelfCase({ layout }: { layout: ShelfLayout }) {
  const { view, frame, backs, planks, crown, plinth, depth } = layout;

  const textures = useMemo(
    () => [
      worldWood(PALETTE.woodDark, PALETTE.woodGrain, 1),
      worldWood(PALETTE.woodDarkest, PALETTE.woodMid, 2),
      woodTexture(PALETTE.woodLight, PALETTE.woodGrain, 3, true),
      woodTexture(PALETTE.woodDarkest, PALETTE.woodMid, 4, true),
    ],
    [],
  );
  const materials = useMemo(
    () => ({
      frame: new THREE.MeshStandardMaterial({ map: textures[0], roughness: 0.85 }),
      back: new THREE.MeshStandardMaterial({ map: textures[1], roughness: 0.9 }),
      plank: new THREE.MeshStandardMaterial({ map: textures[2], roughness: 0.8 }),
      trim: new THREE.MeshStandardMaterial({ map: textures[3], roughness: 0.85 }),
    }),
    [textures],
  );
  useDispose(textures);
  useDispose(useMemo(() => Object.values(materials), [materials]));

  // The frame's front face with a hole for each shelf, pushed back to the case's depth.
  // Shape and extrude UVs are in world units, which is why the frame's wood repeats by WOOD_SCALE.
  const geometries = useMemo(() => {
    const outline = (path: THREE.Path, rect: Rect) => {
      const { x, y } = bottomLeft(rect, view);
      path.moveTo(x, y);
      path.lineTo(x + rect.width, y);
      path.lineTo(x + rect.width, y + rect.height);
      path.lineTo(x, y + rect.height);
      path.closePath();
    };
    const shape = new THREE.Shape();
    outline(shape, frame);
    shape.holes = backs.map((back) => {
      const hole = new THREE.Path();
      outline(hole, back);
      return hole;
    });
    const case_ = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false });
    case_.translate(0, 0, -depth);

    const panels = backs.map((back) => {
      const panel = new THREE.Shape();
      outline(panel, back);
      const geometry = new THREE.ShapeGeometry(panel);
      geometry.translate(0, 0, -depth + 0.5);
      return geometry;
    });
    return { case_, panels };
  }, [view, frame, backs, depth]);
  useDispose(useMemo(() => [geometries.case_, ...geometries.panels], [geometries]));

  const box = (rect: Rect, front: number, material: THREE.Material, key: string) => {
    const { x, y } = toWorld(rect, view);
    return (
      <mesh key={key} position={[x, y, (front - depth) / 2]} material={material} castShadow receiveShadow>
        <boxGeometry args={[rect.width, rect.height, depth + front]} />
      </mesh>
    );
  };

  return (
    <group>
      <mesh geometry={geometries.case_} material={materials.frame} castShadow receiveShadow />
      {geometries.panels.map((geometry, i) => (
        <mesh key={i} geometry={geometry} material={materials.back} receiveShadow />
      ))}
      {planks.map((plank, i) => box(plank, LIP, materials.plank, `plank-${i}`))}
      {box(crown, LIP + 6, materials.trim, "crown")}
      {box(plinth, LIP + 6, materials.trim, "plinth")}
    </group>
  );
}

// ── Books ───────────────────────────────────────────────────────

type BookProps = {
  data: BookLayout;
  layout: ShelfLayout;
  font: string;
  textureScale: number;
  hidden: boolean; // off the shelf, open
  active: React.RefObject<Set<string>>; // hovered or focused books
  pulls: React.RefObject<Map<string, Pull>>; // shared with the hand-off to the open book
};

/**
 * A book standing in its slot, its spine exactly where the HTML button is. When hovered or focused
 * it springs out towards you (and a leaning book straightens up).
 */
export function Book3D({ data, layout, font, textureScale, hidden, active, pulls }: BookProps) {
  const book = getBook(data.id);
  const { rect, lean } = data;
  const color = book ? SPINE_HEX[book.spineColor] : PALETTE.woodMid;
  const title = book?.title ?? "";
  const depth = Math.min(rect.height * 0.72, layout.depth - 6);
  const group = useRef<THREE.Group>(null);
  const invalidate = useThree((state) => state.invalidate);

  const materials = useMemo(() => {
    const side = new THREE.MeshStandardMaterial({ color, roughness: 0.7 });
    const pages = new THREE.MeshStandardMaterial({ map: pagesTexture(color), roughness: 0.9 });
    const spine = new THREE.MeshStandardMaterial({
      map: spineTexture(title, color, rect.width, rect.height, textureScale, font),
      roughness: 0.6,
    });
    // box faces: right, left, top, bottom, front (the spine), back
    return [side, side, pages, pages, spine, side];
  }, [color, title, rect.width, rect.height, textureScale, font]);
  useEffect(
    () => () => {
      for (const material of new Set(materials)) {
        material.map?.dispose();
        material.dispose();
      }
    },
    [materials],
  );

  const base = bottomLeft(rect, layout.view);

  useFrame((_, delta) => {
    const g = group.current;
    if (!g) return;
    const target = active.current.has(data.id) ? 1 : 0;
    const next = springStep(pulls.current.get(data.id) ?? { value: 0, velocity: 0 }, target, delta);
    const settled = Math.abs(next.value - target) < 0.001 && Math.abs(next.velocity) < 0.001;
    const pull = settled ? target : next.value;
    pulls.current.set(data.id, settled ? { value: target, velocity: 0 } : next);

    g.position.set(base.x, base.y + pull * PULL.y, pull * PULL.z);
    g.rotation.z = -lean * DEG * (1 - Math.min(1, Math.max(0, pull)));
    if (!settled) invalidate();
  });

  return (
    // Pivots on the bottom-left corner, like the CSS spine, so a leaning book tilts the same way.
    <group ref={group} position={[base.x, base.y, 0]} rotation={[0, 0, -lean * DEG]} visible={!hidden}>
      <mesh position={[rect.width / 2, rect.height / 2, -depth / 2]} material={materials} castShadow receiveShadow>
        <boxGeometry args={[rect.width, rect.height, depth]} />
      </mesh>
    </group>
  );
}

// ── Decorations ─────────────────────────────────────────────────

type DecorProps = { item: DecorLayout; layout: ShelfLayout; animate: boolean };

export function Decor3D(props: DecorProps) {
  switch (props.item.kind) {
    case "plant":
      return <Plant3D {...props} />;
    case "candle":
      return <Candle3D {...props} />;
    case "book-stack":
      return <BookStack3D {...props} />;
  }
}

/** Bottom-centre of a decoration, set a little back from the front of the shelf. */
function decorBase(rect: Rect, layout: ShelfLayout, depthShare: number): [number, number, number] {
  const { x, y } = bottomLeft(rect, layout.view);
  return [x + rect.width / 2, y, -layout.depth * depthShare];
}

// angle, length (share of the plant's height), twist
const LEAVES: [number, number, number][] = [
  [-0.8, 0.42, 0.3],
  [-0.4, 0.56, -0.2],
  [0.02, 0.68, 0.1],
  [0.38, 0.54, -0.3],
  [0.78, 0.4, 0.25],
];

function Plant3D({ item, layout, animate }: DecorProps) {
  const { width: w, height: h } = item.rect;
  const leaves = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    if (animate && leaves.current) leaves.current.rotation.z = Math.sin(clock.elapsedTime * 0.8) * 0.025;
  });

  return (
    <group position={decorBase(item.rect, layout, 0.42)}>
      <mesh position={[0, h * 0.15, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[w * 0.3, w * 0.21, h * 0.3, 24]} />
        <meshStandardMaterial color="#8a4b2a" roughness={0.8} />
      </mesh>
      <mesh position={[0, h * 0.3, 0]} castShadow>
        <cylinderGeometry args={[w * 0.34, w * 0.34, h * 0.06, 24]} />
        <meshStandardMaterial color="#a35d35" roughness={0.75} />
      </mesh>
      <group ref={leaves} position={[0, h * 0.32, 0]}>
        {LEAVES.map(([angle, length, twist], i) => (
          <group key={i} rotation={[twist, 0, angle]}>
            <mesh position={[0, (length * h) / 2, 0]} scale={[w * 0.09, (length * h) / 2, w * 0.035]} castShadow>
              <sphereGeometry args={[1, 12, 10]} />
              <meshStandardMaterial color={i % 2 ? "#3d5a2e" : "#4f6b3a"} roughness={0.6} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// With decay 1 the light fades with distance (and stops at `distance`), so it only warms its neighbours.
const CANDLE_LIGHT = 140;

function Candle3D({ item, layout, animate }: DecorProps) {
  const { width: w, height: h } = item.rect;
  const flame = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  // Bright enough to warm the books beside it, fading out across the shelf.
  const reach = Math.max(w, h) * 3.2;

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const flicker = animate ? 1 + Math.sin(t * 9.1) * 0.06 + Math.sin(t * 15.7 + 1) * 0.04 + Math.sin(t * 3.3) * 0.05 : 1;
    if (light.current) light.current.intensity = CANDLE_LIGHT * flicker;
    if (flame.current) flame.current.scale.set(w * 0.075 * (2 - flicker), h * 0.1 * flicker, w * 0.075);
  });

  return (
    <group position={decorBase(item.rect, layout, 0.35)}>
      <mesh position={[0, h * 0.02, 0]} receiveShadow>
        <cylinderGeometry args={[w * 0.42, w * 0.44, h * 0.04, 28]} />
        <meshStandardMaterial color={PALETTE.brass} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, h * 0.065, 0]}>
        <cylinderGeometry args={[w * 0.25, w * 0.25, h * 0.05, 20]} />
        <meshStandardMaterial color={PALETTE.brass} metalness={0.7} roughness={0.35} />
      </mesh>
      <mesh position={[0, h * 0.33, 0]} castShadow>
        <cylinderGeometry args={[w * 0.17, w * 0.17, h * 0.48, 20]} />
        <meshStandardMaterial color="#efe3c4" roughness={0.55} emissive="#3a2610" />
      </mesh>
      <mesh ref={flame} position={[0, h * 0.64, 0]} scale={[w * 0.075, h * 0.1, w * 0.075]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshBasicMaterial color="#ffd27a" />
      </mesh>
      <pointLight
        ref={light}
        position={[0, h * 0.7, 6]}
        color="#ffb35c"
        intensity={CANDLE_LIGHT}
        distance={reach}
        decay={1}
      />
    </group>
  );
}

// The lying books, as in the SVG: [top, left, width] in its 88 × 39 drawing, and colour.
const STACK: [number, number, number, keyof typeof SPINE_HEX][] = [
  [0, 8, 70, "teal"],
  [13, 2, 82, "oxblood"],
  [26, 5, 76, "navy"],
];

function BookStack3D({ item, layout }: DecorProps) {
  const { width: w, height: h } = item.rect;
  const layer = h / 3;
  const depth = Math.min(w * 0.62, layout.depth - 6);
  return (
    <group position={decorBase(item.rect, layout, 0)}>
      {STACK.map(([top, left, width, color]) => (
        <mesh
          key={color}
          position={[((left + width / 2) / 88 - 0.5) * w, h - ((top + 6.5) / 39) * h, -depth / 2 - 2]}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[(width / 88) * w, layer * 0.96, depth]} />
          <meshStandardMaterial color={SPINE_HEX[color]} roughness={0.7} />
        </mesh>
      ))}
    </group>
  );
}

// ── Atmosphere ──────────────────────────────────────────────────

/** Specks of dust drifting slowly through the lamp light. */
export function Dust({ layout, count }: { layout: ShelfLayout; count: number }) {
  const { view, depth } = layout;
  const sprite = useMemo(() => dustTexture(), []);
  const { geometry, specks } = useMemo(() => {
    const random = seededRandom(11);
    const specks = Array.from({ length: count }, () => ({
      x: (random() * 0.65 - 0.5) * view.width,
      y: (random() * 0.75 - 0.25) * view.height,
      z: -depth + random() * depth * 1.4,
      phase: random() * Math.PI * 2,
      speed: 4 + random() * 8,
    }));
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    return { geometry, specks };
  }, [view, depth, count]);
  useDispose(useMemo(() => [sprite, geometry], [sprite, geometry]));

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const rise = view.height * 0.75;
    const position = geometry.getAttribute("position") as THREE.BufferAttribute;
    specks.forEach((speck, i) => {
      const y = ((speck.y + view.height * 0.25 + t * speck.speed) % rise) - view.height * 0.25;
      position.setXYZ(i, speck.x + Math.sin(t * 0.3 + speck.phase) * 14, y, speck.z);
    });
    position.needsUpdate = true;
  });

  return (
    <points geometry={geometry}>
      <pointsMaterial
        map={sprite}
        color="#ffe2b8"
        size={5}
        transparent
        opacity={0.5}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/** A warm lamp up and to the left (it casts the shadows), a dim fill from the right, and soft room light. */
export function Lights({ layout, small }: { layout: ShelfLayout; small: boolean }) {
  const { view, depth } = layout;
  const distance = cameraDistance(view.height);
  const target = useMemo(() => new THREE.Object3D(), []);
  const mapSize = small ? 1024 : 2048;

  return (
    <>
      {/* Room light: warm from above, and bounced off the wood from below so undersides aren't black. */}
      <hemisphereLight args={["#ffe9cc", PALETTE.woodMid, 1.5]} />
      <ambientLight color="#ffdcb0" intensity={0.35} />
      <spotLight
        position={[-view.width * 0.55, view.height * 0.8, distance * 0.5]}
        target={target}
        color="#ffd9a0"
        intensity={4.5}
        decay={0}
        angle={0.62}
        penumbra={0.9}
        castShadow
        shadow-mapSize={[mapSize, mapSize]}
        shadow-bias={-0.0004}
        shadow-camera-near={distance * 0.1}
        shadow-camera-far={distance * 3}
      />
      <primitive object={target} position={[view.width * 0.05, -view.height * 0.1, -depth]} />
      <directionalLight position={[view.width * 0.7, view.height * 0.1, distance]} color="#ffcfa0" intensity={0.5} />
    </>
  );
}

const INTRO_SECONDS = 1.4;

type CameraProps = { view: Size; parallax: boolean; intro: boolean; onIntroDone: () => void };

/**
 * Keeps the camera where the plane z = 0 matches the page. On a first visit it starts a little
 * further back and lower and settles in; with a mouse, it leans slightly with the pointer.
 */
export function CameraRig({ view, parallax, intro, onIntroDone }: CameraProps) {
  const invalidate = useThree((state) => state.invalidate);
  const pointer = useRef({ x: 0, y: 0 });
  const smooth = useRef({ x: 0, y: 0 });
  const frames = useRef(0);
  const introTime = useRef(0);
  const introDone = useRef(!intro);

  useEffect(() => {
    if (!parallax) return;
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      pointer.current = { x: (event.clientX / window.innerWidth) * 2 - 1, y: (event.clientY / window.innerHeight) * 2 - 1 };
      invalidate();
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, [parallax, invalidate]);

  useFrame((state, delta) => {
    const camera = state.camera as THREE.PerspectiveCamera;
    const distance = cameraDistance(view.height);
    let progress = 1;
    if (!introDone.current) {
      // Counted in drawn frames, each at most 1/30 s, starting once the shelf is on screen: a slow
      // first frame (compiling shaders) mustn't use up the move before anyone sees it.
      frames.current += 1;
      if (frames.current > 2) introTime.current += Math.min(delta, 1 / 30);
      progress = Math.min(1, introTime.current / INTRO_SECONDS);
      if (progress >= 1) {
        introDone.current = true;
        onIntroDone();
      }
    }
    const remaining = Math.pow(1 - progress, 3); // how much of the move is left, easing out

    const follow = Math.min(1, delta * 3);
    smooth.current.x += (pointer.current.x - smooth.current.x) * follow;
    smooth.current.y += (pointer.current.y - smooth.current.y) * follow;

    camera.position.set(
      smooth.current.x * distance * 0.03,
      -smooth.current.y * distance * 0.02 - remaining * view.height * 0.12,
      distance * (1 + 0.14 * remaining),
    );
    camera.lookAt(0, -remaining * view.height * 0.04, 0);
    camera.fov = FOV;
    camera.near = distance * 0.05;
    camera.far = distance * 6;
    camera.updateProjectionMatrix();

    const following =
      Math.abs(pointer.current.x - smooth.current.x) > 0.0005 || Math.abs(pointer.current.y - smooth.current.y) > 0.0005;
    if (!introDone.current || following) invalidate();
  });

  return null;
}
