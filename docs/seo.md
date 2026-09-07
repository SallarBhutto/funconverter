# FileHush — SEO

SEO is a core product strategy and a first-class requirement (D002 in
[decisions.md](decisions.md)). Organic search is expected to be the primary
acquisition channel.

## URL Strategy

One genuine, search-focused route per actual tool.

Intended routes:

```text
/pdf-to-jpg
/pdf-to-png
/pdf-to-webp

/jpg-to-pdf
/png-to-pdf
/webp-to-pdf

/compress-jpg
/compress-png
/compress-webp
/compress-pdf
```

Alongside the tools there are three public trust pages, which are not tools
and are deliberately kept out of the tool registry and the tools menu:

```text
/privacy
/terms
/contact
```

They come from `sitePages` in `src/lib/site-pages.ts`, which drives both the
footer links and their sitemap entries.

Only create a route when the corresponding functionality actually exists or is
intentionally being launched in the same change. Do not create empty SEO
pages, placeholder pages, or "coming soon" pages.

## Tool Page Structure

```text
H1

short useful introduction

actual converter/compressor

How to use this tool

Privacy explanation

Format/quality explanation where relevant

Useful FAQs

Related tools
```

SEO content is server-rendered. The interactive converter is a Client
Component island inside the server-rendered page.

## Server Components

Do not make an entire page `"use client"` because the uploader needs
client-side APIs. Keep server-rendered:

- H1
- explanatory text
- FAQ
- internal links
- metadata-related content

## Metadata

Each tool route needs:

- unique title
- unique meta description
- canonical URL
- appropriate Open Graph metadata

The site name in titles and Open Graph is `FileHush`, taken from
`siteConfig` in `src/lib/seo/site-config.ts`. Tool titles follow
"<Tool> – Free & Private"; the homepage uses `siteConfig.title`. The root
layout appends " · FileHush" to every non-homepage title, so the trust pages
simply pass their page name ("Privacy Policy", "Terms of Use", "Contact").

Every page built by `buildPageMetadata` shares one Open Graph card, the
1200x630 image rendered by `src/app/opengraph-image.tsx`. A page that declares
`openGraph` replaces the parent object wholesale and so loses the image the
file convention would otherwise contribute; the helper therefore restates the
card for both Open Graph and Twitter (`summary_large_image`). The image URL is
site-relative and resolved against `metadataBase`, so no origin is hard-coded
and each environment emits its own absolute URL. `ogImage` in
`src/lib/seo/metadata.ts` is the single description of that card, and
`opengraph-image.tsx` reads its `alt`, `size` and `contentType` from it. There
is one card for the whole site; do not add per-page images.

Avoid keyword stuffing. Titles and descriptions should read naturally.

## Site Infrastructure

Implement when the application begins:

- `sitemap.xml` (generated from the real route list, never hand-maintained
  separately from routes). Priorities: homepage 1, tools 0.9, trust pages 0.3,
  since the trust pages support the product rather than serving a search
  intent of their own
- `robots.txt`
- canonical URLs
- metadata defaults in the root layout
- a configurable production site URL (environment variable), used for
  canonicals, sitemap, and Open Graph. Production is `https://filehush.org`,
  set through `NEXT_PUBLIC_SITE_URL`; it is never hard-coded in app code
- semantic HTML
- meaningful internal links

## Headings

- one primary H1 per main page
- logical H2/H3 hierarchy
- no headings solely for visual styling

## Internal Linking

Related tools are contextually linked from each tool page. Example:

```text
PDF → JPG
├── PDF → PNG
├── PDF → WebP
├── JPG → PDF
└── Compress PDF
```

Only link to routes that exist. Related-tool lists should be driven by a
single tool registry so links cannot go stale.

## Helpful Content

Do not create thin variant pages for the same tool:

```text
/free-pdf-to-jpg
/best-pdf-to-jpg
/pdf-to-jpg-online-free
/pdf-to-jpg-fast
```

One authoritative, genuinely useful page per search intent.

## Core Web Vitals

Performance affects both UX and SEO. Architect toward:

- fast LCP
- low CLS
- responsive INP

Techniques:

- Server Components
- minimal initial JS
- lazy-load processing libraries (see [architecture.md](architecture.md))
- avoid unnecessary UI libraries
- prevent layout shifts
- reserve dimensions for previews and progress areas
- avoid huge media assets

## Ads and SEO

Advertising is not implemented and not approved yet (see
[product.md](product.md)). When it is eventually introduced:

- reserve ad dimensions where possible
- minimize CLS
- avoid intrusive interstitials
- do not cover content
- do not place ads where users may mistake them for controls or downloads
- keep advertising secondary to the tool
