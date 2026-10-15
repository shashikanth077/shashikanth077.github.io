import { compare, flow, lanes, layers, queue, seq } from "../kit.js";
import type { VisualMap } from "../types.js";

export const runtime: VisualMap = {
  /* ---------------- platform ---------------- */
  "platform:0": flow(
    "One thread runs your JavaScript; libuv waits for I/O (and a small thread pool does file, DNS and crypto work). Block the thread and everything waits.",
    "cycle",
    ["Timers|expired setTimeout callbacks|i", "Poll|finished network and file I/O|g", "Check|setImmediate callbacks|i", "Close|socket close events|p"],
    [[0, 1, "timers done"], [1, 2, "I/O callbacks run"], [2, 3, "setImmediate runs"], [3, 0, "next loop turn"]],
    [0, 1, 2, 3],
    ["Timers phase: expired {{setTimeout}} callbacks run on the single JS thread.", "Poll phase: libuv hands over finished network results; file, DNS, crypto and zlib results arrive from the 4-thread pool. A slow callback here delays every request.", "Check phase: {{setImmediate}} callbacks run right after poll.", "Close callbacks run, then the loop turns again. Heavy synchronous code in any phase stalls the whole cycle."],
  ),
  "platform:1": compare(
    "Use ESM for new code; remember the two module systems are different worlds with a bridge between them.",
    ["ESM (import)", "CommonJS (require)"],
    [["Syntax", "{{import x from 'x'}}", "{{require('x')}}"], ["Loading", "Static analysis, async, top-level await", "Synchronous, resolved at runtime"], ["Filename vars", "{{import.meta.dirname}}", "{{__dirname}} available"], ["Config", "{{\"type\": \"module\"}}", "Default for .js / .cjs"], ["Interop", "Can import CJS easily", "Can {{require()}} ESM only without top-level await"]],
    0,
  ),
  "platform:2": lanes(
    "Run Active or Maintenance LTS in production — a release line goes Current → Active LTS → Maintenance → end of life.",
    10,
    { "Node 20": [[0, 2, "Current", "w"], [2, 3, "Active LTS", "g"], [5, 2, "Maintenance", "i"], [7, 1, "End of life", "b"]], "Node 22": [[1, 2, "Current", "w"], [3, 3, "Active LTS", "g"], [6, 3, "Maintenance", "i"]], "Node 24": [[3, 2, "Current", "w"], [5, 3, "Active LTS", "g"], [8, 2, "Maintenance", "i"]] },
    [[0, "Every even-numbered release starts as Current for about six months."], [3, "It then becomes Active LTS — the line you should run in production."], [7, "Older lines drift into Maintenance and finally end of life: no more security fixes."]],
  ),
  "platform:3": compare(
    "Every built-in you adopt is one dependency fewer to patch and audit.",
    ["Package you used to add", "Built-in today"],
    [["HTTP client", "axios / node-fetch", "{{fetch}} (undici)"], ["Timeouts", "custom timer + cancel", "{{AbortSignal.timeout(ms)}}"], ["Deep clone", "lodash.clonedeep", "{{structuredClone}}"], ["Tests", "jest / mocha", "{{node:test}}"], ["Reload & env", "nodemon + dotenv", "{{--watch}} + {{--env-file}}"], ["IDs", "uuid", "{{crypto.randomUUID()}}"]],
    1,
  ),
  "platform:4": layers(
    "{{exports}} decides what outsiders may import; the lockfile decides exactly what gets installed.",
    ["Your package|{{exports}} lists the only public entry points|g", "Consumer code|import 'pkg/internal/x' → blocked by exports|b", "{{engines}}|documents supported Node versions|i", "Lockfile|pins every transitive dependency to an exact version|w", "CI|{{npm ci}} installs exactly the lockfile, reproducibly|g"],
  ),
  "platform:5": flow(
    "Type stripping just erases the annotations — it never rewrites your code, so only erasable syntax works.",
    "row",
    ["app.ts|const n: number = 1|i", "Strip types|erase annotations|w", "app.js (in memory)|const n = 1|g", "V8 runs it|no build step|g"],
    [[0, 1, "node app.ts"], [1, 2, "types erased"], [2, 3, "execute"]],
    undefined,
    ["Type annotations are replaced by whitespace. Enums, namespaces and parameter properties can't be erased, so they fail.", "Same line numbers and no source maps needed.", "V8 executes plain JavaScript. Run {{tsc}} separately for type checking."],
  ),
  "platform:6": layers(
    "Permission Model: deny by default, grant narrowly. Single Executable Apps ship your script inside the node binary.",
    ["{{node --permission app.js}}|everything denied by default|b", "{{--allow-fs-read=./data}}|only this folder can be read|g", "{{--allow-fs-write=./out}}|only this folder can be written|g", "No child processes / workers|unless explicitly allowed|w", "Single Executable App|script + node binary → one file for CLIs|i"],
  ),

  /* ---------------- lang ---------------- */
  "lang:0": seq(
    "A closure keeps its birth scope alive; {{this}} depends on how the function is called.",
    ["makeCounter()", "count (scope)", "counter()"],
    [[0, 1, "let count = 0", "makeCounter runs and creates {{count}} in its scope."], [0, 2, "return () => ++count", "It returns an inner function that closes over {{count}}.", "r"], [2, 1, "read count", "Later, calling counter() still reaches the original {{count}} — makeCounter has long returned."], [1, 2, "1", "The scope survived because the closure references it.", "r"], [2, 1, "++count again"], [1, 2, "2", "State is private: nothing else can reach {{count}}.", "r"]],
  ),
  "lang:1": seq(
    "{{for await}} pulls one page at a time — memory stays flat and you can stop early.",
    ["for await loop", "async generator", "API"],
    [[0, 1, "next()", "The loop asks the generator for the next item."], [1, 2, "fetch page 1", "The generator fetches only the first page."], [2, 1, "10 items", "", "r"], [1, 0, "yield item 1", "Items are yielded one by one — the loop body runs between yields.", "r"], [0, 1, "next()"], [1, 0, "yield item 2", "", "r"], [0, 1, "next() … after 10 items"], [1, 2, "fetch page 2", "Only now does it fetch the next page. If the loop {{break}}s, no more pages are requested."]],
  ),
  "lang:2": layers(
    "Types vanish at runtime — strict settings only protect code you control, so keep them all on.",
    ["{{strict}}|no implicit any, strict null checks|g", "{{noUncheckedIndexedAccess}}|arr[i] is T | undefined — forces the check|g", "{{verbatimModuleSyntax}}|import type is explicit and erased exactly|g", "{{module: nodenext}}|resolution matches how Node really loads files|i", "Runtime|all types are gone — validate untrusted input yourself|w"],
  ),
  "lang:3": flow(
    "Parse untrusted data once at the edge; after that the types are trustworthy.",
    "row",
    ["Request body|unknown shape|b", "Schema.parse()|Zod / Valibot|w", "Typed Order|z.infer<typeof Order>|g", "Business logic|trusts the type|g"],
    [[0, 1, "untrusted JSON"], [1, 2, "valid → typed"], [2, 3, "safe to use"], [1, 0, "invalid → 400"]],
    [0, 1, 2],
    ["The boundary receives anything a client sends.", "The schema either returns a typed value or throws a ZodError.", "The static type is derived from the schema, so they never drift."],
  ),
  "lang:4": flow(
    "Tag each state, switch on the tag, and let {{never}} make the compiler flag any forgotten case.",
    "row",
    ["Payment|status tag|i", "pending|{ status }|w", "captured|{ capturedAt }|g", "refunded|{ refundId }|b"],
    [[0, 1, "'pending'"], [0, 2, "'captured'"], [0, 3, "'refunded'"]],
    undefined,
    ["Each variant of the union carries a tag.", "Narrowing by the tag gives access only to that variant's fields.", "Add a 4th status later → the {{never}} line stops compiling until you handle it."],
  ),
  "lang:5": flow(
    "Keep instants in UTC everywhere inside the system; convert to a zone only at the edge.",
    "row",
    ["User input|'3 Mar 9:00 IST'|w", "Parse with zone|explicit time zone|i", "Store UTC|instant|g", "Display|convert at the edge|g"],
    [[0, 1, "ambiguous string?"], [1, 2, "UTC instant"], [2, 3, "format per user"]],
    undefined,
    ["Attach an explicit zone while parsing (Temporal makes this natural).", "Store and compare instants in UTC.", "Convert to the viewer's zone only when rendering."],
  ),

  /* ---------------- async ---------------- */
  "async:0": lanes(
    "After each task: nextTick first, then promise microtasks, then on to the next phase.",
    8,
    { "Call stack": [[0, 1, "sync code", "i"]], "nextTick queue": [[1, 1, "nextTick cb", "w"]], "Microtasks": [[2, 1, "promise.then", "g"]], "Timers / I/O": [[3, 1, "setTimeout", "p"], [4, 1, "setImmediate", "p"]] },
    [[0, "1. The current synchronous code finishes first."], [1, "2. process.nextTick callbacks drain next — before any promise."], [2, "3. Promise microtasks drain, then Node moves to the next event-loop phase."], [3, "4. Timers and I/O callbacks only run after both queues are empty. Starving them blocks I/O."]],
  ),
  "async:1": compare(
    "Pick the combinator by how you want failure and success to behave.",
    ["Promise.all", "allSettled", "race", "any"],
    [["Resolves when", "all succeed", "all settle", "first settles", "first succeeds"], ["On one failure", "rejects immediately", "keeps going", "rejects if first is a rejection", "ignores until all fail"], ["Result", "array of values", "array of status objects", "single value / error", "single value"], ["Use for", "all-or-nothing steps", "best-effort batch", "timeouts", "fastest mirror"]],
  ),
  "async:2": queue(
    "Cap concurrency. If work arrives faster than workers finish, queue and apply backpressure instead of opening 10,000 sockets.",
    { producer: "Tasks", queue: "Pending", worker: "Worker", arrival: 5, service: 1.5, workers: 2, capacity: 12, overflow: "block" },
  ),
  "async:3": seq(
    "One abort signal cancels everything downstream — and stops work when the client leaves.",
    ["Client", "Handler", "fetch / DB"],
    [[0, 1, "request"], [1, 2, "call with signal", "The handler passes {{AbortSignal.timeout(2000)}} to the downstream call."], [2, 2, "waiting…", "The downstream is slow."], [1, 2, "signal aborts", "The timer fires — or the client disconnects — and the signal aborts.", "b"], [2, 1, "AbortError", "The downstream stops immediately and rejects.", "rb"], [1, 0, "504 / cleanup", "The handler responds and releases resources instead of working for nobody.", "r"]],
  ),
  "async:4": seq(
    "AsyncLocalStorage carries request context across awaits — no parameter threading.",
    ["Middleware", "ALS store", "Service code", "Logger"],
    [[0, 1, "run({ requestId })", "The middleware starts the request inside {{als.run()}}."], [0, 2, "await handler()"], [2, 2, "await db.query()", "Many awaits later, the context is still attached to this async chain."], [2, 1, "getStore()", "Deep code asks for the current context."], [1, 2, "{ requestId }", "", "r"], [2, 3, "log with requestId", "Every log line is correlated without passing the id around."]],
  ),
  "async:5": queue(
    "Backpressure: a slow consumer must be able to slow the producer, otherwise memory fills up.",
    { producer: "Readable", queue: "Buffer (highWaterMark)", worker: "Writable", arrival: 6, service: 1.2, workers: 2, capacity: 10, overflow: "block" },
  ),
  "async:6": compare(
    "Pick by the problem: CPU work → worker threads; other programs/isolation → child process; more I/O cores → cluster/containers.",
    ["Worker threads", "Child process", "Cluster / containers"],
    [["Best for", "CPU-heavy JS", "Running other programs, crash isolation", "Using more cores for I/O"], ["Memory", "Can share (SharedArrayBuffer)", "Separate processes", "Separate processes"], ["Cost", "Light", "Heavier", "Heavier"], ["Tip", "Use a pool (Piscina)", "Prefer execFile with args", "Containers + load balancer"]],
    0,
  ),
  "async:7": lanes(
    "setTimeout is a minimum, not a promise — blocking work pushes every timer later.",
    10,
    { "Event loop": [[0, 1, "tick", "g"], [1, 5, "blocking JSON.parse / loop", "b"], [6, 1, "timer cb", "i"], [7, 1, "tick", "g"]], "Timer (set for tick 2)": [[2, 4, "waiting – overdue", "w"]] },
    [[0, "A timer is scheduled for ~1 tick from now."], [1, "Synchronous work blocks the loop…"], [4, "…the timer is overdue but cannot fire."], [6, "It finally fires late. Measure this delay with {{monitorEventLoopDelay}} and alert on it."]],
  ),
};
