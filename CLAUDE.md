# FileHush — Project Memory

FileHush (repository `file-converter-web`) is a free, privacy-first, browser-based
collection of file conversion and compression tools. Free to use, no sign-up,
and files are processed locally in the user's browser. They never leave the device.

`AGENTS.md` is managed by Next.js and is not part of this knowledge base.

## Knowledge Base

@docs/product.md
@docs/architecture.md
@docs/seo.md
@docs/coding-standards.md
@docs/ui-ux.md
@docs/testing.md
@docs/roadmap.md
@docs/decisions.md

## Critical Project Rules

1. Read the relevant knowledge-base files before planning or implementing a feature.
2. User files must never be uploaded to our servers as part of conversion or compression.
3. File conversion and compression must happen locally in the user's browser unless the architecture is explicitly changed in a future approved decision recorded in `docs/decisions.md`.
4. Do not introduce any of the following unless explicitly requested:
   - backend file processing
   - file upload APIs
   - cloud storage for user files
   - conversion queues
   - databases for conversion state
5. Privacy claims in the UI must remain technically true.
6. SEO is a first-class product requirement, not an afterthought.
7. Use Next.js Server Components by default when application development begins.
8. Client Components are limited to functionality that genuinely requires:
   - browser APIs
   - file access
   - canvas
   - workers
   - interactive state
9. Keep heavy file-processing libraries (PDF.js, PDF generation, encoders) out of the initial page bundle where practical. Lazy-load them on demand.
10. Conversion logic must be separated from React presentation code.
11. Avoid premature abstractions and unnecessary dependencies.
12. Performance, memory usage, accessibility, SEO, and mobile usability are product requirements.
13. Never create fake routes, dead links, fake tool functionality, fake reviews, fake ratings, or misleading SEO pages.
14. Before considering a coding task complete, run the relevant:
    - lint
    - typecheck
    - tests
    - production build
15. If a task changes an architectural or product decision, update the relevant documentation and add a new entry to `docs/decisions.md`.
16. `/privacy` and `/terms` describe current behaviour. If a change introduces
    analytics, advertising, accounts, cookies, browser storage, an embedded
    third-party service, or any server-side handling of user files, update
    those pages and move `siteConfig.legalEffectiveDate` in the same task.
17. The only publishable contact address is `siteConfig.contactEmail`, and the
    only named operator is `siteConfig.operator`. Never publish a company
    name, address, phone number, or an email taken from git history or local
    configuration.
