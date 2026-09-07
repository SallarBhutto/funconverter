# FileHush — Coding Standards

Concise rules for code written in this repository. Architecture boundaries
are in [architecture.md](architecture.md); test expectations in
[testing.md](testing.md).

## TypeScript

- strict mode on
- avoid `any`; use `unknown` and narrow
- prefer explicit domain types (`SupportedImageFormat`, `ConversionResult`,
  `QualityPreset`) over loose strings and objects
- validate untrusted input (file type, size, page counts, user options)
- do not silence TypeScript errors with casts or `@ts-ignore` unless the
  reason is documented inline

## React / Next.js

- Server Components by default
- `"use client"` only when the component needs browser APIs, file access,
  canvas, workers, or interactive state
- small, focused components
- avoid giant page components; compose the page from sections
- avoid excessive global state; tool state lives in the tool feature
- colocate feature-specific logic with the feature
- extract shared components only when they are genuinely shared by more than
  one tool

## Processing Logic

- keep PDF/image processing outside JSX-heavy UI components
- write pure utilities where possible
- processing code exposes clear inputs and outputs (file in, Blob/result out,
  progress callback)
- processing code must not depend on React
- errors map into user-friendly error states, not raw exceptions in the UI

## Dependencies

Before adding a dependency:

1. check whether the platform or browser already solves the problem
2. prefer established, actively maintained packages
3. consider bundle size and whether it can be lazy-loaded
4. avoid duplicate-purpose packages
5. explain meaningful dependency additions in the commit or PR

Heavy processing libraries are loaded on demand, never in the shared layout.

## Code Hygiene

- no commented-out code
- no debug console spam
- no committed secrets
- no generated user files or test outputs
- no unused dependencies
- meaningful names
- avoid clever abstractions with little benefit

## Error Handling

Users receive understandable messages, for example "This PDF is
password-protected" or "This file is too large to process in the browser".

Never expose:

- stack traces
- internal implementation errors
- cryptic library errors

when a clearer message can be provided.

## Completion Criteria

Before declaring an implementation task complete:

- lint passes
- TypeScript passes
- relevant tests pass
- production build passes
- obvious browser console errors are addressed
- the feature is manually reasoned through for large-file and memory
  implications against the checklist in [architecture.md](architecture.md)
