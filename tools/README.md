# DevTools Platform

A micro-frontend developer-tools platform. Every tool runs entirely in the browser — there is no
backend, no account, and no file ever leaves the user's machine.

Live at [shashikanth077.github.io/tools](https://shashikanth077.github.io/tools/). Deployed as
static files to GitHub Pages alongside the portfolio at the repo root, at zero hosting cost.

---

## Why it's built this way

The original design was a nine-service backend with workers, Redis, Postgres and S3. GitHub Pages
serves static files only, so none of that could run — but the useful half never needed it.

Sorting the tool catalogue by *where the work actually has to happen* was the decision that shaped
everything else:

| Category | Examples | Where |
| --- | --- | --- |
| Pure computation | JWT decode, UUID, Base64, URL, JSON, Markdown, QR, barcode | Browser |
| Document structure | PDF merge, split, rotate, delete pages, images→PDF | Browser (`pdf-lib`) |
| Rasterising / parsing | PDF→images, PDF→text, DOCX→HTML | Browser (`pdf.js`, `mammoth`) |
| Image processing | Convert, resize, compress | Browser (Canvas) |
| Native binaries | OCR, Ghostscript-grade compression, true DOCX↔PDF | Needs a server — **approximated or omitted** |

23 tools, none of which upload anything. Putting a UUID generator behind an API gateway makes it
slower, less private and more expensive than four lines of client-side code — and the same argument
holds surprisingly far up the stack: page-level PDF surgery is pure object-graph editing, and
`pdf-lib` does it losslessly without ever re-encoding a content stream.

Where the browser genuinely cannot match a server the tool still ships, but says exactly what it is
giving up. See [The compromised conversions](#the-compromised-conversions).

### On the micro-frontend split

At this scale it is over-engineered, deliberately. Micro-frontends solve an *organisational*
problem — independent teams shipping on independent cadences — and this is a one-person project. A
modular monolith with route-level code splitting would have shipped faster.

It is built this way to exercise Module Federation properly, and the structure is honest about it:
remotes cannot import from each other, the shell↔remote interface is a single versioned contract,
and each remote runs standalone. The threshold where this pattern genuinely pays for itself is
roughly three or more teams on separate release cadences, or one part of the UI pinned to a
different framework version.

One caveat worth stating plainly: because everything deploys from a single pipeline to a single
static host, independent deployability here is **structural, not operational**. Splitting each
remote into its own repository with its own workflow is what would make it real.

---

## Layout

```
tools/
├── apps/
│   ├── shell/              MF host — routing, layout, RTK store, error boundaries
│   ├── utility-tools/      MF remote — 9 encoding/format/generator tools
│   ├── pdf-tools/          MF remote — 11 PDF and Word tools
│   └── image-tools/        MF remote — 3 image tools
├── libs/
│   ├── tools-core/         Pure tool logic. No React import anywhere.
│   ├── ui/                 Design tokens, primitives, file drop / result grid
│   └── shell-contract/     The only interface a remote may use to reach the shell
└── scripts/postbuild.mjs   Assembles out/tools + prerenders one page per route
```

Each remote runs on its own dev port (5001–5003) and is independently loadable. The shell picks one
per route from the manifest's `remote` field and passes a slug — it never knows what a tool does.

`libs/tools-core` deliberately imports no React. That keeps every tool unit-testable without a DOM
renderer, and means a tool could move behind an API later without its logic being rewritten.

`libs/shell-contract` is kept intentionally tiny (`navigate`, `toast`, `theme`). Every capability
added there becomes a coupling point for every remote — a wide shared surface is what turns
separately-deployed artefacts into a distributed monolith.

---

## Running it

Requires **Node ≥ 20.19** (Vite 7 and `@module-federation/vite` both refuse Node 18).

```bash
npm install
npm run dev
```

- Shell: <http://localhost:5000/tools/>
- Remotes standalone: utility <http://localhost:5001/> · pdf <http://localhost:5002/> · image <http://localhost:5003/>

The dev server uses the same `/tools/` base as production on purpose. Diverging would hide
basename bugs until deploy, since every in-app link is router-relative.

```bash
npm run typecheck    # strict, with noUncheckedIndexedAccess
npm test             # guards the prerender rewrite (no deps, no build needed)
npm run build        # remote → shell → assemble + prerender into ../out/tools
```

To check a production build the way GitHub Pages serves it — no SPA fallback, no
rewrites, so a route only resolves if a real file exists:

```bash
node scripts/serve-static.mjs   # http://localhost:4173/tools/
```

`npm run build` requires `out/` to already exist — the portfolio's `next export` writes it wholesale
and would delete `out/tools` if it ran second. The CI workflow enforces that order.

---

## How a tool renders

1. Shell matches `/tools/:slug`, looks the slug up in the manifest, and renders `ToolPage`.
2. `ToolPage` lazily imports `<remote>/ToolRoutes` for that route's remote — fetched at runtime from
   `/tools/<remote>/remoteEntry.js`, so shipping a remote needs no shell rebuild. Only the remote a
   route actually names is ever downloaded; opening a PDF tool never fetches the image bundle.
3. The remote maps the slug to a lazily-imported component, so it splits into per-tool chunks rather
   than shipping all of them on first load. This matters here: bwip-js is 1.2 MB and pdf.js is
   ~350 KB, and neither reaches a user who doesn't open the tool that needs it.
4. An `ErrorBoundary` wraps the remote. If it fails to fetch, that one route degrades and the rest
   of the app keeps working — the main runtime payoff of loading remotes at runtime.

Adding a tool means editing the manifest and the remote's map. The shell never changes.

### Shared dependencies

`react`, `react-dom` and `react-router-dom` are shared as `singleton: true, strictVersion: true`.
Without this, a version drift silently loads a second React copy and surfaces later as
`Invalid hook call` mid-render. With it, the mismatch fails loudly at load time instead.

### State

- **Redux Toolkit** — theme, recently-used tools. Client state, persisted to `localStorage`.
- **TanStack Query** — wired but idle. There is no server, so there is no server state to cache.
  It earns its place when a tool fetches something remote (a WASM binary, most likely).
- **`useState`** — everything inside a single tool.

---

## SEO on a static host

GitHub Pages has no rewrite rules, so `/tools/jwt-decoder` would 404 — there is no file there.

`scripts/postbuild.mjs` writes a real `index.html` into every route directory, each with its own
title, description, canonical and `SoftwareApplication` JSON-LD. That fixes the 404 *and* gives
crawlers correct per-tool metadata on first byte, which the common `404.html` redirect trick cannot
do. Client-side navigation updates the same tags so shared URLs stay accurate.

Route definitions live once in `libs/tools-core/src/routes.ts`. The router, the remote, the
prerenderer and the sitemap all read from it, so they cannot drift. The build emits it as
`routes.json` because the prerender script is plain Node and cannot import TypeScript.

---

## The compromised conversions

Three tools do ship, but not at the quality a server-side pipeline would give. Each carries a
`caveat` in the route manifest that renders as a note at the top of the tool — the limitation is
stated before the user relies on the output, not discovered afterwards.

| Tool | What actually happens |
| --- | --- |
| **PDF → Word** | Text is extracted and rebuilt as a plain `.docx`. PDF stores positioned glyphs, not paragraphs, so paragraph breaks are inferred from vertical gaps. Fonts, columns and tables do not survive. Editable in Word, which is the real goal. |
| **Word → PDF** | Two paths. The download button rasterises via html2canvas — looks right, text becomes an image. **Print to PDF** hands it to the browser's own print engine, which produces real selectable text; the user picks the destination. Word's exact pagination cannot be reproduced. |
| **Compress PDF** | Rasterises pages to JPEG and rebuilds. Genuinely lossy and one-way. Good on scans; on a text PDF it usually makes the file **bigger**, and the tool says so with the actual numbers after it runs. |

Not shipped at all: OCR (no scanned-PDF text recovery), and PDF password *cracking* — the unlock
path only strips permission flags from files that already open without a password.

## Two things worth knowing about pdf.js

Both cost real debugging time, so they are commented at the call site in `pdf-render.ts`:

- **`canvas` and `canvasContext` are mutually exclusive.** `canvasContext` is the legacy path and
  requires `canvas: null`. Passing both leaves the render promise pending forever — no error, no
  rejection, just a hang.
- **`intent: "print"`, not the default `"display"`.** pdf.js drives its render loop with
  `requestAnimationFrame` for display intent, and browsers stop firing that in a hidden tab. A user
  who starts a long conversion and switches tabs would watch it stall. `"print"` schedules with
  `setTimeout`, and is the more accurate intent for output that becomes a file.
