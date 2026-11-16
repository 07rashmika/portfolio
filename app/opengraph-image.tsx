import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { books } from "@/content/books";
import { site } from "@/content/site";
import { spineWidth } from "@/lib/shelf";
import type { SpineColor } from "@/types/book";

// The preview shown when the site is shared: your name beside a small shelf of the real books.

export const alt = `${site.name}'s bookshelf portfolio`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// The image renderer can't read CSS variables; these match the --spine-* tokens in app/globals.css.
const SPINE: Record<SpineColor, string> = {
  oxblood: "#6e1f1f",
  forest: "#2f4a34",
  navy: "#22334d",
  ochre: "#9a5b1e",
  plum: "#4b2a40",
  teal: "#1f4a4a",
  tan: "#8a6a45",
  red: "#7a2a20",
};
const BRASS = "#c29a4b";

// Cached, so reading the font files doesn't stop the image from being generated once at build time.
// Cached values must survive serialisation, so the files travel as base64 text.
async function loadFonts() {
  "use cache";
  const font = async (file: string) => (await readFile(join(process.cwd(), "assets/fonts", file))).toString("base64");
  return Promise.all([font("Cinzel-SemiBold.ttf"), font("CormorantGaramond-MediumItalic.ttf")]);
}

const toArrayBuffer = (base64: string) => {
  const bytes = Buffer.from(base64, "base64");
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
};

export default async function Image() {
  const [cinzel, cormorant] = (await loadFonts()).map(toArrayBuffer);
  const tallest = 360;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 80px",
          gap: 70,
          backgroundColor: "#2b1a10",
          backgroundImage:
            "radial-gradient(ellipse at 15% 0%, rgba(255,217,160,0.16), transparent 60%), radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.5))",
        }}
      >
        {/* the shelf */}
        <div style={{ display: "flex", flexDirection: "column", width: 520 }}>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 6,
              height: tallest + 40,
              padding: "0 24px",
              backgroundColor: "#1f130b",
              borderLeft: "14px solid #4a2c1a",
              borderRight: "14px solid #4a2c1a",
              borderTop: "14px solid #4a2c1a",
            }}
          >
            {books.map((book) => (
              <div
                key={book.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  width: Math.round(spineWidth(book) * 0.85),
                  height: Math.round(tallest * book.height),
                  padding: "14px 4px",
                  borderRadius: "3px 3px 0 0",
                  backgroundColor: SPINE[book.spineColor],
                  backgroundImage:
                    "linear-gradient(90deg, rgba(0,0,0,0.4), rgba(255,255,255,0.1) 22%, rgba(0,0,0,0.2) 82%, rgba(0,0,0,0.5))",
                }}
              >
                <div style={{ display: "flex", height: 6, borderTop: `2px solid ${BRASS}`, borderBottom: `2px solid ${BRASS}` }} />
                <div style={{ display: "flex", height: 6, borderTop: `2px solid ${BRASS}`, borderBottom: `2px solid ${BRASS}` }} />
              </div>
            ))}
          </div>
          {/* plank */}
          <div style={{ display: "flex", height: 22, backgroundColor: "#9c6b3f", borderTop: "2px solid #b8865a" }} />
        </div>

        {/* who */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div style={{ display: "flex", fontFamily: "Cinzel", fontSize: 26, letterSpacing: 6, color: "#e4d4b0" }}>
            THE BOOKSHELF OF
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              fontFamily: "Cinzel",
              fontSize: 68,
              lineHeight: 1.1,
              letterSpacing: 2,
              color: BRASS,
            }}
          >
            {site.name}
          </div>
          <div style={{ display: "flex", marginTop: 26, width: 140, height: 2, backgroundColor: BRASS }} />
          <div style={{ display: "flex", marginTop: 24, fontFamily: "Cormorant", fontSize: 40, color: "#e2c17a" }}>
            {site.role}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Cinzel", data: cinzel, weight: 600, style: "normal" },
        { name: "Cormorant", data: cormorant, weight: 500, style: "italic" },
      ],
    },
  );
}
