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
| Animation | **Motion** (`motion`, formerly Framer Motion) | Shared-layout animations (book flies from shelf to centre), springs, gestures, reduced-motion support |
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
| **Contact** | Last page as a letter: email, socials, a short contact form, CV download |

Every book also gets:
- a **cover** (title, small emblem)
- an **auto-generated table of contents** whose entries jump to that chapter
- a **back cover** with a "Return to shelf" action

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

Spine thickness isn't stored; it's calculated from the page count (Phase 2).

Pages are written as data in `content/books/*.ts`, and `content/books/index.ts` lists the books in shelf order. `lib/paginate.ts` turns a book into pages and spreads:

- **`paginate(book)`** flattens it into cover → table of contents → chapter pages → back cover. Each page has an `index` (its position, used by `?page=`) and a printed `number`. The table of contents points at each chapter's first page.
- **`toSpreads(pages)`** pairs pages the way a real book opens: the closed cover alone on the right, the table of contents facing the inside of the front cover, then pairs, and the closed back cover alone on the left.
- **`spreadIndexOf(spreads, pageIndex)`** finds which spread shows a page, so `?page=7` opens the right spread on desktop.

`content/books/books.test.ts` checks the content itself (unique, URL-safe ids, no empty chapters, heights in range), so a typo in a book file fails `npm test` instead of breaking the site.

---

## 4. Interaction design and animation

### 4.1 Shelf (idle state)
- Books stand on one or two shelves with small differences in height, thickness and tilt. One book may lean against another.
- Decorations between books (a plant, candle, globe, bookends) make it look like a real shelf. These are decorative and hidden from screen readers.
- **Hover/focus:** the book slides about 12px toward the viewer, rises slightly, and a tooltip-style label appears. A soft wood "tock" sound is optional and off by default.

### 4.2 Opening a book (≈ 900 ms total)
1. **Pull out** (0–250 ms): the book moves forward (`translateZ`/`scale`) and the other books dim.
2. **Fly and turn** (250–600 ms): using Motion's shared `layoutId`, the book moves from its place on the shelf to the centre of the screen while it rotates `rotateY(-90° → 0°)` so the cover faces the viewer. The background blurs or darkens.
3. **Open cover** (600–900 ms): the front cover rotates on its left edge (`rotateY(0 → -180°)`, `transform-origin: left`) to show the first spread.

Closing reverses these steps, and the book goes back to its slot.

### 4.3 Turning pages
- Each leaf is a `div` with a front and a back face, `preserve-3d`, rotating around the spine.
- Ways to turn: **click the right or left page**, **← / → keys**, **drag the page corner** (Motion `drag` mapped to rotation, snapping when released), and **swipe** on touch screens.
- A gradient shadow sweeps across the page while it turns to make it look curved.
- Page numbers sit in the footer. A ribbon bookmark opens the table of contents.
- Optional: a soft page-rustle sound, muted by default, with a toggle.

### 4.4 Responsive behaviour
| Viewport | Shelf | Open book |
|---|---|---|
| ≥ 1024px | Full bookshelf, two shelves | **Two-page spread** |
| 640–1023px | One shelf that scrolls horizontally | Two-page spread, scaled down |
| < 640px | Books stacked as tappable spines in a vertical shelf, or a horizontal scroll | **Single page**, swipe to turn |

### 4.5 Accessibility (built in from the start)
- Each book is a `<button>` with `aria-label="Open Projects book"`. The open book is a `role="dialog"` with a focus trap, `Esc` closes it, and focus returns to the spine.
- Page changes are announced through an `aria-live="polite"` region ("Page 4 of 18 — Project: Weather App").
- `prefers-reduced-motion`: the fly and flip animations are replaced with short crossfades.
- Text is real HTML, never a canvas or image, so it can be selected, searched, and translated.
- A small **"Reading room" (plain view)** link shows all the content as a simple scrolling page, for recruiters who need information quickly. It also helps SEO.

### 4.6 Single page and URL state
There is one route, `/`, and the open book and page are stored in the query string:

```
/                          → shelf
/?book=projects            → Projects book, cover
/?book=projects&page=7     → Projects book, page 7
```

This makes links shareable, lets the browser back button close the book, and allows deep-linking a specific project in a CV. Use `useSearchParams` (inside a `<Suspense>` boundary) with `router.replace` for page turns and `router.push` for opening or closing a book.

---

## 5. Project structure

```
portfolio/
├─ app/
│  ├─ layout.tsx             # fonts, metadata
│  ├─ page.tsx               # <Library /> — the whole site
│  ├─ globals.css            # theme tokens (@theme), textures, reduced-motion rules
│  └─ opengraph-image.tsx    # social preview of the shelf
├─ components/
│  ├─ library/
│  │  ├─ Library.tsx         # owns the open-book state and URL sync
│  │  ├─ Bookshelf.tsx       # frame, planks, layout of books + decor
│  │  ├─ BookSpine.tsx       # a book on the shelf (hover, click)
│  │  └─ Decor.tsx           # plant, candle, bookends (SVG)
│  ├─ book/
│  │  ├─ OpenBook.tsx        # dialog overlay, fly-in/out animation, cover
│  │  ├─ PageFlipper.tsx     # spreads, flip animation, drag/swipe/keys
│  │  ├─ Leaf.tsx            # one physical leaf (front + back face)
│  │  ├─ TableOfContents.tsx
│  │  └─ pages/              # renderers per Page.kind
│  │     ├─ TextPage.tsx
│  │     ├─ ImagePage.tsx
│  │     ├─ ProjectSummaryPage.tsx
│  │     └─ ContactPage.tsx
│  ├─ PlainView.tsx          # accessible "reading room" fallback
│  └─ scene3d/               # (optional, Phase 6) R3F shelf scene
├─ content/
│  └─ books/                 # about.ts, projects.ts, experience.ts, ...
├─ lib/
│  ├─ paginate.ts            # chapters → flat pages → spreads
│  └─ useBookUrlState.ts
├─ types/book.ts
├─ public/
│  ├─ textures/              # wood.webp, paper.webp (compressed)
│  ├─ images/projects/
│  └─ cv.pdf
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
- [x] `paginate.ts` with unit tests (cover/TOC/back-cover insertion, spread pairing, odd page counts)
- [x] Vitest, plus content checks in `content/books/books.test.ts`

### Phase 2 — Static bookshelf (1–2 days)
- [ ] Shelf frame and planks with the wood texture and lighting
- [ ] `BookSpine` with vertical title, foil effect, and different heights and widths
- [ ] Hover and focus pull-out animation
- [ ] Decorations
- [ ] Responsive shelf layouts

### Phase 3 — Open and close a book (2 days)
- [ ] `OpenBook` dialog with a backdrop
- [ ] Shared-layout fly animation from the spine to the centre, plus cover rotation
- [ ] Close animation back to the shelf slot
- [ ] URL sync (`?book=`), back button, Esc, focus trap

### Phase 4 — Page turning (2–3 days, the core of the site)
- [ ] `Leaf` with front and back faces and `PageFlipper` handling the stack order (z-index) of leaves
- [ ] Turning by click, arrow keys, drag, and swipe; `?page=` in the URL
- [ ] Shading while a page turns, page-edge thickness that changes as you read
- [ ] Single-page mode on mobile
- [ ] Table of contents and ribbon bookmark navigation
- [ ] Renderers for each `Page.kind`

### Phase 5 — Content, polish, and quality (2 days)
- [ ] Fill in all the books
- [ ] Reduced-motion versions, screen-reader pass, keyboard-only pass
- [ ] `PlainView` reading room, metadata, OG image, sitemap
- [ ] Contact form (Formspree, Resend, or a Next.js Route Handler)
- [ ] Lighthouse: aim for ≥ 90 in every category; images through `next/image`; textures under 100 KB each
- [ ] Optional sound effects with a mute toggle

### Phase 6 — Optional: 3D scene with Three.js
- [ ] `@react-three/fiber` + `@react-three/drei`, loaded with `next/dynamic({ ssr: false })` and only on capable devices
- [ ] Model the shelf and books as boxes with wood and leather textures, warm point lighting, and slight camera parallax
- [ ] Clicking a 3D book triggers the **same** HTML `OpenBook` overlay (the 3D book animates toward the camera, then the HTML book takes over)
- [ ] Keep the CSS shelf as the fallback for low-power devices, reduced motion, and no WebGL

### Phase 7 — Deploy
- [ ] Push to GitHub and import into Vercel
- [ ] Custom domain, analytics (Vercel Analytics or Plausible)

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

### Adding a new project
1. Open `content/books/projects.ts`.
2. Add a new `Chapter` with its pages.
3. Save. The table of contents, page count, and spine thickness update automatically.

---

## 8. Things to watch out for

- **Text readability comes first.** The book is the content. Keep the page body at 17px or more, with high contrast and at most about 60–70 characters per line.
- **Don't hide information behind the novelty.** The plain view and deep links make sure recruiters can still find everything in seconds.
- **Watch the 3D stacking context.** `overflow: hidden`, `filter`, or `opacity` on a parent of `preserve-3d` elements flattens the 3D effect. Put shadows and blur on sibling layers.
- **Animate only `transform` and `opacity`** to keep page turns at 60fps, and use `will-change: transform` only on the leaf that is turning.
- **Images on pages:** give them fixed aspect ratios so the page layout doesn't jump.
