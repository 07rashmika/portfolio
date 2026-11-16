import * as THREE from "three";
import { PALETTE } from "@/lib/palette";
import { seededRandom } from "@/lib/shelf3d";

// Everything the 3D shelf needs is drawn on canvases, so there are no image files to download.

function canvasTexture(width: number, height: number, draw: (ctx: CanvasRenderingContext2D) => void) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  draw(canvas.getContext("2d")!);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/** Wood grain: wavy streaks over a base colour. `horizontal` for planks, vertical for the frame. */
export function woodTexture(base: string, grain: string, seed: number, horizontal = false) {
  const texture = canvasTexture(512, 512, (ctx) => {
    const random = seededRandom(seed);
    ctx.fillStyle = base;
    ctx.fillRect(0, 0, 512, 512);
    if (horizontal) {
      ctx.translate(512, 0);
      ctx.rotate(Math.PI / 2);
    }
    for (let i = 0; i < 110; i++) {
      const x = random() * 512;
      const wobble = 4 + random() * 10;
      const phase = random() * Math.PI * 2;
      ctx.strokeStyle = random() < 0.6 ? grain : "#000";
      ctx.globalAlpha = 0.05 + random() * 0.12;
      ctx.lineWidth = 0.6 + random() * 2.4;
      ctx.beginPath();
      for (let y = 0; y <= 512; y += 16) {
        const dx = Math.sin(y / 70 + phase) * wobble;
        if (y === 0) ctx.moveTo(x + dx, y);
        else ctx.lineTo(x + dx, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  });
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

/**
 * A book's spine, drawn like the HTML SpineFace: leather shading, two gold bands top and bottom,
 * the title in gold running down the spine, and a small diamond.
 */
export function spineTexture(title: string, color: string, width: number, height: number, scale: number, font: string) {
  return canvasTexture(width * scale, height * scale, (ctx) => {
    const w = ctx.canvas.width;
    const h = ctx.canvas.height;

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, w, h);
    const leather = ctx.createLinearGradient(0, 0, w, 0);
    leather.addColorStop(0, "rgba(0,0,0,0.4)");
    leather.addColorStop(0.22, "rgba(255,255,255,0.1)");
    leather.addColorStop(0.5, "rgba(255,255,255,0.03)");
    leather.addColorStop(0.82, "rgba(0,0,0,0.2)");
    leather.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = leather;
    ctx.fillRect(0, 0, w, h);

    // raised bands: two thin gold lines each
    const inset = w * 0.06;
    const band = h * 0.026;
    const line = Math.max(1, h * 0.0065);
    ctx.fillStyle = PALETTE.brass;
    ctx.globalAlpha = 0.75;
    for (const top of [h * 0.07, h - h * 0.07 - band]) {
      ctx.fillRect(inset, top, w - inset * 2, line);
      ctx.fillRect(inset, top + band - line, w - inset * 2, line);
    }
    ctx.globalAlpha = 1;

    // gold-foil title, pressed into the leather
    const size = h * 0.065;
    ctx.shadowColor = "rgba(0,0,0,0.55)";
    ctx.shadowOffsetY = scale;
    ctx.fillStyle = PALETTE.brass;
    ctx.save();
    ctx.translate(w / 2, h * 0.14);
    ctx.rotate(Math.PI / 2);
    ctx.font = `600 ${size}px ${font}`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${size * 0.18}px`;
    ctx.textBaseline = "middle";
    ctx.fillText(title, 0, 0);
    ctx.restore();

    ctx.font = `${h * 0.042}px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("◆", w / 2, h * 0.88);
  });
}

/** The top of a book: page edges between two strips of the cover. */
export function pagesTexture(coverColor: string) {
  return canvasTexture(64, 64, (ctx) => {
    ctx.fillStyle = PALETTE.paper;
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = "#cdb991";
    for (let x = 6; x < 58; x += 2) ctx.fillRect(x, 0, 1, 64);
    ctx.fillStyle = coverColor;
    ctx.fillRect(0, 0, 5, 64);
    ctx.fillRect(59, 0, 5, 64);
  });
}

/** A soft round speck of dust. */
export function dustTexture() {
  return canvasTexture(32, 32, (ctx) => {
    const glow = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    glow.addColorStop(0, "rgba(255,240,215,1)");
    glow.addColorStop(1, "rgba(255,240,215,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, 32, 32);
  });
}
