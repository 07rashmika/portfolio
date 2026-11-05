import type { DecorKind } from "@/content/shelf";

// Heights relative to the tallest book.
const HEIGHT: Record<DecorKind, number> = { plant: 0.55, candle: 0.45, "book-stack": 0.2 };

/** Decorative shelf objects. Hidden from screen readers. */
export function Decor({ kind }: { kind: DecorKind }) {
  const style = { height: `calc(var(--book-max-h) * ${HEIGHT[kind]})` };

  switch (kind) {
    case "plant":
      return <Plant style={style} />;
    case "candle":
      return <Candle style={style} />;
    case "book-stack":
      return <BookStack style={style} />;
  }
}

type SvgProps = { style: React.CSSProperties };

function Plant({ style }: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 60 100" style={style} className="w-auto">
      <g fill="#4f6b3a">
        <path d="M30 68 C 10 60, 6 40, 12 28 C 20 40, 26 52, 30 68 Z" />
        <path d="M30 68 C 50 60, 56 42, 50 26 C 42 40, 34 52, 30 68 Z" />
        <path d="M30 68 C 16 66, 2 58, 0 48 C 12 50, 22 56, 30 68 Z" />
      </g>
      <g fill="#3d5a2e">
        <path d="M30 68 C 22 46, 24 20, 32 4 C 38 22, 38 46, 30 68 Z" />
        <path d="M30 68 C 44 66, 58 60, 60 50 C 48 52, 38 58, 30 68 Z" />
      </g>
      <path d="M14 72 H 46 L 42 100 H 18 Z" fill="#8a4b2a" />
      <rect x="11" y="66" width="38" height="8" rx="1.5" fill="#a35d35" />
      <rect x="11" y="66" width="38" height="2" fill="rgb(255 255 255 / 0.15)" />
    </svg>
  );
}

function Candle({ style }: SvgProps) {
  return (
    <svg aria-hidden viewBox="0 0 40 100" style={style} className="w-auto overflow-visible">
      <defs>
        <radialGradient id="candle-glow">
          <stop offset="0%" stopColor="#ffd9a0" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#ffd9a0" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="candle-flame" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#e2711d" />
          <stop offset="45%" stopColor="#ffc857" />
          <stop offset="100%" stopColor="#fff1c1" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="30" r="26" fill="url(#candle-glow)" />
      <path className="candle-flame" d="M20 18 C 26 28, 25 36, 20 39 C 15 36, 14 28, 20 18 Z" fill="url(#candle-flame)" />
      <line x1="20" y1="39" x2="20" y2="43" stroke="#2e2118" strokeWidth="1.2" />
      <rect x="13" y="42" width="14" height="48" rx="1" fill="#efe3c4" />
      <path d="M13 44 q 2 7 4 0 q 1 4 3 0 v -2 h -7 Z" fill="#e4d4b0" />
      <rect x="13" y="42" width="3" height="48" fill="rgb(0 0 0 / 0.06)" />
      {/* brass holder */}
      <rect x="10" y="88" width="20" height="4" rx="1" style={{ fill: "var(--brass)" }} />
      <ellipse cx="20" cy="96" rx="17" ry="4" style={{ fill: "var(--brass)" }} />
      <ellipse cx="20" cy="95" rx="17" ry="2.5" style={{ fill: "var(--brass-bright)" }} opacity="0.5" />
    </svg>
  );
}

function BookStack({ style }: SvgProps) {
  const books = [
    { y: 0, x: 8, w: 70, color: "var(--spine-teal)" },
    { y: 13, x: 2, w: 82, color: "var(--spine-oxblood)" },
    { y: 26, x: 5, w: 76, color: "var(--spine-navy)" },
  ];
  return (
    <svg aria-hidden viewBox="0 0 88 39" style={style} className="hidden w-auto sm:block">
      {books.map((book) => (
        <g key={book.y}>
          <rect x={book.x} y={book.y} width={book.w} height="13" rx="1.5" style={{ fill: book.color }} />
          <rect x={book.x} y={book.y} width={book.w} height="2" fill="rgb(255 255 255 / 0.1)" />
          <rect x={book.x + 6} y={book.y + 3} width="1.5" height="7" style={{ fill: "var(--brass)" }} />
          <rect x={book.x + book.w - 7.5} y={book.y + 3} width="1.5" height="7" style={{ fill: "var(--brass)" }} />
        </g>
      ))}
    </svg>
  );
}
