# FileHush — Roadmap

Roadmap items are directional and can change. Nothing below is implemented
unless stated. Phase boundaries exist to enforce D007 (build incrementally)
in [decisions.md](decisions.md).

## Phase 0 — Foundation

- knowledge base (this directory) ✔
- Next.js project initialization ✔
- design foundation (layout, typography, Tailwind setup) ✔
- SEO foundation (metadata defaults, sitemap, robots, site URL config) ✔
- processing architecture (lib boundaries, lazy-loading pattern) ✔

## Phase 1 — First Vertical Slice: PDF → JPG ✔

Implemented at `/pdf-to-jpg`. It established the patterns every later tool
reuses:

- browser-only file handling
- PDF.js integration (lazy-loaded, real worker)
- progress
- preview
- downloads (single page and ZIP)
- memory-management pattern (see [architecture.md](architecture.md))
- responsive UX
- SEO tool-page pattern (see [seo.md](seo.md))

## Phase 2 — PDF to Image ✔

- PDF → PNG ✔
- PDF → WebP ✔

Implemented at `/pdf-to-png` and `/pdf-to-webp` as thin variants of the
Phase 1 tool. All three share `src/features/pdf-to-image/` and differ only
by a format configuration (MIME type, extension, quality presets,
background) plus their server-rendered page content.

## Phase 3 — Image to PDF ✔

- JPG → PDF ✔
- PNG → PDF ✔
- WebP → PDF ✔
- mixed image batches — not yet; each route accepts one format

Implemented at `/jpg-to-pdf`, `/png-to-pdf` and `/webp-to-pdf` on one
shared feature, `src/features/image-to-pdf/`, with reorder (drag and drop
plus move buttons), page size (A4, Letter, Fit to image), orientation
(Auto, Portrait, Landscape) and margins (None, Small, Medium).

## Phase 4 — Image Compression ✔

- Compress JPG ✔
- Compress PNG ✔
- Compress WebP ✔

Implemented at `/compress-jpg`, `/compress-png` and `/compress-webp` on one
shared feature, `src/features/image-compression/`. JPG and WebP use preset
quality through the browser's canvas encoders; PNG is lossless via OxiPNG in
WebAssembly. Output is never larger than the input.

## Phase 5 — PDF Compression ✔

Implemented at `/compress-pdf` with three explicit modes (see D009 in
[decisions.md](decisions.md)):

- **Preserve** — lossless qpdf rewrite; keeps text, vectors, links, forms.
- **Balanced** — Preserve plus qpdf image optimisation; embedded images may
  be recompressed, document structure is kept.
- **Maximum** — pages rendered with PDF.js at 130 DPI / JPEG 0.7 and
  rebuilt with jsPDF; smallest files, text and links are lost and the UI
  says so before conversion.

Output is never larger than the input. Encrypted PDFs are rejected with a
message; password handling is not implemented.

## Phase 5.5 — Launch Readiness ✔

- Privacy Policy at `/privacy` ✔
- Terms of Use at `/terms` ✔
- Contact at `/contact` (email only, no form) ✔
- footer links to all three ✔
- sitemap entries at a lower priority than the tools ✔

The privacy copy describes current behaviour only. See D011 in
[decisions.md](decisions.md): introducing analytics, advertising, accounts,
cookies or any server-side file handling means updating these pages in the
same change.

## Phase 6 — SEO Expansion (next)

After tools work:

- strengthen internal linking
- refine tool-specific content
- monitor Search Console
- add genuinely useful tool pages based on demand
- improve page performance based on real measurements

## Phase 7 — Monetization

After meaningful traffic:

- limited advertising
- tasteful placements
- no fake download UI
- preserve Core Web Vitals

Potential optional paid offering later. Requires a new decision entry before
implementation.

## Future

Possible, not committed:

- image conversion utilities (JPG ↔ WebP, PNG ↔ JPG)
- resizing
- batch workflows
- presets
- metadata tools
- offline/PWA capabilities

Do not build future items prematurely.
