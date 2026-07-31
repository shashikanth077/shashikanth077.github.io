# ToolNest

A micro-frontend developer-tools platform. Every tool runs entirely in the browser — no backend,
no account, and no file ever leaves the user's machine.

**Live:** [shashikanth077.github.io/tools](https://shashikanth077.github.io/tools/)  
**Stack:** React 19 · TypeScript 5.7 · Vite 7 · Module Federation · Redux Toolkit · React Router 7  
**Hosting:** GitHub Pages — static files, zero cost, genuinely private by construction

---

## Contents

- [Quick start](#quick-start)
- [Tool catalogue](#tool-catalogue)
- [Technical design](#technical-design)
  - [Why static / browser-only](#why-static--browser-only)
  - [Workspace layout](#workspace-layout)
  - [Module Federation architecture](#module-federation-architecture)
  - [Design system](#design-system)
  - [Routing and render pipeline](#routing-and-render-pipeline)
  - [State management](#state-management)
  - [Key library decisions](#key-library-decisions)
  - [The compromised conversions](#the-compromised-conversions)
  - [CI / deployment](#ci--deployment)

---

## Quick start

Requires **Node ≥ 20.19** (Vite 7 refuses Node 18).

```bash
npm install
npm run dev
```

| Service | URL |
|---|---|
| Shell (full app) | http://localhost:5000/tools/ |
| utility-tools remote | http://localhost:5001/ |
| pdf-tools remote | http://localhost:5002/ |
| image-tools remote | http://localhost:5003/ |

```bash
npm run typecheck   # strict, with noUncheckedIndexedAccess
npm test            # 16 guards on the prerender/SEO pipeline (no build needed)
npm run build       # remotes → shell → assemble + prerender into ../out/tools
```

To verify a production build the way GitHub Pages serves it — no SPA fallback, no rewrites:

```bash
node scripts/serve-static.mjs   # http://localhost:4173/tools/
```

`npm run build` requires `../out/` to exist before it runs — the portfolio's `next export` writes
`out/` wholesale and would delete `out/tools` if it ran second. The CI workflow enforces that order.

---

## Tool catalogue

**24 tools across 4 toolkits.**

### 📄 PDF Toolkit

| Tool | Category | What it does |
|---|---|---|
| Merge PDF | Organize | Combine multiple PDFs into one |
| Split PDF | Organize | Split by page ranges into separate files |
| Delete PDF Pages | Organize | Remove selected pages |
| Rotate PDF | Organize | Rotate all or selected pages |
| Images to PDF | Convert | Embed JPG/PNG into a PDF with layout control |
| PDF to Images | Convert | Rasterise each page to PNG |
| PDF to Text | Convert | Extract selectable text as `.txt` |
| PDF to Word | Convert | Rebuild text as a `.docx` — layout approximated |
| Word to PDF | Convert | Rasterise DOCX via html2canvas or print-engine path |
| Word to HTML | Convert | Export DOCX structure as clean HTML |
| Compress PDF | Optimize | Rasterise pages to JPEG and rebuild |
| Unlock PDF | Security | Strip owner-password restriction flags |

### 🖼️ Image Toolkit

| Tool | Category | What it does |
|---|---|---|
| Image Converter | Transform | JPG ↔ PNG ↔ WebP ↔ AVIF with quality control |
| Image Resizer | Transform | Resize by pixel dimensions or percentage |
| Image Compressor | Optimize | Quality-reduce JPEG/WebP via Canvas |

### 📱 QR & Barcode

| Tool | Category | What it does |
|---|---|---|
| QR Code Generator | Generators | URL/text → QR as PNG or SVG |
| Barcode Generator | Generators | 50+ symbologies via bwip-js |

### ⚡ Developer Toolkit

| Tool | Category | What it does |
|---|---|---|
| JWT Decoder | Inspection | Decode and verify structure of any JWT |
| UUID Generator | Generators | Generate v4 UUIDs in bulk |
| Base64 Encoder / Decoder | Encoding | Encode or decode Base64 text or files |
| URL Encoder / Decoder | Encoding | Percent-encode or decode URL strings |
| JSON Formatter | Formatting | Pretty-print and minify JSON |
| JSON Schema Validator | Inspection | Validate JSON against a schema using Ajv |
| Markdown Preview | Formatting | Live Markdown → sanitised HTML preview |

---

---

## Technical design

### Why static / browser-only

The original design called for a nine-service backend (workers, Redis, Postgres, S3). GitHub Pages
serves static files only — none of that could run — but the useful half never needed it.

Sorting the tool catalogue by *where the computation actually belongs*:

| Computation type | Examples | Where |
|---|---|---|
| Pure encoding / parsing | JWT, UUID, Base64, URL, JSON, Markdown | Browser |
| Document structure | PDF merge, split, rotate, page ops | Browser (`pdf-lib`) |
| Rasterising / parsing | PDF → images/text, DOCX → HTML | Browser (`pdfjs-dist`, `mammoth`) |
| Image processing | Convert, resize, compress | Browser (Canvas API) |
| Code generation | QR, barcodes | Browser (`qrcode`, `bwip-js`) |
| Native binaries | OCR, Ghostscript compression, true DOCX↔PDF | Server — **omitted or approximated** |

The browser-only constraint is also the privacy guarantee. Putting a UUID generator behind an API
gateway makes it slower, less private, and more expensive — the same argument holds surprisingly far
up the stack. Page-level PDF surgery is pure object-graph editing; `pdf-lib` does it losslessly
without touching a content stream.

---

### Workspace layout

```
tools/
├── apps/
│   ├── shell/              MF host — routing, layout, Redux store, error boundaries
│   ├── utility-tools/      MF remote — 7 encoding/format/generator tools
│   ├── pdf-tools/          MF remote — 12 PDF and Word tools
│   └── image-tools/        MF remote — 3 image processing tools
├── libs/
│   ├── tools-core/         Pure tool logic — zero React imports
│   ├── ui/                 Design tokens, primitives, FileDrop, ResultGrid
│   └── shell-contract/     The only interface a remote may use to reach the shell
└── scripts/
    ├── postbuild.mjs       Assembles out/tools + prerenders one page per route
    ├── postbuild.test.mjs  16 inline tests guarding the SEO rewrite pipeline
    └── serve-static.mjs    Local production simulation (no SPA fallback)
```

**`libs/tools-core` imports no React.** That keeps every tool function unit-testable without a DOM
renderer and means a tool's core logic can move behind an API later without being rewritten.

**`libs/shell-contract` is kept intentionally tiny** (`navigate`, `toast`, `theme`). Every
capability added there becomes a coupling point across all remotes — a wide shared surface is what
turns separately-deployed artefacts into a distributed monolith.

---

### Module Federation architecture

```
Browser
│
├─ /tools/                          Shell (host) — port 5000 in dev
│   ├─ Header, Layout, Footer
│   ├─ Redux store + router
│   └─ <ToolPage slug="merge-pdf">
│          │
│          └─ runtime fetch ──────► /tools/pdf-tools/remoteEntry.js
│                                    └─ <ToolRoutes slug="merge-pdf">
│                                         └─ lazy import MergePdf chunk
│
├─ /tools/utility-tools/            Standalone remote — port 5001 in dev
├─ /tools/pdf-tools/                Standalone remote — port 5002 in dev
└─ /tools/image-tools/              Standalone remote — port 5003 in dev
```

**How a tool renders (request path):**

1. Shell matches `/tools/:slug` via React Router, reads the slug from the route manifest.
2. `ToolPage` lazily imports `<remote>/ToolRoutes` — the remote chunk is fetched from
   `/tools/<remote>/remoteEntry.js` at runtime.
3. The remote maps the slug to a lazily-imported component (per-tool code splitting). bwip-js is
   1.2 MB and pdfjs-dist is ~350 KB — neither reaches a user who never opens that tool.
4. An `ErrorBoundary` wraps the remote. If the fetch fails, that one route degrades; the rest of
   the app keeps working.

**Adding a tool** means adding one entry in `libs/tools-core/src/routes.ts` and one entry in the
remote's `ToolRoutes.tsx`. The shell never changes.

#### Shared singleton dependencies

`react`, `react-dom`, and `react-router-dom` are shared as `singleton: true, strictVersion: true`.

Without this, a version drift silently loads a second React copy; the failure mode is
`Invalid hook call` mid-render — hard to diagnose. With `strictVersion: true`, the version
mismatch fails loudly at module-federation load time instead, making the root cause obvious.

#### On the micro-frontend scale decision

At 24 tools built by one person, this is deliberately over-engineered. Micro-frontends solve an
*organisational* problem — independent teams shipping on independent cadences. A modular monolith
with route-level code splitting would have shipped faster and been simpler to maintain.

It is built this way to exercise Module Federation properly. The structure is honest about it: the
remotes cannot import from each other, the shell↔remote interface is a single versioned contract,
and each remote runs standalone in dev. The threshold where this pattern genuinely pays off is
roughly three or more teams on separate release cadences, or one part of the UI pinned to a
different framework version.

One caveat stated plainly: because everything deploys from a single pipeline to a single static
host, independent deployability is **structural, not operational**. Each remote would need its own
repository and workflow for that to be real.

---

### Design system

#### Toolkit colour system

Each toolkit has its own named colour applied via a CSS utility class (`.tk-pdf`, `.tk-image`,
`.tk-qr`, `.tk-dev`). These classes set three CSS custom properties that cascade into every
child component: the base colour, a soft fill (used for icon backgrounds), and a glow tint (used
for hover shadows and active rings).

```
Utility class         CSS variables set
──────────────────    ─────────────────────────────────────────
.tk-pdf               --tk: var(--tk-pdf)
                      --tk-soft: var(--tk-pdf-soft)
                      --tk-glow: var(--tk-pdf-glow)

.tk-image             --tk: var(--tk-image) …
.tk-qr                --tk: var(--tk-qr)   …
.tk-dev               --tk: var(--tk-dev)  …
```

Components that need a toolkit colour read `var(--tk)` — they never reference a toolkit by name.
Wrapping a component in `.tk-pdf` or `.tk-image` changes its accent without touching the component.

#### Colour tokens (light / dark)

| Toolkit | Light mode | Dark mode |
|---|---|---|
| PDF | `#E8505B` | `#FB7185` |
| Image | `#10B981` | `#34D399` |
| QR & Barcode | `#8B5CF6` | `#A78BFA` |
| Developer | `#3B82F6` | `#60A5FA` |

Soft fills and glow tints are independently defined for both modes in `libs/ui/src/tokens.css`,
applied via `:root`, `@media (prefers-color-scheme: dark)`, `:root[data-theme="dark"]` and
`:root[data-theme="light"]`. The `data-theme` attribute wins in both directions, making the
theme toggle reliable without a flash on page load.

#### Typography and spacing

```
--font-ui:   system-ui stack (−apple-system, Segoe UI, Roboto …)
--font-mono: ui-monospace stack (SF Mono, Cascadia Mono, Consolas …)

Space scale: --space-1 (4px) → --space-8 (32px) in 4px steps
Border radius: --radius 8px · --radius-sm 6px
```

---

### Routing and render pipeline

GitHub Pages has no server-side rewrite rules. A direct hit on `/tools/jwt-decoder` returns a 404
unless a real file exists at that path.

**`scripts/postbuild.mjs`** solves this: after the Vite build, it writes a real `index.html` into
every route directory. Each file has the SPA shell HTML with per-tool metadata stamped in:

```
out/tools/
├── index.html                  → home page
├── routes.json                 → consumed by prerender script (plain Node, no TS)
├── merge-pdf/index.html        → title, description, canonical, JSON-LD
├── split-pdf/index.html
├── unlock-pdf/index.html
…24 tool pages total
```

Each prerendered page contains:

| Tag | Content |
|---|---|
| `<title>` | `{tool.name} — Free Online Tool` |
| `<meta name="description">` | From `routes.ts` `description` field |
| `<meta name="keywords">` | From `routes.ts` `keywords[]` |
| `<link rel="canonical">` | Full URL for that tool |
| `<meta property="og:*">` | Title, description, URL |
| JSON-LD `SoftwareApplication` | Structured data for rich results |

Client-side navigation updates `document.title` and the meta tags, so shared URLs stay accurate.
The `postbuild.test.mjs` script has 16 inline tests that run in CI (zero dependencies) to guard
this pipeline against regressions in the rewrite logic.

**Route manifest single source of truth:**  
`libs/tools-core/src/routes.ts` is the only place a tool route is defined. The shell router,
each remote's route table, the prerender script, and the sitemap all read from it — they cannot
drift.

---

### State management

| Layer | Technology | Scope |
|---|---|---|
| Theme + UI prefs | Redux Toolkit (`localStorage`) | Persisted across sessions |
| Recently used tools | Redux Toolkit (`localStorage`) | Persisted across sessions |
| Tool-local UI | React `useState` | Ephemeral, per tool |
| File state | `useFileList` hook (`ui` lib) | Per tool, cleared on navigate |
| Server state | TanStack Query | Wired but idle — no server to hit |

TanStack Query is included and wired but genuinely idle in the current build — there is no server,
so there is no server state to cache. It earns its place when a tool fetches a remote asset (a
WASM binary most likely).

Redux state is co-located in the shell (`apps/shell/src/store.ts`). Remotes read it through the
`shell-contract` — they never import from the shell directly. This maintains the one-way dependency
graph that makes independent deployability meaningful.

---

### Key library decisions

#### pdf-lib

Page-level operations (merge, split, rotate, delete, reorder, extract, unlock). Chosen because it
operates on the PDF object graph — text stays selectable, images keep original quality, and content
streams are never re-encoded. One important constraint: `PDFDocument.load()` with
`{ ignoreEncryption: true }` handles owner-password PDFs (permission flags) but throws when the
document requires a password to *open*. The unlock tool catches this at the `copyPages` call and
surfaces an actionable message.

#### pdfjs-dist

Rasterising (PDF → images, PDF → text extraction). Two non-obvious bugs worth knowing:

- **`canvas` and `canvasContext` are mutually exclusive.** `canvasContext` is the legacy path and
  requires `canvas: null`. Passing both leaves the render promise pending forever — no error, no
  rejection, just a hang.
- **Use `intent: "print"`, not the default `"display"`.** pdf.js drives its display-intent render
  loop with `requestAnimationFrame`. Browsers stop firing that in hidden tabs. A user who starts a
  long conversion and switches tabs watches it stall. `"print"` schedules with `setTimeout`.

Both are commented at the call site in `libs/tools-core/src/pdf-render.ts`.

#### bwip-js

Barcode generation (50+ symbologies). At 1.2 MB it is the largest dependency. It is lazily loaded
inside the barcode tool chunk and never touches users who don't open that tool. `sideEffects: false`
on `libs/tools-core/package.json` lets Rollup tree-shake bwip-js out of every tool bundle that
imports other functions from the lib.

#### mammoth

DOCX → HTML extraction. Used in both Word to HTML (direct output) and Word to PDF (rendered to
canvas). The HTML output is sanitised with DOMPurify before rendering — unsanitised DOCX content is
a stored-XSS vector.

#### marked + DOMPurify

Markdown preview. DOMPurify runs on every render pass. The Markdown Preview tool accepts arbitrary
user input, and `marked` outputs raw HTML — skipping sanitisation would be an XSS vulnerability.

#### qrcode

QR Code Generator. Tiny library, output as Canvas or SVG, no server roundtrip.

---

### The compromised conversions

Three tools ship but cannot fully match a server-side pipeline. Each carries a `caveat` in
`routes.ts` that renders as a `<Note>` at the top of the tool — the limitation is stated before
the user relies on the output, not discovered afterwards.

| Tool | What actually happens | What is lost |
|---|---|---|
| **PDF → Word** | Text extracted with pdfjs-dist, rebuilt as a `.docx` using `docx`. Paragraph breaks inferred from vertical glyph gaps. | Fonts, columns, tables, images, exact layout. Editable in Word — that is the real goal. |
| **Word → PDF** | Download path: rasterised via html2canvas to a jsPDF container — looks right, text becomes an image. Print path: hands the DOM to the browser's own print engine (real selectable text). | Word's exact pagination. The print path uses a browser dialog the tool cannot control. |
| **Compress PDF** | Pages rasterised to JPEG at a target quality, rebuilt with pdf-lib. Genuinely lossy and one-way. | Text selectability. On a text-only PDF the output is usually *larger*, not smaller — the tool reports actual before/after sizes. |

**Not shipped at all:** OCR (no scanned-PDF text recovery), and PDF password *cracking*. The Unlock
PDF tool only strips owner-password permission flags from files that already open without a
password. Cracking a user password would require GPU-accelerated brute force — a browser tool
cannot compete.

---

### CI / deployment

```yaml
# .github/workflows/deploy.yml (simplified)

# Step 1 — portfolio (Node 18, must run first)
- uses: actions/setup-node@v4
  with: { node-version: 18 }
- run: npm ci && npm run export   # writes out/

# Step 2 — tools (Node 22)
- uses: actions/setup-node@v4
  with: { node-version: 22 }
- run: npm ci --prefix tools && npm run build --prefix tools
  # writes out/tools/ — depends on out/ existing from step 1
```

**Order is load-bearing.** `next export` writes `out/` wholesale. If the tools build ran first, the
portfolio step would silently delete `out/tools`. The two `setup-node` steps use separate Node
versions in the same job, so there is no parallelism risk — step 2 always follows step 1.

Both steps are gated on `push` to `master` only (`build on all branches, deploy only from master`
is in the workflow header). Feature branches build but do not deploy.

The `feat/devtools-platform` branch is the development branch for this platform. Changes are merged
to `master` via pull request to trigger deployment.
