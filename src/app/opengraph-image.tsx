import { readFile } from "node:fs/promises";
import path from "node:path";

import { ImageResponse } from "next/og";

import { SYMBOL_PATH, SYMBOL_VIEW_BOX } from "@/lib/brand/symbol";
import { ogImage } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/seo/site-config";
import { getSiteUrl } from "@/lib/seo/site-url";

// Sourced from the shared card description so the rendered image and the
// og:image tags that describe it always agree.
export const alt = ogImage.alt;
export const size = { width: ogImage.width, height: ogImage.height };
export const contentType = ogImage.type;

const TEAL = "#0f766e";
const INK = "#0a0a0a";
const FONT_DIR = path.join(process.cwd(), "src/assets/fonts");

/**
 * Open Graph card from the brand handoff: lockup, the tagline over three
 * lines with the last line in teal, and a footer row with the site host and
 * the supported formats. Rendered once at build time; fonts are the static
 * Geist instances committed under src/assets/fonts.
 */
export default async function OpenGraphImage() {
  const [geistSemiBold, geistMono] = await Promise.all([
    readFile(path.join(FONT_DIR, "Geist-SemiBold.ttf")),
    readFile(path.join(FONT_DIR, "GeistMono-Regular.ttf")),
  ]);
  const lines = siteConfig.tagline.split(/(?<=\.)\s+/);
  const host = new URL(getSiteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 104,
          background: "#ffffff",
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <svg
            width={76}
            height={76}
            viewBox={SYMBOL_VIEW_BOX}
            fill={TEAL}
            fillRule="evenodd"
          >
            <path d={SYMBOL_PATH} />
          </svg>
          <span style={{ fontSize: 62, fontWeight: 600, letterSpacing: "-0.03em", color: INK }}>
            {siteConfig.name}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          {lines.map((line, index) => (
            <span
              key={line}
              style={{
                fontSize: 56,
                fontWeight: 600,
                letterSpacing: "-0.03em",
                lineHeight: 1.22,
                color: index === lines.length - 1 ? TEAL : INK,
              }}
            >
              {line}
            </span>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: "Geist Mono",
            fontSize: 24,
          }}
        >
          <span style={{ color: "#71717a" }}>{host}</span>
          <span style={{ color: "#a1a1aa" }}>PDF · JPG · PNG · WebP</span>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistSemiBold, weight: 600, style: "normal" },
        { name: "Geist Mono", data: geistMono, weight: 400, style: "normal" },
      ],
    },
  );
}
