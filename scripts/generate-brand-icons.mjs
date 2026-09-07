// Rasterises the FileHush favicon/app icons from the vector master
// public/favicon.svg. Run with `node scripts/generate-brand-icons.mjs` after
// the master changes; the outputs are committed. Uses sharp (dev dependency).
//
// Rasters are opaque per the brand handoff: the counters that are transparent
// in the SVG are filled white so the FH never picks up a wallpaper. The tile's
// rounded corners stay transparent except on the Apple touch icon, which sits
// on a white field.
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const TEAL = "#0f766e";

const master = await readFile(path.join(publicDir, "favicon.svg"), "utf8");
const pathData = /<path d="([^"]+)"/.exec(master)?.[1];
if (!pathData) throw new Error("public/favicon.svg: could not find the symbol path");

/**
 * Tile with white counters, on an optional field, at `tileFraction` of `size`.
 * The white layer sits under the opaque teal ring, inset from the tile edge,
 * so its edges never coincide with the tile's anti-aliased outline. A second
 * small piece backs the open stem, which breaks the top edge.
 */
function composeSvg({ size, tileFraction = 1, field = "none", counters = "#fff", tile = TEAL }) {
  const tileSize = size * tileFraction;
  const offset = (size - tileSize) / 2;
  const scale = tileSize / 64;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  ${field === "none" ? "" : `<rect width="${size}" height="${size}" fill="${field}"/>`}
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <rect x="6" y="6" width="52" height="46" fill="${counters}"/>
    <rect x="22" y="-2" width="10" height="10" fill="${counters}"/>
    <path d="${pathData}" fill="${tile}" fill-rule="evenodd"/>
  </g>
</svg>`;
}

/** Rasterise at 8x (at least 1024 px) and downsample for clean edges. */
function renderPng(svg, size) {
  return sharp(Buffer.from(svg), { density: 72 * Math.max(8, 1024 / size) })
    .resize(size, size)
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

/** ICO container holding PNG-encoded images (supported by every current browser). */
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const entries = [];
  let offset = 6 + 16 * pngs.length;
  for (const { size, png } of pngs) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    entries.push(entry);
    offset += png.length;
  }
  return Buffer.concat([header, ...entries, ...pngs.map(({ png }) => png)]);
}

const edgeToEdge = (size) => composeSvg({ size });

const outputs = [
  ["icon-16.png", () => renderPng(edgeToEdge(16), 16)],
  ["icon-32.png", () => renderPng(edgeToEdge(32), 32)],
  ["icon-192.png", () => renderPng(edgeToEdge(192), 192)],
  ["icon-512.png", () => renderPng(edgeToEdge(512), 512)],
  // Maskable variant: full-bleed teal field with the mark at 66 %, so the
  // FH stays inside the safe zone when a platform crops the icon.
  [
    "icon-512-maskable.png",
    () => renderPng(composeSvg({ size: 512, tileFraction: 0.66, field: TEAL }), 512),
  ],
  // Apple touch icon: white 180 field, tile at 80 % (144 px), centred, opaque.
  [
    "apple-touch-icon.png",
    () => renderPng(composeSvg({ size: 180, tileFraction: 0.8, field: "#ffffff" }), 180),
  ],
];

for (const [name, render] of outputs) {
  const png = await render();
  await writeFile(path.join(publicDir, name), png);
  console.log(`${name} (${png.length} bytes)`);
}

const icoSizes = [16, 32, 48];
const icoPngs = [];
for (const size of icoSizes) {
  icoPngs.push({ size, png: await renderPng(edgeToEdge(size), size) });
}
const ico = buildIco(icoPngs);
await writeFile(path.join(publicDir, "favicon.ico"), ico);
console.log(`favicon.ico (${ico.length} bytes, ${icoSizes.join("/")})`);
