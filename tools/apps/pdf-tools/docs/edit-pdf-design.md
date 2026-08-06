# Edit PDF — design document

Source of truth for rebuilding `edit-pdf` in the pattern of [Sejda's online PDF
editor](https://www.sejda.com/pdf-editor). Written before implementation so the
UI, data model, and phasing are decided once instead of drifting tool-by-tool.

## 1. What Sejda actually does (observed 2026-08-06)

Sejda's editor is a single full-width canvas app: a sticky icon toolbar above
the page stack, a bottom-sticky "Apply changes" CTA, and two floating icons on
the right edge (page grid, attachments). Every placed element gets its own
floating mini-toolbar directly above it while selected.

### Top toolbar (left → right)

| Tool | Behavior |
|---|---|
| **Text** (+ caret) | Click anywhere on a page → places an editable text box. Caret opens **Find & Replace**. Clicking *existing* text switches into edit mode for that run. |
| **Links** | Click-drag a rectangle → prompts for a URL or an internal page jump. Existing links become draggable/resizable boxes. |
| **Forms** ▾ | Two groups: *Add text & symbols* (free text, ✕, ✓, ●) and *Add new form fields* (Text, Text multiline, Drop-down list, Radio button, Checkbox, Signature box), plus *Change existing form fields* (Form Edit mode, Change tab order) and *Publish for others to fill & sign*. |
| **Images** ▾ | New Image (upload → place → drag to move, drag corners to resize), Delete existing image, New Stamp (preset stamps like "DRAFT", editable text stamps). |
| **Sign** ▾ | Shows previously-created signatures for one-click placement, plus **New Signature** → modal with **Type / Draw / Upload Image / Camera** tabs. Type tab: name field, 7-color swatch row, gallery of ~10 handwritten-style font previews. |
| **Whiteout** | Click-drag a rectangle → opaque white patch covering existing content (redaction-style cover, not true deletion of underlying content). |
| **Annotate** ▾ | *Show annotations* toggle. **Text** group (select a text run): Strike out, Highlight, Underline — each with a color swatch row. **Freehand** group: Highlight (drag a box) and Draw (freehand pen) — each with its own color row. |
| **Shapes** ▾ | Ellipse, Rectangle, Line, Arrow — click-drag to draw, border/fill color after placement. |
| Clear (✕) | Removes the selected element. |

### Per-page toolbar (repeats above every page)

Page number badge · Delete page · Zoom in · Zoom out · Rotate left · Rotate
right · **Insert page here** (blank page or upload).

### Floating per-element toolbar (appears above a selected element)

`B` `I` · font size ▾ · font family ▾ (huge list — Arial, Helvetica, Times New
Roman, Calibri, Poppins, Inter, Roboto, …) · text color (palette icon) · link
· move handle (drag) · duplicate · delete. This exact toolbar is the one
constant across every element type — text, image, shape, signature all reuse
its right-hand icons (move/duplicate/delete), swapping the left-hand icons for
type-specific controls (color only for shapes, none for images beyond
move/duplicate/delete/resize).

### Signature modal

`Create signature` header, four source tabs (Type / Draw / Upload Image /
Camera), a name textbox, 7 preset ink colors, and — only on the Type tab — a
grid of cursive/handwriting font previews rendered live from the typed name.

### Global chrome

- Right-edge floating buttons: page-thumbnail grid panel, attachments panel.
- Bottom-sticky bar: green **Apply changes ›** button — the only "commit"
  action; everything before it is a live, undoable in-browser edit.
- No autosave to a server: files are processed and then discarded (Sejda's
  own copy states "automatically deleted after 2 hours" — server-side, not
  applicable to us since nothing ever leaves the browser here).

## 2. What can and can't be cloned on this stack

This repo is 100% static (GitHub Pages), so every one of these tools already
runs client-only via `pdf-lib` (structure/writing) + `pdfjs-dist` (rendering,
text extraction). No backend means:

- **Achievable, matches Sejda 1:1 in behavior:** toolbar layout and grouping,
  floating per-element toolbar, add text/image/link/shape/whiteout/signature,
  annotate (highlight/strikeout/underline/draw), page tools (delete, rotate,
  insert, zoom), find & replace over extracted text, signature modal
  (type/draw/upload — camera omitted, see below).
- **Not offered:** "Publish for others to fill & sign" (needs hosted storage
  + a server to receive submissions) and Dropbox/Google Drive import (needs
  OAuth + a backend proxy). Both are cut from scope rather than faked.
- **Camera signature capture:** cut from Phase 1–3; `getUserMedia` works
  client-side but is a distinct chunk of UI/permissions work with low value
  next to Type/Draw/Upload. Candidate for a later phase.
- **Editing existing embedded text ("best-effort real edit", per product
  decision):** see §3 — this is the one area where Sejda's actual mechanism
  (server-side content-stream rewriting against un-subsetted fonts) has no
  safe client-side equivalent, so the fallback strategy below stands in for
  it.

## 3. Editing existing text — best-effort strategy

Sejda's backend can rewrite the literal `Tj`/`TJ` operators in a page's
content stream because it has full font-subset introspection and a mature PDF
graphics engine. `pdf-lib` does not expose content-stream *mutation* of
already-existing operators (only appending new drawing calls), and blindly
rewriting a subsetted font's glyph string client-side risks emitting glyph
codes the embedded font's subset doesn't contain — i.e. corrupted output.
Silently shipping that would violate the "without issues" bar more than being
upfront about the technique.

**Strategy — "patch and re-render", attempted per run, always safe:**

1. On PDF load, extract every text run per page via
   `page.getTextContent()` (already used in `pdf-render.ts` for
   `pdfToText`): string, transform matrix (position, scale, rotation), font
   name, approximate color (read from the render's fill state where pdf.js
   exposes it).
2. With the **Text** tool active, clicking inside an existing run's bounding
   box (computed from the transform + width/height) enters edit mode for
   that run — matching Sejda's "click any existing text to start editing".
3. On commit, two things are written to the output PDF:
   - a `pdf-lib` white/background-colored rectangle covering the *original*
     run's exact bounding box (sampled from the rendered page bitmap at that
     box's corner, so it matches the page background rather than assuming
     white — handles tinted or scanned backgrounds correctly), and
   - new text drawn with a standard font matched to the extracted run
     (serif/sans/mono/bold/italic detected from the font name string, mapped
     to pdf-lib's 14 standard fonts, or the closest of the handful of
     embeddable open-license fonts already used by the signature style
     gallery) at the same position, size, and best-effort color.
4. This is visually indistinguishable from true text editing in the normal
   case (unrotated, horizontal, standard-ish fonts — the overwhelming
   majority of real documents) and *never* corrupts the file, because nothing
   about the original content stream is touched — everything is strictly
   additive, the same safe primitive the rest of the editor already uses in
   `pdf-edit.ts`.
5. Where it visibly diverges from the source (an exotic embedded font, a
   rotated or vertical run, a run inside a Form XObject/clipped region) the
   UI says so at edit time ("Font matched approximately — original was
   embedded and can't be reproduced exactly") instead of pretending parity it
   can't deliver.

This is the literal reading of "best-effort": try to reproduce the real
edit faithfully, degrade visibly and honestly when the input doesn't allow it,
never corrupt the file.

## 4. Architecture

### Data model (`libs/tools-core/src/pdf-edit.ts`)

Extend the existing `Annotation` union (currently `text | pen | highlight`)
to the full element set. Each variant keeps the existing convention: PDF-space
coordinates (72pt/inch, bottom-left origin), flattened by one `flattenAnnotations`
pass at save time — nothing new architecturally, just more variants:

```ts
type Annotation =
  | TextAnnotation // extended: bold, italic, fontFamily, replaces?: OriginalRunRef
  | PenAnnotation // unchanged
  | HighlightAnnotation // unchanged (freehand-box highlight)
  | ImageAnnotation // x, y, width, height, imageBytes ref, rotation
  | ShapeAnnotation // kind: ellipse | rectangle | line | arrow; stroke/fill/width
  | LinkAnnotation // x, y, width, height, target: { url } | { page }
  | WhiteoutAnnotation // x, y, width, height, sampled background color
  | SignatureAnnotation // dataUrl (drawn/typed/uploaded), x, y, width, height
  | TextMarkupAnnotation // strikeout | highlight | underline over an extracted text run's quad
  | FormFieldAnnotation; // kind: text | multiline | dropdown | radio | checkbox; name
```

`OriginalRunRef` (page + run index into the extracted text-content cache) is
how a `TextAnnotation` records "this replaces run N" so `flattenAnnotations`
knows to draw the cover rectangle before drawing the new text.

### Component structure (`apps/pdf-tools/src/tools/EditPdf.tsx`)

The file is already large (1100 lines) covering one editor. Given the
5x growth in tool count, split before Phase 2 lands more variants:

```
tools/EditPdf.tsx          – page orchestration, history, save (stays)
tools/edit-pdf/Toolbar.tsx        – top icon toolbar + dropdowns
tools/edit-pdf/ElementToolbar.tsx – floating per-selection mini-toolbar
tools/edit-pdf/PageChrome.tsx     – per-page toolbar (delete/zoom/rotate/insert)
tools/edit-pdf/SignatureModal.tsx – Type/Draw/Upload signature creation
tools/edit-pdf/elements/*.tsx     – one file per annotation view (Text, Image, Shape, Link, Whiteout, Signature, Markup, FormField)
tools/edit-pdf/textRuns.ts        – extracted-run cache + hit-testing for "click existing text"
```

`libs/tools-core/src/pdf-edit.ts` grows drawing functions per variant but
keeps the same "pure, no React" shape it has today.

### Visual pattern → existing tokens

Sejda's icon-button toolbar maps directly onto tokens already in
`tokens.css` / `EditPdf.css` — no new color system needed:

- Toolbar background `var(--surface)`, sticky, `var(--shadow-sm)` — already
  the case.
- Active tool = `var(--accent)` fill (Sejda's blue ⇒ our emerald `--accent`,
  consistent with the rest of the platform per [feedback_browser_compat] and
  [feedback_design_quality] — we do **not** import Sejda's blue brand color).
- Dropdown panels: new `.pdfed__dropdown` using `var(--surface)` +
  `var(--line)` + `var(--shadow-md)`, same radius tokens as `Panel`.
- Floating element toolbar: same icon-button styling as the top toolbar,
  positioned via a small `position: absolute` offset above the selection's
  screen-space bounding box (already computable — `pdfToScreen` exists).
- No `color-mix()` — continues the existing constraint (Safari <16.2).

### Save flow

Unchanged: `flattenAnnotations(pdfBytes, annotations)` → one pdf-lib pass →
blob → download. "Apply changes" (Sejda's label, adopted verbatim since it
describes the action precisely — "Save & Download" merges two different
actions when whiteout/replace-text pre-composites content, which the current
label already correctly gates) stays as the single commit action.

## 5. Phased delivery

Each phase ships independently typechecked, built (`npm run build`), and
screenshotted in the running dev preview before the next starts.

**Phase 1 — toolbar shell + core placement tools — done (2026-08-06)**
Icon toolbar redesign (Text/Links/Images/Whiteout/Shapes + dropdowns),
floating per-element toolbar (move/duplicate/delete, replacing the current
click-to-select-only model), Image insert, Link insert, Shapes (ellipse/
rectangle/line/arrow), Whiteout. Existing Text/Pen/Highlight tools carry
over, restyled into the new toolbar.

**Phase 2 — Signatures + Annotate suite — done (2026-08-06)**
Signature modal (Type with a 6-style CSS-font handwriting gallery + 7-color
row, Draw via an in-modal canvas, Upload Image), Sign toolbar dropdown with
reusable signatures (persisted to `localStorage`, capped at 5), Annotate
dropdown (Show/Hide toggle, Strikeout/Highlight/Underline, Draw). Strikeout
and Underline landed as box-drag markup — the same primitive as Highlight,
rendering a line instead of a fill — rather than true text-run selection;
see the note at the top of Phase 2's implementation for why (no text-run
hit-testing engine exists yet; that's Phase 4's extraction work).

**Phase 3 — Forms + Find & Replace + page panel**
Form field placement (text/multiline/dropdown/radio/checkbox — visual +
flattening only, no "publish" flow per §2), Find & Replace over extracted
text, page-thumbnail side panel, per-page toolbar (delete/zoom/rotate/insert
page).

**Phase 4 — Best-effort existing-text edit**
The §3 patch-and-re-render pipeline: run extraction/hit-testing, click-to-edit
on existing text, background-color sampling, font-matching heuristic, and the
approximate-match disclosure UI.

This document covers Phases 1–4 end to end; implementation proceeds phase by
phase starting with Phase 1.
