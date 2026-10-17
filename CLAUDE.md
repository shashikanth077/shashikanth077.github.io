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

### Learning portal (`/resources`)
- Shell pages `Resources.tsx` (stack picker) and `ResourceStack.tsx` (workspace); UI in `apps/shell/src/learn/` (`lp-` CSS prefix in `learn.css`)
- Content is JSON per stack in `learn/content/`, lazy-loaded; progress is localStorage only (`toolnest-learn:<slug>`)
- **Add a stack**: `node scripts/import-handbook.mjs <handbook.html> <slug>` (from `tools/`), then add/enable the entry in `learn/catalog.ts` (`category`, `stats` + `load`; `patternsLabel` if the handbook has a PATD patterns section, as Redis does). Live: nodejs, redis Prerender + sitemap pick it up via `stacks.json`
- **Visuals**: every concept has an animated diagram, hand-authored per stack in `learn/visuals/<slug>.ts` (+ `<slug>/*.ts`), keyed by concept id. Types: sequence, flow (row/cycle), lanes, compare, layers, queue (live sim), trace, cells. Use the helpers in `visuals/kit.ts` (`seq`, `flow`, `lanes`, `compare`, `layers`, `queue`). `npm test` runs `scripts/visuals-check.mjs`, which validates specs and lists concepts still missing a diagram — add the stack to its `stacks` array and `loadVisuals` in `catalog.ts`
- Content JSON (`StackContent` in `learn/types.ts`) is the seam for a future backend: swap a stack's `load()` for an API fetch without touching the views
- Importer expects the handbook's `/* ===== DATA` … `/* ===== ENGINE` JS arrays; missing optional sections are simply hidden

### AI Atlas (`/ai`) — separate menu, same workspace
- Header/mobile/home entry "AI Atlas" → `pages/AiAtlas.tsx` (roadmap of tracks by stage). A track opens in the same `ResourceStack` workspace at `/ai/<slug>`; `Stack.section` ("dev" | "ai") in `learn/catalog.ts` decides the base path (`stackPath()`); roadmap order = `AI_STAGES` (Foundations, Core machine learning, Modern AI, Real-world projects)
- **Atlas home** (`AiAtlas.tsx` + `learn/atlas.css`, `ai-` prefix): hero with live totals, 4 guided paths (`PATHS`), searchable/filterable track grid with progress bars from localStorage `toolnest-learn:<slug>`, and a "coming soon" real-time project scenarios banner (`PROJECTS`). Tracks without `load` render as dashed coming-soon cards; `PROJECTS` cards with a `slug` link to a live scenario track (badge + "Open the scenario"); `real-time-ai-projects` ("More real-time AI scenarios") stays a planned entry (not in sitemap) listing the scenarios still to build
- Live: python-ai, maths-ai, numpy, matplotlib, pandas, scikit-learn, machine-learning, neural-networks, nlp, reinforcement-learning, computer-vision, speech-processing, generative-ai, agentic-ai, building-with-claude, langchain-langgraph-rag, plus the first Real-world project **fraud-detection**. Only the "More real-time AI scenarios" card is still coming soon
- `Stack.labels` re-words the workspace per stack (e.g. Python for AI: "In AI work", "Predict the output")
- **Hand-authored tracks** (not imported): write `learn/author/<slug>/*.ts` using `author/build.ts` (`ConceptDef` = concept + its diagram together; `py` tag keeps backslashes in Python code), assemble in `learn/content/<slug>.ts`, add to `stacks` in `scripts/visuals-check.mjs`. `npm test` validates diagrams and rewrites `<slug>.stats.json`
- **Generated outputs** (library tracks like NumPy and Matplotlib; the runner sets `MPLBACKEND=Agg`, so chart code runs headless and only `print()` output is captured): the Output panels are NOT typed by hand — `npm run outputs -- <slug>` runs every example with real Python/NumPy and writes `content/<slug>.outputs.json` (also runs all drills/exercises); `npm test` fails if one is missing. Re-run after editing any example code
- **machine-learning** is a concept-and-maths track (123 concepts, 11 areas, `learn/author/ml/`): every worked calculation is plain NumPy so outputs ARE generated (`generatedOutputs: true`). Its diagrams use equal-aspect plots (`eqX` in `ml/data.ts`) so circles stay round, and `defs`-generated formulas (kNN voting, DBSCAN roles). Avoid `{x:0}` in readouts — the template strips trailing zeros (`20` → `2`); use `{round(x)}`
- **neural-networks** (101 concepts, 13 areas, `learn/author/nn/`): foundations, training, generalise, eval, cnn, seq, gen, practice. Plain NumPy only (no TensorFlow/PyTorch installed), so outputs are generated (`npm run outputs -- neural-networks`). The expression evaluator has no comparison operators — use `step(a-b)` (true when > 0; add `+0.0001` for ≥). `rowflow()` helpers in cnn/seq/gen wrap `flow` (notes must equal the number of edges). Drill answers were verified by running the code
- **nlp** (57 concepts, 9 areas, `learn/author/nlp/`: text, tasks, models, practice + `util.ts` `rowflow`): written from a course outline, no source files. Plain Python/NumPy so outputs are generated (`npm run outputs -- nlp`); `compare` rows are `[label, ...cells]` with cells = number of headers
- **reinforcement-learning** (51 concepts, 8 areas, `learn/author/rl/`: basics, dp, td, policy, practice; `rowflow` is imported from `nlp/util.ts`): plain NumPy; gridworld/cliff-walking/bandit examples are simulated with fixed seeds and the visuals quote the generated numbers, so re-check them after editing code. The evaluator has no `lgamma`/comparisons: use `pow`, `step`, `min`, `max`
- **computer-vision** (57 concepts, 10 areas, `learn/author/cv/`: basics, classic, deep, practice): plain NumPy on tiny arrays (no OpenCV/PyTorch installed); the segmentation export is `segm` because `seg` is also the diagram helper. Visual numbers quote generated outputs, so re-check them after editing code
- **speech-processing** (49 concepts, 8 areas, `learn/author/speech/`: signal, features, models, practice): all examples synthesise tiny signals with NumPy (np.fft, no librosa); toy numbers in visuals (DFT, mel edges, CTC counts, EER, DER) are quoted from the generated outputs
- **generative-ai** (61 concepts, 10 areas, `learn/author/genai/`: core, training, usage, media, ops, practice): no model is called — the examples are the arithmetic (attention, sizes, KV cache, LoRA, quantisation, retrieval, diffusion, cost). Prices in examples are illustrative. The evaluator has no `ceil`: use `-floor(-x)`
- **agentic-ai** (50 concepts, 8 areas, `learn/author/agents/`: core, tools, planning, systems, safety, practice): the "model" in every example is a scripted stand-in function, so agent loops, tools, memory and cost arithmetic run deterministically with no API. Code never uses eval on model text (a safe ast evaluator is shown instead)
- **building-with-claude** (43 concepts, 6 areas, `learn/author/claude/`: api, code, copilot, practice): facts were verified against official docs on 2026-10-16 (Claude API/Claude Code/Agent SDK, VS Code and GitHub Copilot customisation). **GitHub Models was retired on 2026-07-30**, so the track covers GitHub Copilot (instructions, prompt files, custom agents, handoffs, sub-agents, Agent Skills) instead and explains the retirement. Embedded Python files mix plain and `String.raw` templates: in the plain `FM` constant write `\\n`, inside `py` blocks write `\n`. Prices in examples are the docs' list prices on that date — re-check before reuse
- **langchain-langgraph-rag** (40 concepts, 5 areas, `learn/author/langchain/`: lib, core, vectors, rag, graph, practice): langchain/langgraph/vector DBs are NOT installed, so every example runs a small stand-in mirroring the real interface (`lib.ts`: Document, HashEmbeddings, InMemoryVectorStore, Runnable with `|`; `graph.ts`: a ~70-line StateGraph with reducers, conditional edges, super-steps, checkpointer + thread_id, interrupt/Command(resume)). Real API names, defaults and pgvector syntax were verified against the official docs on 2026-10-16; the IVF recall numbers come from a seeded NumPy experiment quoted in the visuals — re-check after editing it
- **scikit-learn is the exception**: its `o:` outputs are typed by hand (sklearn was not installed when authored), so every example uses tiny exact data, prints rounded scalars or `.tolist()`, and the values were derived independently with NumPy. After `pip install scikit-learn`, run the examples and compare; to switch to generated outputs add `generatedOutputs: true` in `visuals-check.mjs` and a `content/scikit-learn.outputs.json`
- **Maths diagrams** (`plot`, `bars`, `matmul`): every number is a formula string (`visuals/expr.ts`, a safe evaluator — no eval) over `x`, slider `params` and `defs`; guided `steps` glide the sliders. `npm test` compiles and evaluates every formula, so a typo fails the build, not the learner. Verify any Python outputs you write by running them
- Extra diagram types for code: `trace` (line-by-line execution with variables/output) and `cells` (list/tuple/dict/string boxes with indexes, slicing highlights)

- **fraud-detection** (46 concepts, 6 areas, `learn/author/fraud/`: frame, data, model, evaluate, serve, ops, practice + `sim.ts`, `kit.ts`; stage "Real-world projects"): the template for the remaining real-time scenarios (problem → data → model → eval → serving → operations). Examples are plain Python/NumPy on a seeded simulator (`SIM` + `TOOLS` strings in `sim.ts`, included by each example so it runs alone) → outputs ARE generated (`npm run outputs -- fraud-detection`). Prose that quotes a number must match the generated output (e.g. AP 0.74, ROC AUC 0.98, Wilson 0.69–0.95, cheapest threshold 0.2): re-check after editing the simulator or any example. Every drill's marked answer was verified by running its code. Backticks inside `py` templates break the file — keep them out of Python docstrings. Compare rows need exactly one cell per head (the label is the row name)
- **Live fraud lab** (`stream` visual: `visuals/FraudLab.tsx`, logic `visuals/fraud.ts`, `fr-` CSS in `learn/fraud.css`): a seeded transaction feed scored by two overlapping bell curves, two thresholds (review / decline), reviewer accuracy 90 %, live fraud stopped / missed / false declines / net saving. Thresholds re-decide history instantly; model quality and fraud share restart the feed. `npm test` checks determinism, identities (caught+missed = fraud, approve-all costs the baseline) and that a better model is cheaper. The CSS sizes by `@container`, not the viewport, because the lab lives in a narrow workspace column. Don't animate list rows that get re-ordered by React (the animation restarts and rows stay invisible)
- The formula evaluator also has `ncdf(x, mean, sd)` and `erf(x)` (A&S approximation, ~1e-7; stay within ±4 sd for tail odds)

### Cloud Lab (`/cloud`) — AWS (live), Azure (coming soon)
- Header/mobile/home entry "Cloud Lab" → `pages/CloudLab.tsx`; tracks open in the same `ResourceStack` workspace at `/cloud/<slug>` (`Stack.section: "cloud"`, `SECTION_META.cloud`, `stackTitle()` in `catalog.ts`). `scripts/postbuild.mjs` has a `SECTIONS` table (dev/ai/cloud) that drives landing pages, stack prerender paths and the sitemap — add a section there, not with more if/else
- **Home** (`CloudLab.tsx`, `cl-` CSS in `learn/cloud.css`): hero, provider cards, "Watch one app grow up" (6 stage tabs reusing `ARCH_*` maps exported from `author/aws/arch.ts`), "I need to…" service finder, lab gallery, two learning paths. Deep links use concept ids (`area:index`) — if you insert or reorder concepts in an AWS area, update `STAGES`/`NEEDS`/`LABS` ids
- **aws** track (82 concepts, 9 areas, `learn/author/aws/`: start, iam, net, compute, data, events, ops, ai, arch, practice + `kit.ts`). Example app throughout: **ShopNest** (React + Node/Express + MySQL). Code is reference code (Node SDK v3, CDK TS, CLI, IAM JSON) — not run, no `generatedOutputs`; the only `o:` (backoff jitter) was verified with node. Facts, limits and list prices checked against official docs on 2026-10-17 (RDS MySQL 8.4 current / 8.0 Extended Support; App Runner closed to new customers 2026-04-30 → ECS Express Mode; Lambda Web Functions use `AWS_LAMBDA_HTTP_ENDPOINT`; SQS 1 MiB; S3 50 TB; configure-aws-credentials@v6)
- **Cloud lab diagram types** (`visuals/CloudLabs.tsx`, pure logic in `visuals/cloud.ts`, `ca-` CSS): `arch` (clickable service map on a grid, groups, named flows; author with `arch()`/`svc()`/`grp()` from `author/aws/kit.ts` — every service lives once in its `SERVICES` table), `iam` (policy evaluator: explicit deny → SCP → identity/resource allow → boundary → session), `cidr` (VPC subnet planner, 5 reserved IPs per subnet), `scale` (target-tracking simulator over `SALE_DAY`). `npm test` validates them (grid bounds, unique cells, flow node ids, every IAM lab mixes allowed and denied requests) and unit-tests `cloud.ts`
- Azure is a planned entry (`planned` topics, no `load`); build it the same way when ready

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
- 55 prerendered tool pages currently (1 hidden: edit-pdf), plus section landings and live stacks under /resources, /ai and /cloud