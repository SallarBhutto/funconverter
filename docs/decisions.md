# Decision Log

Architecture and product decisions for FileHush (repository `file-converter-web`).

## How to use this log

- Every important architectural or product change gets a **new sequential
  ID** (D008, D009, ...). Never edit a historical decision to mean something
  else.
- When a decision is replaced, mark the old entry `Status: Superseded by Dnnn`
  and add the new one.
- Statuses: `Accepted`, `Accepted for future implementation`, `Superseded`,
  `Rejected`.
- Update the affected doc in `docs/` in the same change.

---

## D001 — Browser-only file processing

**Status:** Accepted

**Decision:** User files are processed locally in the browser. No upload
APIs, processing servers, cloud storage, or conversion databases.

**Reasoning:**
- stronger privacy
- low infrastructure cost
- no file storage
- simple operational model
- differentiates the product from upload-based converters

**Consequences:**
- browser memory constraints matter
- very large files require careful handling or limits
- some advanced operations may be harder than server-side processing
- all privacy messaging in the UI depends on this decision holding

---

## D002 — SEO from day one

**Status:** Accepted

**Decision:** Every real tool gets a dedicated SEO-friendly route with useful
server-rendered content.

**Reasoning:** Organic search is expected to be the primary acquisition
channel.

**Consequences:** Page architecture must not become entirely
client-rendered. Routes exist only for real tools.

---

## D003 — Next.js App Router

**Status:** Accepted

**Decision:** Use Next.js App Router, React, TypeScript, and Tailwind CSS for
the web application.

**Reasoning:** Supports strong SEO, Server Components, static/server
rendering, routing, metadata, and a modern frontend stack.

---

## D004 — Server Components by default

**Status:** Accepted

**Decision:** Only interactive or browser-dependent parts are Client
Components.

**Reasoning:** Reduces client-side JavaScript and supports page performance
and crawlability.

---

## D005 — Minimal advertising

**Status:** Accepted for future implementation

**Decision:** Advertising may be added after traffic exists, but it must
remain limited and outside critical conversion interactions.

**Reasoning:** Monetize free traffic without degrading trust.

**Consequences:** Nothing is implemented now. Introducing ads requires a
follow-up decision entry covering provider and placements.

---

## D006 — No authentication for initial product

**Status:** Accepted

**Decision:** Initial conversion/compression tools do not require users to
create accounts.

**Reasoning:** Account creation provides little value for browser-only
one-off tools and creates unnecessary friction.

---

## D007 — Build tools incrementally

**Status:** Accepted

**Decision:** Build one complete vertical slice first, starting with
PDF → JPG, instead of implementing every converter simultaneously.

**Reasoning:** Allows the shared architecture, memory handling, UX, and SEO
patterns to be validated before scaling to more tools.

---

## D008 — Public site URL resolution order

**Status:** Accepted

**Decision:** Every absolute URL the app emits (canonical, Open Graph,
`robots.txt`, `sitemap.xml`) comes from one resolver, `getSiteUrl()` in
`src/lib/seo/site-url.ts`. It resolves in this order:

1. `NEXT_PUBLIC_SITE_URL` (explicit, always wins)
2. `VERCEL_PROJECT_PRODUCTION_URL` (Vercel production domain)
3. `VERCEL_URL` (Vercel deployment host)
4. `http://localhost:3000` (local development)

Values are normalized to a bare origin: `https://` is added when a scheme is
missing, and paths and trailing slashes are dropped. No domain is hard-coded
anywhere else.

**Reasoning:** The production domain is not chosen yet. Deploying to Vercel
without configuration must not produce localhost canonicals, but a
Vercel-generated host must never override the real domain once it exists.

**Consequences:**
- `NEXT_PUBLIC_SITE_URL` must be set to the real canonical domain once a
  custom production domain is chosen.
- Any new absolute-URL feature must use `getSiteUrl()` or `absoluteUrl()`.

---

## D009 — PDF compression modes and engine

**Status:** Accepted

**Decision:** `/compress-pdf` offers exactly three modes with fixed
semantics. Preserve is a lossless qpdf rewrite. Balanced is Preserve plus
qpdf's `--optimize-images`, which may recompress embedded images but never
touches page content. Maximum rasterises every page with PDF.js and
rebuilds the PDF with jsPDF, and the UI states before conversion that text,
links and forms may be lost. qpdf runs as WebAssembly (`qpdf-run`) in a Web
Worker served from `public/qpdf/`; no other PDF optimiser is added. In
every mode a result that is not smaller than the input is replaced by the
original and labelled already optimized.

**Reasoning:** Users need to know whether a compressed PDF is still a
document or has become a set of pictures. Naming the trade-off as a mode,
rather than a single "compress" button that silently chooses, keeps
privacy and honesty claims true. qpdf is the maintained, standard PDF
rewriting engine; `qpdf-run` wraps the current qpdf in a worker with a
byte-array API and needs no CDN.

**Consequences:**
- Digital signatures are invalidated by every mode; the FAQ says so and
  no signature preservation is attempted.
- qpdf cannot be interrupted mid-command; cancellation terminates the
  worker and the next run pays the worker start-up again.
- Password-protected PDFs are rejected rather than unlocked.
- Adding a mode means adding a config entry in `modes.ts` and, if it needs a
  new engine, a new decision entry.

---

## D010 — Public brand FileHush and domain filehush.org

**Status:** Accepted

**Decision:** The product's public brand is **FileHush** and its production
domain is **filehush.org**. The brand promise is "Free file tools. No
sign-up. Your files never leave your device." The repository, npm package
and project folder keep the technical name `file-converter-web`; internal
identifiers are not renamed. The domain reaches the app only through
`NEXT_PUBLIC_SITE_URL` (D008) and is never hard-coded in application code.

**Reasoning:** The product needed a memorable name and a canonical domain
before search traffic exists. Keeping the technical name avoids churn in
tooling, history and paths for no user benefit.

**Consequences:**
- `siteConfig.name` in `src/lib/seo/site-config.ts` is the single source of
  the brand for the header, footer, titles and Open Graph.
- Production deployments set `NEXT_PUBLIC_SITE_URL=https://filehush.org`.
- Marketing copy leads with the three benefits (free, no sign-up, local
  processing) and uses only technically accurate privacy wording, as
  described in [product.md](product.md).

---

## D011 — Public trust pages, operator identity, and no governing law

**Status:** Accepted

**Decision:** FileHush publishes three non-tool pages — `/privacy`, `/terms`
and `/contact` — as Server Components sharing one prose frame
(`src/components/content/text-page.tsx`) and one registry
(`src/lib/site-pages.ts`), which also drives the footer links and their
sitemap entries. The operator is named as **Sallar Hussain Bhutto**, an
individual rather than a company, and **sallar0501@gmail.com** is the only
public contact address; both live in `siteConfig`. Contact is an email
address only: no form, no route handler, no server action, no third-party
form service.

The Terms deliberately state **no governing-law jurisdiction and no forum**.
Limitations are qualified with "to the maximum extent permitted by applicable
law" and a clause confirming that rights which cannot lawfully be excluded
are unaffected.

**Reasoning:** A public launch needs a privacy policy and terms, and the
privacy copy is only defensible because D001 keeps processing in the browser.
The pages were written from a verified audit of the codebase — no analytics,
advertising, trackers, cookies, browser storage, accounts, route handlers or
outbound requests — rather than from a template, so every claim is currently
true. Naming a jurisdiction was deferred: the product has no users, no
revenue and no legal advice behind it yet, and a wrong choice is worse than
none.

**Consequences:**
- The Privacy Policy describes **current** behaviour. Introducing analytics,
  advertising, accounts, cookies, browser storage, an embedded third-party
  service, or any server-side handling of files requires updating
  `/privacy` (and `/terms` where relevant) and moving
  `siteConfig.legalEffectiveDate` **in the same change**.
- `siteConfig.legalEffectiveDate` is a fixed human-readable date, not a build
  timestamp, so it changes only when wording changes.
- Vercel is named as the host. Adding another provider that receives visitor
  information means naming it in the Privacy Policy.
- A governing-law and dispute-resolution clause is an open item to revisit
  with legal advice; adding one requires a new decision entry.
- The three routes are indexable at sitemap priority 0.3 and are not in the
  tool registry or the tools menu.

---

## D012 — Vercel Web Analytics

**Status:** Accepted

**Decision:** FileHush uses Vercel Web Analytics (`@vercel/analytics`) for
aggregate page-view measurement. `<Analytics />` from
`@vercel/analytics/next` is mounted once at the end of `<body>` in
`src/app/layout.tsx`, so every route is covered and no page opts in
individually. No other analytics product is added, and no custom events are
sent. The Analytics section of `/privacy` was rewritten in the same change,
as D011 requires.

**Reasoning:** Launch needs a basic answer to "is anyone using this, and
which tools?". Vercel Web Analytics is the lightest option that does not
compromise the product's privacy position: it is cookieless, stores nothing
in the browser, needs no consent banner, and its script is served
first-party from `/_vercel/insights/script.js` by the host already named in
the policy, so no new third party enters the picture.

**Consequences:**
- It measures pages, not files. User files are never transmitted, so no
  filename, size or content can reach it. Custom events must never carry
  such data; adding events at all requires a new decision entry.
- The cookie and browser-storage claims in `/privacy` remain true and were
  verified against the package: it references no cookie or storage API.
- It is active only on Vercel deployments; locally it is inert.
- Switching to, or adding, an analytics product that sets cookies or builds
  profiles would require a new decision entry, a policy rewrite and probably
  a consent mechanism.

