# FileHush — UI / UX

Design and interaction guide. Product principles are in
[product.md](product.md); accessibility and performance are product
requirements, not polish.

## Design Direction

The application should feel:

- clean
- modern
- professional
- trustworthy
- minimal
- calm
- fast

Avoid:

- spammy converter-site appearance
- flashing UI
- excessive gradients
- giant decorative graphics
- unnecessary animations
- fake urgency
- fake download buttons
- crowded advertising
- excessive modal dialogs

## Tool Page Priority

The converter/compressor is the primary product. Visual hierarchy:

```text
What this tool does
        ↓
File input
        ↓
Important options
        ↓
Primary action
        ↓
Progress
        ↓
Results
        ↓
Supporting content
```

Supporting SEO content (how-to, FAQ, related tools) sits below the tool.

## File Dropzone

Must:

- support click-to-select
- support drag/drop on desktop
- work without drag/drop on mobile
- clearly show accepted formats
- clearly show the selected file (name, size)
- allow removal/reset

## Controls

Do not expose overly technical settings by default. Prefer named presets:

```text
Smaller File
Balanced
Best Quality
```

instead of forcing users to understand raw encoder parameters. Advanced
controls can be added where genuinely useful, collapsed by default.

## Progress

Long-running operations show meaningful progress:

```text
Converting page 7 of 32
```

plus a visual progress indicator. The UI must remain responsive during
processing, and the user should be able to cancel where feasible.

## Results

Results make it obvious:

- what was generated
- how large the output is, where useful (and the size reduction for
  compression tools)
- how to download an individual result
- how to download everything (ZIP for multi-file output)

There is one primary CTA. No misleading competing CTAs.

## Mobile

Design mobile-first enough that:

- no horizontal scrolling occurs
- touch targets are comfortable
- file selection is easy
- previews fit the viewport
- settings remain usable
- primary actions remain prominent

## Accessibility

Required:

- keyboard support for the whole flow
- visible focus states
- semantic labels on inputs and controls
- readable contrast
- accessible progress (`role="progressbar"` or live region updates)
- accessible error messages (announced, associated with the control)
- normal file-picker alternative to drag/drop

## Privacy Messaging

Privacy reassurance should be visible near the conversion workflow, for example
next to or below the dropzone:

- Processed locally in your browser
- Your files never leave your device

Say it once near the tool and once in the page's privacy section. Do not
repeat it in every section.

## Future Advertising

Ads are not implemented (see [product.md](product.md)). When they are, they
must remain visually separate from application controls. Never place
advertisements:

- inside the dropzone
- directly beside the primary download CTA
- between settings and the Convert action
- in modal dialogs
- disguised as tool actions
