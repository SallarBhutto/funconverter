# FileHush — Testing

Pragmatic strategy. Simple UI does not need excessive testing. Prioritize
high-value tests around logic that is easy to get wrong.

## Unit Tests

Good candidates:

- file validation
- MIME/extension validation
- size formatting
- filename generation (output names, ZIP names, collision handling)
- quality preset mapping (preset → encoder parameters)
- page-range logic, if introduced
- format mapping (tool → MIME type, extension, canvas encoder)
- pure compression/conversion configuration utilities

These live next to the code in `lib/` and should run in Node without a
browser.

## Feature Tests

Test critical user flows where practical:

```text
select valid file
→ options become available
→ process
→ result appears
```

Do not create brittle tests that deeply mock PDF.js internals without
meaningful benefit. Mock at the processing-service boundary defined in
[architecture.md](architecture.md), not inside the library.

## Browser Processing

Actual browser-specific processing (canvas encoding, PDF rendering) is covered
through integration/e2e tests selectively once functionality stabilizes.
Unit tests should not attempt to emulate canvas or worker behavior.

## Build Verification

Every meaningful coding task runs:

- lint
- typecheck
- tests
- production build

This matches the completion criteria in
[coding-standards.md](coding-standards.md).

## Future E2E

When the product has multiple tools, consider Playwright for important
workflows:

```text
open /pdf-to-jpg
→ upload fixture
→ convert
→ verify results
```

Keep test fixtures intentionally tiny (a one- or two-page PDF, small images).
Never commit real user documents as fixtures.
