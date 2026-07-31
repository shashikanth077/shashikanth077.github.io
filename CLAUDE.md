# Project: shashikanth077.github.io

This repo contains two independently built projects deployed to a single GitHub Pages site:

## 1. Portfolio (root)
- **Stack**: Next.js (Pages Router), React, CSS Modules
- **Build**: `npm run export` → `out/`
- **Node**: 18 (pinned in CI)
- **Entry**: `pages/index.js`

## 2. ToolNest — Browser-First Tools Platform (`/tools`)
- **Stack**: Vite 7.3, React 19, TypeScript 5.7 (strict, `noUncheckedIndexedAccess`), Module Federation
- **Build**: `cd tools && npm run build` → assembled into `out/tools/`
- **Node**: 22 LTS
- **Dev**: `cd tools && npm run dev` (shell on :5000, utility-tools on :5001, pdf-tools on :5002, image-tools on :5003)
- **Typecheck**: `cd tools && npm run typecheck`

### Architecture
```
tools/
├── apps/
│   ├── shell/           # MF host — routing, layout, header, sidebar, theme
│   ├── utility-tools/   # MF remote — dev tools, QR/barcode, health calculators, unit converter
│   ├── pdf-tools/       # MF remote — PDF merge/split/convert/compress/unlock
│   └── image-tools/     # MF remote — image convert/resize/compress
├── libs/
│   ├── tools-core/      # Pure logic: route manifest, unit conversion, health math (zero React imports)
│   ├── ui/              # Shared components (Button, Panel, Note, ToolFrame, CopyButton), design tokens, CSS
│   └── shell-contract/  # Shell↔remote interface (navigate, toast, theme)
└── scripts/
    └── postbuild.mjs    # Assembles shell + remotes into out/tools/, prerenders 38 pages for SEO
```

### Key conventions
- **Route manifest**: `libs/tools-core/src/routes.ts` — single source of truth for all tool routes, consumed by router, sidebar, and prerender script
- **Toolkit color system**: Each toolkit has `--tk-{name}`, `--tk-{name}-soft`, `--tk-{name}-glow` tokens in `libs/ui/src/tokens.css`, mapped via `.tk-{name}` class in `shell.css`
- **Toolkits**: `health` (teal), `pdf` (red), `image` (green), `qr` (purple), `dev` (blue)
- **CSS class prefix**: `dt-` for shared UI primitives, `uc-` for unit converter, `hc-` for health calculators
- **No `color-mix()` CSS**: replaced everywhere with token fallbacks for Safari <16.2 compat
- **Health math**: `libs/tools-core/src/health.ts` — pure functions for BMI, BMR, TDEE, body fat (Navy), LBM, ideal weight, WHR, WHtR, BSA
- **Privacy badge**: All tools show "runs in your browser" — this is true by construction (no backend)

### Adding a new tool
1. Define the route in `libs/tools-core/src/routes.ts` (slug, name, toolkit, category, remote)
2. Create the component in the appropriate remote's `src/tools/` directory
3. Add lazy import in that remote's `src/expose/ToolRoutes.tsx`
4. Run `npm run build` — `postbuild.mjs` automatically prerenders the new page and adds it to the sitemap

### CI/CD
- GitHub Actions: portfolio builds with Node 18, tools build with Node 22
- Portfolio builds first (`npm run export` → `out/`), then tools build copies into `out/tools/`
- Deployed to GitHub Pages

### Process
- Push directly to master for fixes and features
- Always run `npm run typecheck` and `npm run build` before pushing
- 38 prerendered pages currently (1 hidden: edit-pdf)
