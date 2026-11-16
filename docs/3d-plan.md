# 3D effects with Three.js — plan and status

Phase 6 of the build plan (see `README.md` §4.7 for how the finished 3D shelf works).

## Where 3D is used, and where it isn't

| Area | 3D? | Why |
|---|---|---|
| **The bookshelf (first screen)** | **Yes** | Real depth, wood, lamp light and shadows, books with thickness you can pull off the shelf. |
| **Taking a book off the shelf** | **Yes** | The book slides out of its slot in 3D, then the existing HTML open-book flight takes off from exactly where it is. |
| **Atmosphere** | **Yes, subtle** | Dust in the lamplight, a candle that lights its neighbours, a swaying plant, mouse parallax, first-visit camera move. |
| Background behind the open book (desk) | Maybe later | Lots of work for something people barely look at. |
| **The open book and page turns** | **No** | WebGL pages would turn text into textures: blurrier, not selectable, links and screen readers lost. The CSS 3D page turns already look physical. |
| Reading room, nav bar, link previews | No | These exist for clarity, speed and search engines. |

## Principles

1. **The CSS shelf stays.** It's what the server sends, what shows while 3D loads, and what every device that can't do 3D gets.
2. **The HTML spine buttons stay the accessible, clickable layer.** In 3D mode they're invisible and sit on top of the canvas; the scene only draws.
3. **Lazy-loaded.** Three.js + React Three Fiber load with `next/dynamic({ ssr: false })` after the page is interactive (~240 KB gzipped, separate chunk; the page's own JS grew ~2 KB).
4. **Seamless hand-off.** The scene registers a "spine projector" with `Library`, so the open-book flight starts from (and lands on) the 3D book.
5. **Data-driven.** The 3D scene is built from measurements of the CSS shelf, so `content/shelf.ts` and the CSS layout stay the single source of truth.

## Decisions made

- **Phones get 3D too**, in a lighter mode (lower resolution, smaller shadows, no dust or parallax, redraw only on change). Devices that can't handle it get the flat CSS shelf.
- **First-visit camera move:** yes, short (~1.4 s), only once (`localStorage` "shelf-intro-seen").
- **No `@react-three/drei`:** spine titles are drawn on canvases with the page's own Cinzel instead, to keep the chunk smaller.
- **three is pinned to 0.182.** 0.183+ logs a deprecation warning for `THREE.Clock`, which React Three Fiber 9.8 still uses. Bump three when a React Three Fiber release moves to `THREE.Timer`.

## Steps and status

- [x] **6.1 Groundwork:** dependencies; `lib/shelf3d.ts` (camera distance, projection, tilt, spring, seeded random, `shouldUse3D`) with tests; `Shelf3D` loader that decides 3D or CSS and crossfades.
- [x] **6.2 Static 3D shelf:** case with openings, back panels, planks, crown, plinth; books with leather, gold bands, titles and page-edge tops; plant, candle, book stack; lamp + fill + room light with soft shadows; camera aligned so z = 0 matches the page.
- [x] **6.3 Interaction:** hover / keyboard focus springs a book out (a leaning book straightens); subtitle plaque and focus ring come from the HTML buttons.
- [x] **6.4 Hand-off:** `Library.setSpineProjector`; the 3D book hides while away and reappears when the flight lands.
- [x] **6.5 Atmosphere:** dust, candle flicker, plant sway, mouse parallax, first-visit camera move (timed by drawn frames so a slow first frame can't skip it).
- [x] **6.6 Performance & safety:** draws only when needed on phones / behind an open book, pauses off screen; falls back to CSS on software or missing WebGL, reduced motion, data saver, low memory/cores, lost WebGL context or any error.
- [x] **6.7 Verification & docs:** unit tests; headless Chrome checks of 3D, fallbacks, hand-off, keyboard, deep links, context loss and page turning; README §4.7.

## Open items / ideas

- **Reduced motion currently means no 3D at all.** Option discussed with the owner but not decided: give reduced-motion users a *still* 3D shelf (depth, lighting, shadows; no camera move, parallax, dust or flicker; books step out instantly).
- **First-frame cost.** The first frame compiles shaders and draws shadow maps, which briefly blocks the main thread (≈15 s under software rendering in tests; a fraction of a second on a real GPU). `renderer.compileAsync()` before the first frame could smooth this.
- **Plant shadow** falls on the right inner wall of the top shelf; physically right, possibly odd-looking. Moving the plant forward or excluding it from casting would change that.
- **Desk under the open book** (see table above) if it ever seems worth it.

## How to see and test it

In the browser console, then reload:

```js
localStorage.setItem("shelf-3d", "on");      // force the 3D shelf (wherever WebGL works)
localStorage.setItem("shelf-3d", "off");     // force the CSS shelf
localStorage.removeItem("shelf-3d");         // automatic
localStorage.removeItem("shelf-intro-seen"); // replay the first-visit camera move
```

GNOME's "reduce animations" (`enable-animations false`) makes Chrome report `prefers-reduced-motion`, which turns 3D off automatically.

Headless Chrome only has software WebGL, which the site deliberately treats as "too slow"; browser checks therefore force 3D on with the override above and launch Chrome with `--use-angle=swiftshader --enable-unsafe-swiftshader`. Delete the temporary Chrome profile after each run (the SSD is nearly full).
