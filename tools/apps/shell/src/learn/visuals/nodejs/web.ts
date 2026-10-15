import { compare, flow, lanes, layers, seq } from "../kit.js";
import type { VisualMap } from "../types.js";

export const web: VisualMap = {
  /* ---------------- http ---------------- */
  "http:0": compare(
    "Methods and status codes are a contract — pick them precisely and page with cursors.",
    ["GET", "PUT / DELETE", "POST"],
    [["Safe (no side effects)", "yes", "no", "no"], ["Idempotent (repeat = same result)", "yes", "yes", "no, unless you add a key"], ["Typical use", "read", "replace / remove", "create / actions"], ["Status hints", "200, 304", "200, 204, 409", "201, 202, 422"]],
  ),
  "http:1": seq(
    "ETag + If-None-Match turns a repeat download into a tiny 304 with no body.",
    ["Browser", "CDN / cache", "Origin API"],
    [[0, 1, "GET /products"], [1, 2, "cache miss → GET", "First time, nobody has it cached."], [2, 1, "200 + ETag: \"v7\"", "The origin answers with the body, {{Cache-Control}} and an {{ETag}}.", "r"], [1, 0, "200 + body", "", "r"], [0, 1, "GET + If-None-Match: \"v7\"", "Later, the cached copy has expired, so the browser revalidates."], [1, 2, "revalidate"], [2, 1, "304 Not Modified", "Unchanged → no body is sent. Cheap for everyone.", "r"], [1, 0, "304 → reuse copy", "", "r"]],
  ),
  "http:2": seq(
    "The same Idempotency-Key replays the saved result — the card is charged once.",
    ["Client", "API", "DB (unique key)"],
    [[0, 1, "POST /pay  Key: abc", "The client sends a unique key with the payment."], [1, 2, "insert key abc + charge", "The server records the key and charges."], [2, 1, "ok → store response", "", "r"], [1, 0, "timeout (lost reply)", "The response never reaches the client.", "rb"], [0, 1, "retry  Key: abc", "The client safely retries with the same key."], [1, 2, "key abc exists?"], [2, 1, "yes → saved response", "A unique constraint, not just a check, stops duplicates under concurrency.", "r"], [1, 0, "same result, no 2nd charge", "", "r"]],
  ),
  "http:3": layers(
    "One predictable error shape lets every client handle failures generically — without leaking stack traces.",
    ["{{type}}|a URI identifying the problem kind|i", "{{title}}|short, human-readable summary|g", "{{status}}|the HTTP status code|g", "{{detail}}|what happened this time (safe to show)|g", "{{instance}}|the specific request or resource|p", "Never|stack traces, SQL or secrets|b"],
  ),
  "http:4": flow(
    "The OpenAPI document is the source; types, validators, docs and SDKs are generated from it.",
    "row",
    ["openapi.yaml|source of truth|g", "Generated types|TS types|i", "Validators|request checks|i", "Docs + SDKs|clients|i", "CI diff|catches breaking changes|w"],
    [[0, 1], [0, 2], [0, 3], [0, 4, "every PR"]],
  ),
  "http:5": lanes(
    "Ship v2 alongside v1, warn with Deprecation/Sunset headers, and retire v1 only after the published window.",
    10,
    { "v1 API": [[0, 6, "supported", "g"], [6, 2, "Deprecation + Sunset headers", "w"], [8, 2, "retired", "b"]], "v2 API": [[3, 7, "supported", "g"]], "Clients": [[3, 4, "migrate to v2", "i"]] },
    [[0, "v1 is the only version."], [3, "v2 launches. Changes inside a major version stay additive."], [6, "v1 gets {{Deprecation}} and {{Sunset}} headers and a published window."], [8, "After the sunset date v1 is switched off."]],
  ),
  "http:6": seq(
    "Verify the signature on the raw body, ack fast, process later — and expect duplicates and reordering.",
    ["Provider", "Your webhook", "Queue / worker"],
    [[0, 1, "POST event + signature", "Headers carry an HMAC signature and a timestamp."], [1, 1, "verify HMAC (raw body)", "Use a timing-safe compare; reject old timestamps."], [1, 2, "enqueue event"], [1, 0, "200 OK (fast)", "Acknowledge quickly so the provider does not retry.", "r"], [2, 2, "process async + idempotently", "Duplicates and out-of-order delivery happen — handlers must be idempotent."], [0, 1, "retry same event", "If you were slow, the provider retries the same event…", "b"], [1, 0, "200 (already seen)", "…and your idempotency check turns it into a no-op.", "r"]],
  ),
  "http:7": compare(
    "Choose by who calls you and what they need — not by fashion.",
    ["REST", "GraphQL", "gRPC", "tRPC"],
    [["Best for", "public, cacheable resources", "varied client needs", "fast internal service calls", "TS monorepo, one team"], ["Contract", "OpenAPI", "schema", "protobuf", "shared TS types"], ["Watch out", "over/under-fetching", "N+1 → DataLoader, cost limits", "browser support", "couples client & server"]],
    0,
  ),
  "http:8": lanes(
    "If your server closes idle sockets before the load balancer does, the LB reuses a dead socket and you get 502s.",
    10,
    { "Load balancer": [[0, 8, "idle timeout 60s — keeps socket open", "i"], [8, 2, "reuses socket!", "w"]], "Node server": [[0, 5, "keepAliveTimeout 5s", "g"], [5, 5, "socket CLOSED", "b"]], "Result": [[8, 2, "502 Bad Gateway", "b"]] },
    [[0, "A connection is opened and goes idle."], [5, "Node closes it after its 5s keep-alive timeout…"], [8, "…but the balancer still thinks it is open, sends a request, and gets a reset → 502. Fix: set Node's timeout longer than the LB's."]],
  ),

  /* ---------------- arch ---------------- */
  "arch:0": compare(
    "All four handle HTTP; they differ in how much structure they give you.",
    ["Express", "Fastify", "NestJS", "Hono"],
    [["Style", "minimal, middleware", "schema-first, plugins", "modules + DI", "tiny, web-standard"], ["Validation", "add-on", "built in", "pipes / class-validator", "add-on (Zod)"], ["Good for", "simple, ubiquitous", "fast APIs", "large teams", "edge / serverless"]],
  ),
  "arch:1": layers(
    "Dependencies point inward: the domain knows nothing about HTTP, databases or queues.",
    ["Adapters (HTTP, DB, queue)|plug into ports; swap without touching the domain|i", "Ports|interfaces the domain needs (e.g. OrderRepository)|w", "Application services|use cases that orchestrate the domain|g", "Domain|entities and rules — pure, testable without a server|g"],
    "dependencies point inward",
  ),
  "arch:2": flow(
    "Build everything in one place at startup, then pass collaborators in — no hidden globals.",
    "row",
    ["main() — composition root|wires everything|g", "DB pool|created once|i", "OrderRepo|gets the pool|i", "OrderService|gets the repo|i", "HTTP handler|gets the service|i"],
    [[0, 1, "create"], [0, 2, "create(pool)"], [0, 3, "create(repo)"], [0, 4, "create(service)"]],
  ),
  "arch:3": flow(
    "A modular monolith keeps boundaries without network hops — split a module out only when scaling, ownership or release cadence demands it.",
    "row",
    ["Orders module|public API only|g", "Billing module|public API only|g", "Users module|public API only|g", "One deployable|one database, one release|i"],
    [[0, 1, "via public API"], [1, 2, "via public API"], [2, 3, "ships together"]],
    undefined,
    ["Modules talk through explicit public APIs, never reaching into each other's tables.", "Boundaries are enforced in code review and lint rules.", "Everything still deploys as one unit — no distributed-systems tax. Extract a module later only if needed."],
  ),
  "arch:4": flow(
    "Same build everywhere; only the environment variables change. Fail fast if config is wrong.",
    "row",
    ["One build artifact|image / bundle|g", "Dev env|env vars|i", "Staging env|env vars|i", "Production env|env vars|w"],
    [[0, 1, "+ dev config"], [0, 2, "+ staging config"], [0, 3, "+ prod config"]],
    undefined,
    ["Config is read from environment variables and validated at startup.", "Staging uses the same artifact with different values.", "Production too — if a variable is missing the process exits immediately instead of failing later."],
  ),
  "arch:5": flow(
    "Workspaces share code; task graphs and remote caching rebuild only what changed.",
    "row",
    ["packages/ui|shared library|g", "packages/core|shared logic|g", "apps/web|depends on ui + core|i", "apps/api|depends on core|i"],
    [[0, 2, "used by"], [1, 2, "used by"], [1, 3, "used by"]],
    undefined,
    ["Edit {{ui}}: only {{ui}} and {{web}} rebuild.", "Edit {{core}}: it affects both apps…", "…so both rebuild; everything else comes from the cache."],
  ),
  "arch:6": flow(
    "A bounded context keeps one consistent model; an anti-corruption layer protects it from messy outside APIs.",
    "row",
    ["Sales context|Customer = buyer|g", "Shipping context|Customer = address|g", "Anti-corruption layer|translates models|w", "Legacy / 3rd-party API|messy contract|b"],
    [[0, 1, "domain event: OrderPlaced"], [1, 2, "call external"], [2, 3, "translated request"], [3, 2, "messy response"]],
    undefined,
    ["Contexts talk through events and published contracts, not shared tables.", "Shipping needs data from an outside system…", "…the ACL translates it so the legacy model never leaks in.", "Responses come back and are mapped to the clean domain language."],
  ),
};
