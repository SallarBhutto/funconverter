# FileHush

Free, privacy-first file conversion and compression tools that run entirely in
the browser. No sign-up. **Your files never leave your device.** Nothing is
uploaded, processed on a server, or stored remotely.

FileHush is the public brand, live at [filehush.org](https://filehush.org).
The repository keeps the technical name `file-converter-web`.

## Status

**Ten tools are implemented.**

- PDF to image: `/pdf-to-jpg`, `/pdf-to-png`, `/pdf-to-webp`. Rendering
  uses PDF.js.
- Image to PDF: `/jpg-to-pdf`, `/png-to-pdf`, `/webp-to-pdf`. Generation
  uses jsPDF.
- Compress images: `/compress-jpg`, `/compress-png`, `/compress-webp`.
  JPG and WebP re-encode through the browser's own encoders; PNG is
  optimised losslessly with OxiPNG (WebAssembly).
- Compress PDF: `/compress-pdf`. Preserve and Balanced rewrite the file with
  qpdf (WebAssembly, in a Web Worker); Maximum renders pages with PDF.js
  and rebuilds them with jsPDF.

Files are never made larger: when a rewrite does not help, the original is
returned and marked as already optimized. Everything runs in the browser.

Three non-tool pages support the launch: `/privacy`, `/terms` and `/contact`.
They are Server Components with no client JavaScript, linked from the footer
and listed in the sitemap. The privacy and terms copy describes how the site
behaves **today**; introducing advertising, accounts, cookies or any
server-side file handling means updating those pages in the same change (see
D011 in [docs/decisions.md](docs/decisions.md)). Vercel Web Analytics is
enabled and described in the policy (D012).

See [docs/roadmap.md](docs/roadmap.md) for what comes next.

## Stack

- Next.js 16 (App Router, Server Components by default)
- React 19
- TypeScript (strict)
- Tailwind CSS 4
- PDF.js (`pdfjs-dist`) for PDF rendering, loaded on demand
- jsPDF for building PDFs from images, loaded on demand
- @jsquash/oxipng for lossless PNG optimisation, loaded on demand
- qpdf-run (qpdf 11 as WebAssembly) for PDF optimisation, loaded on demand
- fflate for in-browser ZIP creation, loaded on demand
- @vercel/analytics for cookieless page-view measurement
- Vitest for unit tests
- ESLint, npm

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000.

`npm run dev` and `npm run build` first run `scripts/copy-vendor-assets.mjs`,
which copies the PDF.js worker, CMaps, standard fonts, ICC profile, and WASM
decoders into the git-ignored `public/pdfjs/` directory, the OxiPNG
WebAssembly module into `public/oxipng/`, and the qpdf runner, worker and
WebAssembly into `public/qpdf/`. Next.js serves
them as static files; nothing is fetched from a CDN.

Copy `.env.example` to `.env.local` if you need to override the site origin.

The public site origin drives canonical URLs, Open Graph URLs, `robots.txt`,
and `sitemap.xml`. It resolves from `NEXT_PUBLIC_SITE_URL`, then Vercel's
`VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL`, then `http://localhost:3000`.
Production must set:

```bash
NEXT_PUBLIC_SITE_URL=https://filehush.org
```

It always takes precedence over Vercel-generated domains. These variables are
not secrets.

## Quality commands

```bash
npm run lint
npm run typecheck
npm test
npm run build
```

Run all four before considering a change complete. Tests cover pure logic
only: file validation, size formatting, filename generation, format
configuration and quality presets, progress, canvas background planning,
render-dimension safeguards, page layout maths, EXIF orientation parsing,
list reordering, compression savings and output selection, PDF compression
modes and qpdf argument generation. See
[docs/testing.md](docs/testing.md).

## Project knowledge base

`CLAUDE.md` is the entry point for project rules and imports the documents in
`docs/`:

- [product.md](docs/product.md) — what the product is and why
- [architecture.md](docs/architecture.md) — browser-only processing, stack, boundaries
- [seo.md](docs/seo.md) — routes, metadata, sitemap rules
- [coding-standards.md](docs/coding-standards.md)
- [ui-ux.md](docs/ui-ux.md)
- [testing.md](docs/testing.md)
- [roadmap.md](docs/roadmap.md)
- [decisions.md](docs/decisions.md) — decision log

`AGENTS.md` holds a block that Next.js manages automatically; it is not part
of the project knowledge base.
