# The Bookshelf — Portfolio

A single-page portfolio presented as a wooden bookshelf. Each section of the portfolio is a book on the shelf. Clicking a book pulls it off the shelf, opens it in the centre of the screen, and lets the visitor turn its pages. Each page (or group of pages, like a chapter) holds the content for that section.

```
┌──────────────────────────────────────────────────────────────┐
│  ░░░░░░░░░░░░░░░░░░ crown moulding ░░░░░░░░░░░░░░░░░░░░░░░░  │
│  ║ ┃A┃┃P┃ ┃E┃┃S┃  🪴  ┃E┃┃C┃ ┃B┃     🕯️        ┃✉┃         ║  │
│  ║ ┃B┃┃R┃ ┃X┃┃K┃      ┃D┃┃E┃ ┃L┃               ┃C┃         ║  │
│  ║ ┃O┃┃O┃ ┃P┃┃I┃      ┃U┃┃R┃ ┃O┃               ┃O┃         ║  │
│  ║ ┃U┃┃J┃ ┃.┃┃L┃      ┃.┃┃T┃ ┃G┃               ┃N┃         ║  │
│  ╠══════════════════════ shelf plank ══════════════════════╣  │
│  ║        (more books / decor on a second shelf)            ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
└──────────────────────────────────────────────────────────────┘
          click a spine →  book slides out, turns, opens
```

---

## 1. Tech stack

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js 16 (App Router) + TypeScript** | One route (`/`), static export or Vercel, good SEO via server rendering |
| Styling | **Tailwind CSS v4** + CSS variables for the theme | Fast to build; the palette lives in one place (`app/globals.css`) |
| Animation | **Motion** (`motion`, formerly Framer Motion) for the open book; plain CSS on the shelf | The flight, cover and page turns. The open book is loaded separately (`next/dynamic`), so the shelf doesn't wait for the animation library |
| Page turning | **Custom CSS 3D page flip** (`transform-style: preserve-3d`, `rotateY`, `backface-visibility`), driven by Motion | Full control over styling, keyboard and accessibility. Fallback option: `react-pageflip` if you want a realistic curled-corner effect with less work |
| Content | Typed data files (`content/books/*.ts`), MDX later if needed | Adding a project means adding an entry, with no component changes |
| 3D (optional) | **React Three Fiber + drei** (Three.js), lazy-loaded | Only for the optional 3D shelf scene in Phase 6 |
| Fonts | `next/font/google` | Self-hosted, no layout shift |
| Deploy | Vercel | Zero config for Next.js |

> **Next 16 notes.** This project has `cacheComponents` enabled. Any client component that calls `useSearchParams` (the open-book URL state) must be wrapped in `<Suspense>`, or the production build fails. Next ships its own docs in `node_modules/next/dist/docs/`, and those take precedence over older tutorials (see `AGENTS.md`).

### Do you need Three.js?

**Not for the first version.** Everything in the core idea — a shelf, books that slide out and rotate, a book opening, and pages turning — works well with CSS 3D transforms and Motion. That approach is lighter (Three.js plus R3F is about 150 KB+ gzipped), easier to make accessible, renders sharp text, and runs well on phones.

Three.js is worth adding only if you later want any of these:
- a real 3D room you can orbit or parallax (shelf with depth, a lamp casting light, dust particles)
- books with real thickness and lighting as they're pulled out
- a camera move that zooms into the shelf

The plan handles this by building the 2D/CSS-3D version first and treating a 3D scene as an optional enhancement (Phase 6). If you add it, load it with `next/dynamic` (`ssr: false`), and keep the open book as a normal HTML overlay so text stays crisp and selectable.

---

## 2. Theme — "Old Library"

Warm wood, aged paper, brass, and ink. These are defined as CSS variables in `app/globals.css`, so every component (and an optional night mode) uses the same tokens.

### Colour palette

| Token | Hex | Used for |
|---|---|---|
| `--wood-darkest` | `#2B1A10` | Page background behind the shelf, deep shadows |
| `--wood-dark` (walnut) | `#4A2C1A` | Shelf frame, side panels |
| `--wood-mid` (mahogany) | `#6B3F24` | Shelf planks |
| `--wood-light` (oak) | `#9C6B3F` | Plank front edges, highlights |
| `--wood-grain` | `#B8865A` | Grain streaks, hover glow on wood |
| `--paper` | `#F3E9D2` | Book pages |
| `--paper-shade` | `#E4D4B0` | Page gutter shadow, page edges |
| `--ink` | `#2E2118` | Body text on paper (≈13:1 contrast on `--paper`) |
| `--ink-faded` | `#6A5642` | Captions, page numbers, metadata |
| `--brass` | `#C29A4B` | Accents, gold foil on spines, links, focus rings |
| `--brass-bright` | `#E2C17A` | Hover state for brass |

**Book spine colours** (leather/cloth bindings, one per book):

| Book | Colour | Token | Hex |
|---|---|---|---|
| About Me | Oxblood | `--spine-oxblood` | `#6E1F1F` |
| Projects | Forest green | `--spine-forest` | `#2F4A34` |
| Experience | Navy | `--spine-navy` | `#22334D` |
| Skills | Burnt ochre | `--spine-ochre` | `#9A5B1E` |
| Education | Plum | `--spine-plum` | `#4B2A40` |
| Certifications / Awards | Teal | `--spine-teal` | `#1F4A4A` |
| Blog / Notes | Tan leather | `--spine-tan` | `#8A6A45` |
| Contact | Deep red (or a sealed letter instead of a book) | `--spine-red` | `#7A2A20` |

Spine titles use `--brass` to look like gold foil stamping.

### Typography

| Role | Font | Tailwind class |
|---|---|---|
| Spine titles, book covers | **Cinzel** | `font-display` |
| Page headings | **Cormorant Garamond** (500–700) | `font-heading` |
| Body text on pages | **EB Garamond** — comfortable at 17–19px | `font-body` (default) |
| Small labels, code, tech tags | **IBM Plex Mono** — use sparingly | `font-mono` |

### Textures and details
- Wood grain: the `.wood` class layers CSS `repeating-linear-gradient`s. It can be swapped for a tiling WebP texture later.
- Paper: very light noise or a fibre texture at 4–6% opacity. Keep it subtle so text stays readable.
- Lighting: a warm radial gradient (`#FFD9A0` at about 10% opacity) from the top-left, as if from a desk lamp, plus a vignette at the edges. This is already on `body`.
- Shadows should be warm (`rgba(20, 10, 4, 0.5)`), never pure black. Use `shadow-warm`.
- Optional **night mode**: same wood colours, darker overall, and a lamp glow that follows the cursor.

### Tailwind v4 setup

Tailwind v4 has no `tailwind.config.ts`. The tokens are mapped to utilities with `@theme inline` in `app/globals.css`:

```css
@theme inline {
  --color-wood-dark: var(--wood-dark);   /* → bg-wood-dark, text-wood-dark, border-wood-dark */
  --color-paper: var(--paper);           /* → bg-paper */
  --color-brass: var(--brass);           /* → text-brass */
  --color-spine-forest: var(--spine-forest);
  --font-display: var(--font-cinzel), serif;   /* → font-display */
  /* … */
}
```

---

## 3. Books and their content

Each book is made of **chapters**, and each chapter has one or more **pages**. A short project can be one chapter with a single page; a large project can be a chapter that spans several pages.

| Book | Chapters / pages |
|---|---|
| **About Me** | Title page (name, role, photo as a "frontispiece"), short story, values/interests, a "currently reading/building" page |
| **Projects** | Table of contents, then one chapter per project: overview → problem & approach → tech & architecture → screenshots → links/outcome |
| **Experience** | One chapter per role: company, dates, responsibilities, achievements |
| **Skills** | Pages grouped by category (Languages, Frontend, Backend, Tools), shown as an index or glossary |
| **Education** | Degrees, courses, notable coursework |
| **Certifications / Awards** | One per page, with an image of the certificate |
| **Blog / Notes** *(optional)* | Short excerpts with links to full posts |
| **Contact** | Email address and social links (no form) |

Every book also gets:
- a **cover** (title, small emblem)
- an **auto-generated table of contents** whose entries jump to that chapter
- an **end page** ("Finis") with "Return to shelf" and "Back to contents"

### Content model

```ts
// types/book.ts
export type SpineColor = "oxblood" | "forest" | "navy" | "ochre" | "plum" | "teal" | "tan" | "red";

export type Page =
  | { kind: "text"; heading?: string; body: string }            // paragraphs separated by a blank line
  | { kind: "image"; src: string; alt: string; caption?: string }
  | { kind: "project-summary"; title: string; year?: string; summary: string; stack: string[]; links?: Link[] }
  | { kind: "list"; heading: string; items: string[] }
  | { kind: "contact"; heading?: string; email: string; links: Link[] };

export type Chapter = { id: string; title: string; pages: Page[] };

export type Book = {
  id: string;                 // "projects" — also used in the URL
  title: string;
  subtitle?: string;
  spineColor: SpineColor;     // one of the --spine-* theme tokens
  height: number;             // small variation so the shelf doesn't look uniform (0.85–1)
  chapters: Chapter[];
};
```

Spine thickness isn't stored. `spineWidth()` in `lib/shelf.ts` calculates it from the page count (42–72px at full size).

Pages are written as data in `content/books/*.ts`. **`content/shelf.ts`** decides where everything stands: each shelf is a row of books, decorations (`plant`, `candle`, `book-stack`) and `space` (an empty stretch that fills the leftover width), and a book can `lean` against the one on its left. `content/books/index.ts` builds the `books` list from the shelves, so a book can't exist without a place on the shelf. `content/shelf.test.ts` checks that no book is placed twice and that a leaning book has something to lean on.

`lib/paginate.ts` turns a book into pages and spreads:

- **`paginate(book)`** flattens it into cover → table of contents → chapter pages → end page ("Finis", with the way back to the shelf). Each page has an `index` (its position, used by `?page=`) and, apart from the cover and end page, a printed `number`. The table of contents points at each chapter's first page.
- **`toLeaves(pages, spread)`** prints the pages after the cover onto **leaves**, the physical sheets that turn. As a spread, each leaf has a page on its front (a right-hand page) and one on its back (a left-hand page once turned). In single-page mode each page gets its own leaf with a blank back, so every page lands on the right where it can be seen.
- A **position** is how many leaves are turned. `visiblePages()` gives the left and right page at a position (the back of the last turned leaf, the front of the next one), `positionOf()` finds the position for a page, `pageAt()` gives the page to put in the URL, and `lastPosition()` is the furthest you can turn.

`content/books/books.test.ts` checks the content itself (unique, URL-safe ids, no empty chapters, heights in range), so a typo in a book file fails `npm test` instead of breaking the site.

---

## 4. Interaction design and animation

### 4.1 Shelf (idle state)
- Books stand on one or two shelves with small differences in height, thickness and tilt. One book may lean against another.
- Decorations between books (a plant, candle, globe, bookends) make it look like a real shelf. These are decorative and hidden from screen readers.
- **Hover/focus:** the book rises about 14px and grows slightly, with a small springy overshoot (a CSS transition, `.book-spine` in `globals.css`), its gold title brightens, and on desktop a small plaque with the book's subtitle appears above it. With reduced motion, the book only brightens.

### 4.2 Opening a book (≈ 1.15 s total)
The open book is a real 3D box (`components/book/OpenBook.tsx`): a spine face, a page block, and a front cover hinged on the spine. Its transform origin is the middle of the spine, so it turns around its own spine like a book taken off a shelf. All positions come from `lib/bookLayout.ts`.

1. **Fly and turn** (0–600 ms): the box starts turned `rotateY(90°)` and scaled down so its spine sits exactly over the spine on the shelf (same size, same lean), and the shelf spine is hidden. It flies to the centre while turning to `rotateY(0°)`, cover facing the viewer. The background darkens and blurs.
2. **Open cover** (600–1150 ms): the cover swings open on its hinge (`rotateY(0 → -180°)`). On a two-page spread the book also slides right by half a page so both pages end up centred; in single-page mode the cover swings off-screen to the left.

Closing reverses these steps, landing on the spine's current position (re-measured, in case the window changed), and the spine reappears in the same frame. With reduced motion, the book fades in and out instead.

The spine artwork (`SpineFace`) is shared by the shelf and the 3D book and sized in container units, so the hand-off from shelf to flying book is seamless.

### 4.3 Turning pages
`components/book/Leaves.tsx` renders every leaf as a sheet with a front and a back face, hinged on the spine. Each leaf has one angle (0 = lying on the right, −180° = turned over onto the left), which drives:

- **its rotation**, turning around the spine;
- **its height above the pile**: on the right the next leaf is on top, on the left the most recently turned one is, and a turning leaf moves from one height to the other;
- **its shading**: a page darkens as it lifts towards upright and lightens as it lands, as if lit from above.

Ways to turn:

- **Click** the right page to go on, the left page to go back (in single-page mode, the left 30% of the page goes back).
- **Drag or swipe** a page over. Let go past 30% (or flick it) and the turn completes; otherwise it falls back.
- **← / →** keys, and the **‹ ›** buttons below the book.
- **Contents**: the ribbon bookmark below the book, and each entry on the contents page, jump straight to a chapter. Jumping several pages riffles through them one after another.

The bar below the book shows "Pages 4–5 of 7" (announced to screen readers along with the chapter title). The page edges beside each pile thicken or thin as you read. Pages that aren't showing are `inert`, so you can't tab into a page you can't see, and if a turn hides the focused element, focus moves to the page buttons.

A deep link to a later page opens on the contents and then riffles through to that page, because turned pages hanging off a closed, flying book would look wrong. Closing the book swings the turned pages shut together with the cover.

Every page except the contents and the end page gets a running head (the chapter title, or "Chapter II" on a chapter's first page) and a page number. Content that doesn't fit is cut off, so keep pages short and split long content across several pages.

Not built yet: a soft page-rustle sound, muted by default, with a toggle (Phase 5).

### 4.4 Responsive behaviour
| Viewport | Shelf | Open book |
|---|---|---|
| ≥ 1024px | Full bookshelf, two shelves, subtitle plaques on hover | **Two-page spread** |
| 640–1023px | Same shelves, books ~13rem tall, spines at 90% width | Two-page spread, scaled down |
| < 640px | Same shelves, books ~11rem tall, spines at 75% width, the book stack hidden; a shelf scrolls sideways if it ever gets too full | **Single page**, swipe or tap to turn |

Resizing between spread and single-page mode keeps you on the same page.

Sizes come from two CSS variables in `app/globals.css`, `--book-max-h` and `--spine-scale`, which change at each breakpoint.

### 4.5 Accessibility (built in from the start)
- Each book is a `<button>` with `aria-label="Open Projects book"`. The open book is a native modal `<dialog>`, so the browser traps focus and makes the shelf behind it inert. `Esc`, the "Return to shelf" button, clicking the backdrop and the browser back button all close it, and focus returns to the spine.
- Page changes are announced through an `aria-live="polite"` region ("Pages 4–5 of 7 — The Bookshelf Portfolio"). Pages that aren't showing are `inert`.
- `prefers-reduced-motion`: the book fades in and out instead of flying, and pages change instantly instead of turning.
- Text is real HTML, never a canvas or image, so it can be selected, searched, and translated.
- The **Reading room** (`components/ReadingRoom.tsx`), below the shelf on the same page, has every book as plain, selectable text: one collapsible section per book, chapters and pages in order, and an "Open the book" link. It's for visitors who want the information quickly, and since it's rendered on the server, everything is in the page's HTML for search engines too. A "Prefer plain text?" link under the shelf and a skip link (the first thing Tab reaches) lead there.

### 4.6 Single page and URL state
There is one route, `/`, and the open book and page are stored in the query string:

```
/                          → shelf
/?book=projects            → Projects book, open on the contents
/?book=projects&page=7     → Projects book, open on the spread with page 7
```

This makes links shareable, lets the browser back button close the book, and allows deep-linking a specific project in a CV.

`components/library/Library.tsx` owns this. It updates the URL with the browser's own `history.pushState`/`replaceState`, which Next.js keeps in sync with `useSearchParams` without asking the server for the page again:

- **Opening** pushes `?book=<id>`.
- **Closing** goes `history.back()` if the book was opened from the shelf, so history doesn't pile up. On a deep link there may be nothing to go back to, so it replaces the URL with `/` instead.
- **Turning a page** replaces the URL with `?book=<id>&page=<index>`, so it doesn't add history entries and Back still closes the book.
- **Unknown ids** (`?book=nope`) just show the shelf.

Only the small part that reads the URL sits inside `<Suspense>`, so the shelf is still prerendered as static HTML.

---

## 5. Project structure

```
portfolio/
├─ app/
│  ├─ layout.tsx             # fonts, metadata (title, description, link previews)
│  ├─ page.tsx               # heading, shelf, reading room — the whole site
│  ├─ globals.css            # theme tokens (@theme), textures, reduced-motion rules
│  ├─ opengraph-image.tsx    # link-preview image: your name beside the shelf
│  ├─ icon.svg               # browser tab icon
│  ├─ robots.ts, sitemap.ts
├─ assets/fonts/             # TTFs for the link-preview image (OFL licensed)
├─ components/
│  ├─ library/
│  │  ├─ Library.tsx         # owns the open-book state and URL sync
│  │  ├─ Bookshelf.tsx       # frame, planks, layout of books + decor
│  │  ├─ BookSpine.tsx       # a book on the shelf (hover, click)
│  │  └─ Decor.tsx           # plant, candle, bookends (SVG)
│  ├─ book/
│  │  ├─ BookOverlay.tsx     # loaded separately: AnimatePresence + OpenBook
│  │  ├─ OpenBook.tsx        # dialog overlay, 3D book box, fly-in/out, keys
│  │  ├─ Leaves.tsx          # the turning leaves: angles, piles, click/drag/swipe
│  │  ├─ useBookPages.ts     # which page is open, turning to a position or page
│  │  ├─ BookNav.tsx         # ‹ › buttons, ribbon bookmark, "Pages 4–5 of 7"
│  │  ├─ SpineFace.tsx       # spine artwork, shared with the shelf
│  │  ├─ CoverFace.tsx       # front cover artwork
│  │  ├─ TableOfContents.tsx
│  │  └─ pages/              # renderers per page kind
│  │     ├─ PageContent.tsx  # picks the renderer
│  │     ├─ PageFrame.tsx    # running head + page number, paragraphs, links
│  │     ├─ TextPage.tsx, ListPage.tsx, ImagePage.tsx
│  │     ├─ ProjectSummaryPage.tsx, ContactPage.tsx
│  │     └─ EndPage.tsx      # "Finis", back to the shelf or the contents
│  ├─ ReadingRoom.tsx        # every book as plain text, below the shelf
│  └─ scene3d/               # (optional, Phase 6) R3F shelf scene
├─ content/
│  ├─ site.ts                # your name, role and description
│  ├─ shelf.ts               # which book/decoration stands where
│  └─ books/                 # about.ts, projects.ts, experience.ts, ...
├─ lib/
│  ├─ paginate.ts            # chapters → flat pages → leaves and positions
│  ├─ roman.ts               # chapter numbers as numerals
│  ├─ shelf.ts               # spine width from page count
│  ├─ siteUrl.ts             # the site's public address
│  └─ bookLayout.ts          # open-book size and poses (shelf, closed, open)
├─ types/book.ts
├─ public/
│  └─ images/projects/       # (when you add image pages)
└─ README.md
```

---

## 6. Build plan (phases)

### Phase 0 — Setup ✅
- [x] `create-next-app` (Next 16, TypeScript, Tailwind v4, ESLint, App Router)
- [x] Install `motion` and `clsx`
- [x] Fonts with `next/font` (Cinzel, Cormorant Garamond, EB Garamond, IBM Plex Mono)
- [x] Theme tokens and Tailwind utilities in `app/globals.css`
- [x] Placeholder themed shelf on `/`

### Phase 1 — Content model ✅
- [x] Define the types in `types/book.ts`
- [x] **About** and **Projects** books (placeholder text, replace with your own; 2–3 projects is enough to start)
- [x] `paginate.ts` with unit tests (cover/contents/end-page insertion, page numbers, empty chapters)
- [x] Vitest, plus content checks in `content/books/books.test.ts`

### Phase 2 — Static bookshelf ✅
- [x] Shelf frame, crown, plinth and planks with wood grain, depth shading and lamp light
- [x] `BookSpine` with vertical title, gold-foil effect, raised bands, and heights/widths from the content
- [x] Hover and focus pull-out animation (brighten only with reduced motion), subtitle plaque on desktop
- [x] Decorations: plant, candle with flickering flame, a stack of lying books
- [x] Shelf layout in `content/shelf.ts`, including a leaning book
- [x] Responsive sizing; placeholder books for the remaining six sections

### Phase 3 — Open and close a book ✅
- [x] `OpenBook` as a native `<dialog>` with a blurred backdrop and "Return to shelf" button
- [x] 3D book box that flies from the spine to the centre, turns, and opens its cover (spread or single page)
- [x] Close animation back to the shelf slot; reduced-motion fade
- [x] URL sync (`?book=`), back button, Esc, backdrop click, focus returned to the spine
- [x] Opens on the table of contents; `lib/bookLayout.ts` with tests

### Phase 4 — Page turning ✅
- [x] Leaves with front and back faces, piles that stack in the right order, `toLeaves()` and positions in `paginate.ts`
- [x] Turning by click, ← / →, drag, and swipe; ‹ › buttons; `?page=` in the URL (deep links riffle to the page)
- [x] Shading while a page turns, page edges that thicken and thin as you read
- [x] Single-page mode on phones; resizing keeps your page
- [x] Contents entries and a ribbon bookmark to jump to chapters; an end page back to the shelf
- [x] Renderers for every page kind, with running heads and page numbers
- [x] Hidden pages are inert; focus is kept on screen after a turn

### Phase 5 — Content, polish, and quality
- [ ] **Fill in all the books** with your own content (see "Filling in your content" below)
- [x] Reduced-motion, keyboard-only and screen-reader checks: focus order, skip link, heading structure, live page announcements
- [x] Reading room below the shelf; metadata, link-preview image, sitemap, robots, tab icon
- [x] Contact: email and social links only (decided against a form)
- [x] Performance: the open book and animation library load separately (page JS 238 → 183 KB gzipped); no image textures; the first screen fits from 1366×768 laptops to phones
- [ ] Lighthouse audit (aim for ≥ 90 in every category); run `npx lighthouse http://localhost:3000` against `npm run build && npm start`
- [x] ~~Sound effects~~ (decided against)

### Phase 6 — Optional: 3D scene with Three.js
- [ ] `@react-three/fiber` + `@react-three/drei`, loaded with `next/dynamic({ ssr: false })` and only on capable devices
- [ ] Model the shelf and books as boxes with wood and leather textures, warm point lighting, and slight camera parallax
- [ ] Clicking a 3D book triggers the **same** HTML `OpenBook` overlay (the 3D book animates toward the camera, then the HTML book takes over)
- [ ] Keep the CSS shelf as the fallback for low-power devices, reduced motion, and no WebGL

### Phase 7 — Deploy
- [ ] Push to GitHub and import into Vercel. Link previews and the sitemap use Vercel's production domain automatically
- [ ] Custom domain: set `NEXT_PUBLIC_SITE_URL` (e.g. `https://yourname.dev`) in the Vercel project settings
- [ ] Analytics (Vercel Analytics or Plausible)

**Rough total:** about 2 weeks part-time for Phases 0–5.

---

## 7. Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

```bash
npm run lint        # ESLint
npm test            # unit tests (Vitest)
npm run test:watch  # tests in watch mode
npm run build       # production build
# optional, Phase 6:
npm install three @react-three/fiber @react-three/drei
```

### Filling in your content
Everything that's placeholder is marked `TODO`:

1. **`content/site.ts`**: your name, role and a one-sentence description. These drive the page heading, browser tab, search results and link-preview image.
2. **`content/books/*.ts`**: one file per book. Keep each page short (pages don't scroll) and split long text across several pages; `npm test` checks the files for mistakes like duplicate ids or empty chapters.
3. **Images**: put them in `public/images/…` and add an `{ kind: "image", src: "/images/…", alt: "…" }` page.

The site's address comes from `NEXT_PUBLIC_SITE_URL` if set, otherwise Vercel's production domain, otherwise `http://localhost:3000`.

### Adding a new project
1. Open `content/books/projects.ts`.
2. Add a new `Chapter` with its pages.
3. Save. The table of contents, page count, and spine thickness update automatically.

### Adding a new book
1. Create `content/books/<id>.ts` exporting a `Book`.
2. Place it in `content/shelf.ts`, in whichever row and position you want.

---

## 8. Things to watch out for

- **Text readability comes first.** The book is the content. Keep the page body at 17px or more, with high contrast and at most about 60–70 characters per line.
- **Don't hide information behind the novelty.** The reading room and deep links make sure recruiters can still find everything in seconds.
- **Keep the first screen fitting.** On desktop the books are sized from the screen height (`--book-max-h` in `globals.css`) so both shelves, the heading and the reading-room link fit even on a 1366×768 laptop. If you add a shelf or make the heading taller, adjust that formula.
- **Watch the 3D stacking context.** `overflow: hidden`, `filter`, or `opacity` on a parent of `preserve-3d` elements flattens the 3D effect. Put shadows and blur on sibling layers.
- **No big shadows on moving 3D faces.** A large `box-shadow` on the cover or a page confuses Chrome's 3D layer sorting, and the pages show through the opening cover near the spine. The open book's shadows sit on flat planes at the back of the book instead.
- **Drive the 3D parts with motion values, not element animations.** Animating an element directly with Motion (`animate(element, { rotateY })`) can hand it to the browser's own animation engine, which runs out of step with the leaves (driven by motion values). Chrome then sorts the 3D layers using stale transforms, and the pages show through the cover as the book lands on the shelf. `OpenBook` animates the box pose and cover angle as motion values so everything updates together.
- **Animate only `transform` and `opacity`** to keep page turns at 60fps.
- **Keep pages short.** A page doesn't scroll; anything that doesn't fit is cut off. Split long content across pages.
- **Images on pages:** give them fixed aspect ratios so the page layout doesn't jump.
