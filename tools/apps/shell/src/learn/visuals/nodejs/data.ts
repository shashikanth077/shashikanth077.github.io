import { compare, flow, lanes, layers, queue, seq } from "../kit.js";
import type { VisualMap } from "../types.js";

export const data: VisualMap = {
  /* ---------------- data ---------------- */
  "data:0": seq(
    "Lock the row you will change, keep lock order consistent — and two transactions can't both win a lost update.",
    ["Txn A", "Row: stock=5", "Txn B"],
    [[0, 1, "SELECT … FOR UPDATE", "A reads the row and takes a lock."], [2, 1, "SELECT … FOR UPDATE", "B asks for the same row…", ""], [1, 2, "wait…", "…and is blocked until A finishes.", "rb"], [0, 1, "UPDATE stock=4, COMMIT", "A writes and releases the lock."], [1, 2, "lock granted (sees 4)", "B now reads the fresh value, so no update is lost.", "r"], [2, 1, "UPDATE stock=3, COMMIT"]],
  ),
  "data:1": compare(
    "An index trades write cost for read speed — {{EXPLAIN ANALYZE}} tells you which one the planner uses.",
    ["Seq Scan (no index)", "Index Scan"],
    [["Rows examined", "every row in the table", "only the matching entries"], ["Time on 10M rows", "seconds", "milliseconds"], ["Write cost", "none", "each insert/update also updates the index"], ["Composite index", "—", "column order matters: (user_id, created_at)"]],
    1,
  ),
  "data:2": layers(
    "Connections are a shared budget: pods × pool size must stay under {{max_connections}}.",
    ["Pod 1 – pool 10|10 connections|i", "Pod 2 – pool 10|10 connections|i", "Pod 3 – pool 10|10 connections|i", "Pooler (PgBouncer)|multiplexes many clients over few connections|g", "Postgres|{{max_connections}} = 100 — 30 used, room left|g"],
    "connections",
  ),
  "data:3": seq(
    "The N+1 trap: one query for the list, then one more per row — fetch with a join or batch instead.",
    ["Your code", "Database"],
    [[0, 1, "SELECT * FROM orders", "One query returns 100 orders."], [1, 0, "100 rows", "", "r"], [0, 1, "SELECT * FROM users WHERE id=1", "Then the ORM lazily loads each order's user…", "b"], [0, 1, "… id=2", "", "b"], [0, 1, "… id=3  (×100)", "100 extra round trips = the N+1 problem.", "b"], [0, 1, "Fix: JOIN / IN (…) batch", "One more query (or a join) gets every user at once."], [1, 0, "all rows, 2 queries", "", "r"]],
  ),
  "data:4": flow(
    "Expand and contract: every step is deployable on its own, so nothing breaks mid-migration.",
    "row",
    ["1 Add nullable column|expand|i", "2 Write both|new code writes old + new|w", "3 Backfill|small batches|w", "4 Switch reads|to the new column|g", "5 Drop old column|contract|g"],
    [[0, 1], [1, 2], [2, 3], [3, 4]],
    undefined,
    ["Deploy code that writes both columns.", "Backfill old rows in small batches.", "Switch reads to the new column once the data is complete.", "Finally drop the old column in a later release."],
  ),
  "data:5": seq(
    "Cache-aside: check the cache, fall back to the database, then fill the cache.",
    ["App", "Redis", "Database"],
    [[0, 1, "GET user:42"], [1, 0, "miss", "", "r"], [0, 2, "SELECT … WHERE id=42"], [2, 0, "row", "", "r"], [0, 1, "SET user:42 (TTL + jitter)", "Add TTL jitter so keys do not all expire at once; use single-flight so one miss doesn't trigger a thousand queries."], [0, 1, "next GET user:42"], [1, 0, "hit! (no DB query)", "", "r"]],
  ),
  "data:6": compare(
    "Embed what is read together and bounded; reference what is shared or unbounded.",
    ["Embed", "Reference"],
    [["Use when", "read together, small & bounded", "shared or unbounded"], ["Example", "order with its line items", "user ↔ millions of events"], ["Reads", "one document, one read", "extra lookup / $lookup"], ["Updates", "duplicated data may need syncing", "single source of truth"]],
  ),
  "data:7": seq(
    "Replicas lag: a user may not see their own write — route read-your-writes traffic to the primary.",
    ["User", "App", "Primary DB", "Replica"],
    [[0, 1, "update profile"], [1, 2, "write"], [2, 1, "ok", "", "r"], [2, 3, "replicate… (lag)", "Replication takes a moment."], [0, 1, "reload profile"], [1, 3, "read from replica", "The replica hasn't received the write yet."], [3, 1, "OLD data", "The user sees stale data.", "rb"], [1, 2, "Fix: read own writes from primary", "Route read-your-writes to the primary, or use session stickiness."]],
  ),
  "data:8": compare(
    "Start with Postgres; add a specialised store only when a real access pattern demands it.",
    ["Postgres", "Redis", "Search engine", "Column store", "DynamoDB"],
    [["Best at", "most things incl. JSON", "cache, counters", "relevance search", "analytics", "key access at huge scale"], ["Add when", "default", "latency / hot reads", "full-text, ranking", "big aggregates", "access patterns known"]],
    0,
  ),

  /* ---------------- msg ---------------- */
  "msg:0": compare(
    "Queue = distribute work to one worker. Log = keep an ordered record many readers can replay.",
    ["Queue (SQS, RabbitMQ)", "Log (Kafka)"],
    [["Delivery", "each message to ONE worker", "every consumer group reads all"], ["After processing", "deleted on ack", "retained, replayable"], ["Ordering", "weak / per queue", "strict within a partition"], ["Choose for", "work distribution", "event streaming, replay"]],
  ),
  "msg:1": seq(
    "The broker may deliver twice — so the consumer must be idempotent.",
    ["Broker", "Consumer", "DB (processed ids)"],
    [[0, 1, "deliver msg #7"], [1, 2, "already processed #7?"], [2, 1, "no", "", "r"], [1, 1, "do the work", "The consumer processes the message…"], [1, 0, "ack lost / crash", "…but the ack never reaches the broker.", "b"], [0, 1, "redeliver msg #7", "At-least-once delivery means a duplicate arrives."], [1, 2, "already processed #7?"], [2, 1, "yes → skip", "A unique constraint or upsert makes the duplicate harmless.", "r"], [1, 0, "ack", "", "r"]],
  ),
  "msg:2": lanes(
    "Retry with growing, jittered delays; after the cap send the message to a dead-letter queue and alert.",
    12,
    { "Attempt": [[0, 1, "try 1 ✗", "b"], [2, 1, "try 2 ✗", "b"], [5, 1, "try 3 ✗", "b"], [9, 1, "try 4 ✗", "b"]], "Wait": [[1, 1, "1s", "w"], [3, 2, "2s", "w"], [6, 3, "4s + jitter", "w"]], "Outcome": [[10, 2, "→ dead-letter queue + alert", "i"]] },
    [[0, "A transient failure → retry."], [3, "Exponential backoff: each wait doubles; jitter spreads retries so they don't stampede."], [10, "After the attempt cap, park the poison message in a DLQ and alert — never retry forever or block the queue."]],
  ),
  "msg:3": seq(
    "Write the change and an outbox row in one transaction; a relay publishes it — no dual-write gap.",
    ["Service", "Database", "Relay", "Broker"],
    [[0, 1, "BEGIN"], [0, 1, "UPDATE order + INSERT outbox", "Both rows are written in the SAME transaction."], [0, 1, "COMMIT", "Either both exist or neither does."], [2, 1, "poll outbox", "A relay reads unsent rows."], [1, 2, "pending events", "", "r"], [2, 3, "publish OrderPlaced"], [2, 1, "mark sent", "If the relay crashes before this, it republishes → consumers must be idempotent."]],
  ),
  "msg:4": compare(
    "A saga replaces one distributed transaction with local steps plus compensating actions.",
    ["Orchestration", "Choreography"],
    [["Control", "a coordinator tells each step what to do", "services react to each other's events"], ["Visibility", "flow is in one place", "flow is spread across services"], ["Coupling", "services depend on the coordinator", "services depend on event contracts"], ["On failure", "coordinator runs compensations", "each service publishes compensating events"]],
  ),
  "msg:5": flow(
    "Order is guaranteed only inside a partition — pick a key (e.g. order id) so related events stay together.",
    "row",
    ["Producer|key = orderId|i", "Partition 0|orders 1, 3, 5…|g", "Partition 1|orders 2, 4, 6…|g", "Consumer group|one member per partition|w"],
    [[0, 1, "key → hash → P0"], [0, 2, "key → hash → P1"], [1, 3, "in order"], [2, 3, "in order"]],
    undefined,
    ["The key decides the partition.", "Another key goes to another partition.", "Within P0 the consumer sees events in order.", "Across partitions there is no ordering. A rebalance briefly pauses consumption."],
  ),
  "msg:6": queue(
    "Jobs wait in a queue, workers pick them up with bounded concurrency — add retries, delays and one scheduler.",
    { producer: "Enqueue jobs", queue: "BullMQ (Redis)", worker: "Worker", arrival: 4, service: 1, workers: 2, capacity: 14, overflow: "drop" },
  ),

  /* ---------------- sec ---------------- */
  "sec:0": seq(
    "Authenticated is not authorised: BOLA means a user reads someone else's object just by changing an id.",
    ["Attacker (user 7)", "API", "DB"],
    [[0, 1, "GET /orders/42", "User 7 is logged in, but order 42 belongs to user 9."], [1, 2, "SELECT … WHERE id=42", "Vulnerable code only checks that the token is valid.", "b"], [2, 1, "order 42 (user 9)", "", "rb"], [1, 0, "200 – leaked!", "Broken object level authorization.", "rb"], [0, 1, "Fix: GET /orders/42", "Check ownership on every object access."], [1, 2, "WHERE id=42 AND user_id=7"], [1, 0, "404 / 403", "", "r"]],
  ),
  "sec:1": seq(
    "Short-lived access token + rotating refresh token: stolen tokens expire fast and reuse is detected.",
    ["Browser", "API", "Auth server"],
    [[0, 2, "login"], [2, 0, "access (15m) + refresh (httpOnly)", "", "r"], [0, 1, "request + access token"], [1, 0, "200", "", "r"], [0, 1, "request (token expired)", "", "b"], [1, 0, "401", "", "rb"], [0, 2, "refresh token", "The client trades the refresh token for new tokens."], [2, 0, "new access + NEW refresh", "Rotation: the old refresh token is now invalid; reusing it signals theft.", "r"]],
  ),
  "sec:2": seq(
    "Passkeys: the private key never leaves the device and is bound to the site's origin — nothing to phish.",
    ["Browser + device", "Server"],
    [[1, 0, "challenge (random)", "The server sends a fresh random challenge."], [0, 0, "user verifies (biometric)", "The device unlocks the private key locally."], [0, 1, "signed challenge + origin", "The signature covers the challenge and the real origin."], [1, 1, "verify with stored public key", "The server only stores a public key. A look-alike site gets a different origin → the signature fails."], [1, 0, "signed in", "", "r"]],
  ),
  "sec:3": compare(
    "RBAC asks 'what is your role?', ABAC asks 'what are the attributes?', ReBAC asks 'how are you related?'.",
    ["RBAC", "ABAC", "ReBAC"],
    [["Decision based on", "role (admin, editor)", "attributes (department, owner, time)", "relationships (member of the owning team)"], ["Simple to start", "yes", "medium", "harder"], ["Fine-grained", "weak", "strong", "strong, shareable"], ["Tip", "centralise the policy", "centralise the policy", "use a tool like OpenFGA"]],
  ),
  "sec:4": layers(
    "Never trust input: parameterise, validate and allow-list at every sink.",
    ["SQL / NoSQL|use parameterised queries; reject {\"$ne\": null}|b", "Shell|execFile with an argument array, not exec(string)|b", "File paths|resolve and verify the path stays inside the base dir|w", "Outbound URLs (SSRF)|allow-list hosts; block internal IPs|w", "Your code|validated, typed data only|g"],
  ),
  "sec:5": seq(
    "Merging untrusted JSON can write {{__proto__}} and poison every object; a backtracking regex can freeze the loop.",
    ["Attacker", "merge(target, body)", "All objects"],
    [[0, 1, "{ \"__proto__\": { \"isAdmin\": true } }"], [1, 2, "writes Object.prototype.isAdmin", "A naive recursive merge follows {{__proto__}}.", "b"], [2, 2, "({}).isAdmin === true", "Every plain object now looks like an admin.", "b"], [0, 1, "Fix: block __proto__/constructor", "Use validated schemas or {{Object.create(null)}}."], [1, 0, "400", "", "r"]],
  ),
  "sec:6": flow(
    "Pin, verify and delay: the lockfile, provenance and a cooling-off period shrink supply-chain risk.",
    "row",
    ["New dependency|review it first|w", "Lockfile|committed, {{npm ci}}|g", "Provenance|{{npm audit signatures}}|g", "No install scripts|{{--ignore-scripts}}|i", "Production|reproducible build|g"],
    [[0, 1], [1, 2], [2, 3], [3, 4]],
  ),
  "sec:7": flow(
    "Secrets live in a manager and arrive at runtime as short-lived credentials — never in git, images or logs.",
    "row",
    ["CI job|proves identity (OIDC)|i", "Secret manager|issues short-lived creds|g", "App runtime|loads at startup|g", "Rotation|on a schedule|w"],
    [[0, 1, "OIDC token"], [1, 2, "temp credentials"], [3, 1, "rotate"]],
    undefined,
    ["No stored cloud keys: CI exchanges an identity token.", "The manager returns credentials that expire soon.", "The app uses them in memory only. Rotation replaces them automatically."],
  ),
  "sec:8": queue(
    "A token bucket allows bursts but caps the sustained rate — store it in Redis so every pod shares one limit.",
    { producer: "Requests", queue: "Bucket / backlog", worker: "Allowed slot", arrival: 6, service: 2, workers: 2, capacity: 8, overflow: "drop" },
  ),
  "sec:9": seq(
    "CORS is a browser rule about reading cross-origin responses — it is not authentication. Cookies need SameSite + CSRF protection.",
    ["evil.com page", "Browser", "your-api.com"],
    [[0, 1, "fetch(your-api.com, credentials)", "A malicious page triggers a request."], [1, 2, "request + your cookie", "The browser attaches your session cookie automatically (CSRF risk).", "b"], [2, 1, "SameSite=Lax cookie not sent / CSRF token missing → 403", "{{SameSite}}, {{HttpOnly}} and a CSRF token block the attack.", "rb"], [2, 1, "No CORS headers", "Even if it ran, the browser won't let evil.com READ the response.", "r"]],
  ),

  /* ---------------- test ---------------- */
  "test:0": layers(
    "Mostly integration tests, fewer unit tests, a thin layer of end-to-end — and mock only what you don't own.",
    ["End-to-end|a few critical journeys|w", "Integration|the bulk: real code paths, real DB|g", "Unit|pure logic only|i", "Static checks|types and lint — cheapest|p"],
  ),
  "test:1": compare(
    "Pick one runner per repo; all can run in CI on every change.",
    ["node:test", "Jest", "Vitest"],
    [["Install", "built in", "package", "package"], ["Strength", "zero deps, mocks, coverage", "biggest ecosystem", "fast, ESM-native"], ["Best for", "libraries, small services", "established apps", "Vite / modern ESM projects"]],
  ),
  "test:2": flow(
    "No port, no network: send the request straight to the app object.",
    "row",
    ["Test|describes the request|i", "app.inject() / supertest|in-process request|g", "Route handler|real code path|g", "Assertion|status + body|g"],
    [[0, 1, "GET /health"], [1, 2, "no socket"], [2, 3, "200 { ok: true }"]],
  ),
  "test:3": flow(
    "Use the real database in a disposable container instead of a fake that behaves differently.",
    "row",
    ["Test starts|beforeAll|i", "Testcontainers|starts Postgres|w", "Migrations + tests|real SQL|g", "Container removed|afterAll|g"],
    [[0, 1], [1, 2, "port ready"], [2, 3, "cleanup"]],
  ),
  "test:4": seq(
    "Contract tests prove the provider still gives each consumer what it actually uses — before release.",
    ["Consumer", "Contract (Pact)", "Provider CI"],
    [[0, 1, "publish: I use fields id, total", "The consumer records exactly what it needs."], [2, 1, "fetch contracts"], [2, 2, "verify against real provider"], [2, 1, "pass → can deploy", "If the provider removes {{total}}, this step fails and blocks the release.", "r"]],
  ),
  "test:5": lanes(
    "Flaky tests come from shared state, real clocks and ordering — inject the clock and isolate data.",
    8,
    { "Flaky test": [[0, 2, "sleep(500)", "w"], [2, 1, "assert ✗ (not ready yet)", "b"]], "Reliable test": [[0, 1, "fake clock / wait for condition", "g"], [1, 1, "advance time", "g"], [2, 1, "assert ✓", "g"]] },
    [[0, "A fixed {{sleep}} guesses how long things take."], [2, "Sometimes the system is slower and the assertion runs too early. Waiting on a condition (or a fake timer) is deterministic."]],
  ),
  "test:6": lanes(
    "Ramp up, hold, and judge by p95/p99 and errors — averages hide pain; soak tests expose leaks.",
    10,
    { "Virtual users": [[0, 3, "ramp-up", "w"], [3, 5, "steady load", "g"], [8, 2, "ramp-down", "w"]], "p99 latency": [[0, 3, "flat", "g"], [3, 3, "flat", "g"], [6, 4, "climbing → leak / pool exhaustion", "b"]] },
    [[0, "Start gently so you measure the system, not a cold start."], [6, "Over hours a leak shows up as rising latency. Averages would not."]],
  ),
  "test:7": layers(
    "End-to-end tests are slow and brittle — keep only the journeys that must never break.",
    ["Sign-up and login|worth an E2E test|g", "Checkout / payment|worth an E2E test|g", "Validation rules, edge cases|test at API / unit level instead|i", "CI artifacts|keep the Playwright trace viewer output|w"],
  ),
};
