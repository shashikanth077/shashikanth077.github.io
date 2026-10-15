import { compare, flow, lanes, layers, seq } from "../kit.js";
import type { VisualMap } from "../types.js";

export const core: VisualMap = {
  /* ---------------- fund ---------------- */
  "fund:0": lanes(
    "Hit ratio is leverage: moving from 95% to 99% cuts origin load five-fold.",
    10,
    { "95% hit ratio": [[0, 9, "hits", "g"], [9, 1, "miss", "b"]], "99% hit ratio": [[0, 9, "hits", "g"], [9, 1, "…", "g"]], "Origin load": [[0, 5, "5% of traffic", "w"], [5, 5, "1% of traffic ÷5", "g"]] },
    [[0, "Avg latency = hit% × cache time + miss% × origin time."], [5, "Origin load = traffic × miss ratio. Going 95% → 99% means 5 misses become 1 per 100 requests."]],
  ),
  "fund:1": lanes(
    "One main thread runs every command: each is atomic, but one slow command delays everyone.",
    9,
    { "Client A": [[0, 1, "GET", "g"], [5, 1, "GET", "g"]], "Client B": [[1, 1, "SET", "g"], [6, 1, "SET", "g"]], "Main thread": [[0, 1, "GET", "g"], [1, 1, "SET", "g"], [2, 3, "KEYS * (slow, O(N))", "b"], [5, 1, "GET", "g"], [6, 1, "SET", "g"]] },
    [[0, "Commands run one after another — never interleaved, so each is atomic."], [2, "One O(N) command occupies the thread…"], [4, "…and every other client waits. Keep commands O(1) / O(log N); use SCAN instead of KEYS."]],
  ),
  "fund:2": flow(
    "If losing the whole cache only makes things slower, the design is right.",
    "row",
    ["Cache wiped|restart or failover|b", "Requests miss|origin load rises|w", "Database serves|slower but correct|g", "Cache refills|hit ratio recovers|g"],
    [[0, 1], [1, 2], [2, 3]],
  ),
  "fund:3": compare(
    "Core caching commands are the same everywhere; check licences and managed-service support.",
    ["Redis 8", "Valkey", "Managed services"],
    [["Licence", "choice incl. AGPLv3", "BSD (Linux Foundation)", "pay-as-you-go"], ["Origin", "Redis Inc.", "fork of Redis 7.2", "ElastiCache, MemoryDB…"], ["Core caching commands", "GET/SET/EXPIRE…", "same", "same"]],
  ),
  "fund:4": compare(
    "Choose the structure for how you read the data, not just how you write it.",
    ["String", "Hash", "List", "Set", "Sorted set", "Stream"],
    [["Good for", "blobs, counters", "objects with fields", "simple queues", "unique members", "rankings, windows", "durable event log"]],
  ),
  "fund:5": layers(
    "Cache what is read often, costly to compute, tolerant of staleness and easy to key.",
    ["Good fit|read often, expensive to compute, slightly stale OK|g", "Good fit|same answer for many users, simple key|g", "Poor fit|highly personalised results|b", "Poor fit|queries rarely repeated, or data that must always be fresh|b"],
  ),

  /* ---------------- pat ---------------- */
  "pat:0": seq(
    "Cache-aside: the app owns the logic — read cache, on a miss load from the database and fill the cache.",
    ["App", "Redis", "Database"],
    [[0, 1, "GET key"], [1, 0, "miss", "", "r"], [0, 2, "SELECT row"], [2, 0, "row", "", "r"], [0, 1, "SET key + TTL (jittered)"], [0, 1, "write path: DEL key", "On writes: update the database, then delete the key — don't update it."]],
  ),
  "pat:1": seq(
    "Read-through: callers only talk to the cache layer, which loads missing data itself.",
    ["App", "Cache layer", "Redis", "Database"],
    [[0, 1, "get(key)"], [1, 2, "GET key"], [2, 1, "miss", "", "r"], [1, 3, "run loader"], [3, 1, "row", "", "r"], [1, 2, "SET key + TTL"], [1, 0, "data", "One place owns loading, TTL and stampede policy.", "r"]],
  ),
  "pat:2": seq(
    "Write-through: the write returns only after both cache and database have it — reads stay fresh.",
    ["App", "Cache layer", "Redis", "Database"],
    [[0, 1, "write(value)"], [1, 2, "SET key"], [1, 3, "write row (sync)", "The write waits for the database."], [3, 1, "ok", "", "r"], [1, 0, "ack after BOTH succeed", "Slower writes, but reads are always warm and consistent.", "r"]],
  ),
  "pat:3": seq(
    "Write-behind: acknowledge fast, flush later — fastest writes, but a crash before the flush loses data.",
    ["App", "Redis", "Worker", "Database"],
    [[0, 1, "write(value)"], [1, 0, "ack (fast)", "The caller is acknowledged immediately.", "r"], [1, 2, "queued change"], [2, 3, "flush in batches (later)", "A crash before this step loses writes — use a durable queue.", "b"], [3, 2, "ok", "", "r"]],
  ),
  "pat:4": seq(
    "Write-around: writes skip the cache so rarely-read data doesn't pollute it; the first read after a write misses.",
    ["App", "Redis", "Database"],
    [[0, 2, "write row", "Writes go straight to the database."], [0, 1, "(cache untouched)", "", "r"], [0, 1, "later: GET key"], [1, 0, "miss", "", "r"], [0, 2, "read row"], [0, 1, "SET key + TTL"]],
  ),
  "pat:5": lanes(
    "Refresh before expiry (or serve stale while one request refreshes) so users never wait for a reload.",
    10,
    { "Cached value": [[0, 6, "fresh", "g"], [6, 2, "stale but served", "w"], [8, 2, "fresh again", "g"]], "Background refresh": [[6, 2, "one request reloads", "i"]], "Users": [[0, 10, "always get an instant answer", "g"]] },
    [[0, "The value is fresh."], [6, "The soft TTL passes. The next request returns the stale value immediately and triggers ONE background refresh."], [8, "The new value lands — nobody waited and there was no stampede."]],
  ),
  "pat:6": seq(
    "Cache 'not found' for a short TTL so repeated lookups for missing ids don't hit the database.",
    ["Client", "App", "Redis", "Database"],
    [[0, 1, "GET /item/99999"], [1, 2, "GET item:99999"], [2, 1, "miss", "", "r"], [1, 3, "SELECT … id=99999"], [3, 1, "no row", "", "r"], [1, 2, "SET item:99999 = NOT_FOUND (60s)", "Store the negative result briefly."], [0, 1, "same request again"], [1, 2, "GET item:99999"], [2, 1, "NOT_FOUND (hit)", "The database is spared. Pair with validation or a Bloom filter.", "r"]],
  ),
  "pat:7": flow(
    "L1 (in-process) is free but local; L2 (Redis) is shared. Invalidate across instances with short L1 TTLs or pub/sub.",
    "row",
    ["Request|on instance 1|i", "L1 in-process|zero network|g", "L2 Redis|shared|g", "Database|source of truth|w"],
    [[0, 1, "check L1"], [1, 2, "L1 miss"], [2, 3, "L2 miss"], [3, 2, "fill L2"], [2, 1, "fill L1"]],
    undefined,
    ["The hottest reads are answered from process memory with no network hop.", "On a miss, ask the shared cache.", "On another miss, load from the database…", "…then fill Redis so other instances benefit…", "…and fill L1 with a short TTL, since other instances can't see this instance's L1."],
  ),
  "pat:8": seq(
    "Client-side caching with tracking: Redis tells the client when a cached key changes — near-zero-latency reads.",
    ["Client (local cache)", "Redis (RESP3)"],
    [[0, 1, "GET user:1 (tracking on)"], [1, 0, "value — server remembers client cached it", "", "r"], [0, 0, "later GETs served locally", "No network round trip at all."], [1, 0, "invalidate user:1", "Another client changed the key; Redis pushes an invalidation.", "b"], [0, 0, "drop local copy"], [0, 1, "GET user:1"], [1, 0, "fresh value", "", "r"]],
  ),

  /* ---------------- ttl ---------------- */
  "ttl:0": lanes(
    "A TTL is a staleness budget: longer means a higher hit ratio but older data.",
    10,
    { "Short TTL (10s)": [[0, 1, "load", "w"], [1, 1, "hit", "g"], [2, 1, "load", "w"], [3, 1, "hit", "g"], [4, 1, "load", "w"], [5, 1, "hit", "g"], [6, 1, "load", "w"], [7, 1, "hit", "g"], [8, 1, "load", "w"], [9, 1, "hit", "g"]], "Long TTL (1h)": [[0, 1, "load", "w"], [1, 9, "hits — but data may be up to 1h old", "g"]] },
    [[0, "Both start with a miss that loads the origin."], [2, "Short TTL: fresher data, more loads on the origin."], [5, "Long TTL: far fewer loads, but readers may see old data. Pick from how wrong the data may be, and for how long."]],
  ),
  "ttl:1": lanes(
    "Without jitter a bulk load expires together; random jitter spreads the misses.",
    10,
    { "No jitter": [[0, 5, "10,000 keys cached", "g"], [5, 1, "ALL expire → miss wave", "b"], [6, 4, "origin overloaded", "b"]], "With ±15% jitter": [[0, 4, "keys cached", "g"], [4, 1, "few", "w"], [5, 1, "few", "w"], [6, 1, "few", "w"], [7, 3, "steady, small load", "g"]] },
    [[5, "Keys created together expire together."], [6, "Jitter turns one wave into a trickle the origin can absorb."]],
  ),
  "ttl:2": compare(
    "When memory is full, {{maxmemory-policy}} decides who goes. For a cache, usually {{allkeys-lru}} or {{allkeys-lfu}}.",
    ["noeviction", "allkeys-lru / lfu", "volatile-lru / lfu", "volatile-ttl"],
    [["On memory full", "rejects writes", "evicts any key", "evicts only keys with TTL", "evicts soonest-to-expire"], ["Good for", "a database", "a pure cache", "mixed cache + durable keys", "short-lived data"], ["Risk", "errors on write", "may evict hot keys (lru)", "no TTL keys = nothing to evict", "ignores usage"]],
    1,
  ),
  "ttl:3": compare(
    "LRU forgets what's old; LFU remembers what's popular and resists one-off scans.",
    ["LRU", "LFU"],
    [["Evicts", "least recently used", "least frequently used"], ["One big scan", "flushes popular keys", "popular keys survive"], ["Redis implementation", "samples a few keys (approximate)", "approximate counters with decay"]],
    1,
  ),
  "ttl:4": flow(
    "Expired keys go away lazily when touched and actively by a background sampler — they may linger briefly.",
    "row",
    ["Key expires|TTL passes|w", "Lazy|removed on next access|g", "Active|background sampling|i", "Memory freed|maybe a bit later|g"],
    [[0, 1, "someone reads it"], [0, 2, "or sampled"], [1, 3], [2, 3]],
  ),
  "ttl:5": layers(
    "Per-field expiry lets one hash hold many short-lived entries — check your engine version first.",
    ["Hash user:42|one key|i", "field session:a|expires in 10m|w", "field session:b|expires in 1h|g", "field profile|no expiry|g"],
  ),
  "ttl:6": flow(
    "Evictions lower the hit ratio, which raises database load and latency — a feedback loop. Size for the hot working set.",
    "cycle",
    ["Memory full|evictions start|b", "Hit ratio drops|more misses|w", "DB load rises|latency up|b", "More cache fills|memory pressure grows|w"],
    [[0, 1], [1, 2], [2, 3], [3, 0, "feedback loop"]],
  ),

  /* ---------------- inv ---------------- */
  "inv:0": compare(
    "TTL-only is simple but stale up to the TTL; explicit invalidation is fresher but every write path must cooperate.",
    ["TTL only", "Explicit invalidation", "Both (usual choice)"],
    [["Freshness", "up to the TTL old", "fresh after each write", "fresh + safety net"], ["Effort", "lowest", "all writers must delete keys", "medium"], ["Failure mode", "stale data", "missed invalidation = stale forever", "TTL bounds the damage"]],
    2,
  ),
  "inv:1": seq(
    "After a database write, DELETE the key and let the next read repopulate — don't race writers to SET it.",
    ["Writer", "Database", "Redis", "Next reader"],
    [[0, 1, "UPDATE row"], [0, 2, "DEL key", "Delete rather than set a value that could be overtaken."], [3, 2, "GET key"], [2, 3, "miss", "", "r"], [3, 1, "SELECT row (fresh)"], [3, 2, "SET key"]],
  ),
  "inv:2": seq(
    "The cache-aside race: a slow reader can write an OLD value back after the writer invalidated.",
    ["Reader", "Database", "Writer", "Redis"],
    [[0, 3, "GET key"], [3, 0, "miss", "", "r"], [0, 1, "read row (old)", "The reader loads the old row…"], [2, 1, "UPDATE row (new)", "…meanwhile a writer updates the database…"], [2, 3, "DEL key", "…and deletes the key."], [0, 3, "SET key = OLD", "Now the stale value is cached until the TTL.", "b"], [3, 3, "stale!", "Mitigate: short TTLs, versioned values, or delayed double-delete.", "b"]],
  ),
  "inv:3": flow(
    "Publish change events from the source of truth; consumers delete or refresh keys.",
    "row",
    ["Database change|source of truth|g", "Outbox / CDC|reliable events|i", "Event bus|Streams / Kafka|w", "Consumer|deletes affected keys|g", "Redis|fresh after next read|g"],
    [[0, 1], [1, 2], [2, 3], [3, 4, "DEL key"]],
  ),
  "inv:4": flow(
    "Bump a version in the key to invalidate a whole group at once; old keys just age out.",
    "row",
    ["catalog:v7:item:42|current|g", "Bump version → v8|one INCR|w", "catalog:v8:item:42|new keys fill|g", "v7 keys|expire / evicted|p"],
    [[0, 1, "data model changes"], [1, 2, "readers use v8"], [0, 3, "unreferenced"]],
  ),
  "inv:5": layers(
    "Keep a set of cache keys per entity so one change invalidates exactly what depends on it.",
    ["Entity product:7|changed in the database|w", "Set deps:product:7|lists dependent keys|i", "Key page:home|contains product 7|b", "Key search:shoes|contains product 7|b", "Action|DEL every key in the set|g"],
  ),

  /* ---------------- fail ---------------- */
  "fail:0": seq(
    "Stampede: a hot key expires and many requests rebuild it at once. Let ONE rebuild while the rest wait or use stale.",
    ["Req 1", "Req 2…100", "Redis", "Origin"],
    [[2, 2, "hot key expires", "", "b"], [0, 2, "GET key → miss"], [1, 2, "GET key → miss (×99)", "Everyone misses at once.", "b"], [0, 3, "rebuild"], [1, 3, "rebuild ×99", "100 identical rebuilds overload the origin.", "b"], [0, 2, "Fix: only req 1 takes the lock", "Single-flight / lock: one rebuilds, the others wait or serve stale."]],
  ),
  "fail:1": lanes(
    "Avalanche: many keys expire together, or Redis goes down, and the whole load lands on the database.",
    9,
    { "Cache hit ratio": [[0, 4, "healthy ~97%", "g"], [4, 3, "collapses → 0%", "b"], [7, 2, "recovering", "w"]], "Database load": [[0, 4, "low", "g"], [4, 3, "spike: everything misses", "b"], [7, 2, "recovering", "w"]] },
    [[4, "Mass expiry or a cache outage — every request falls through."], [7, "Prevent: TTL jitter, highly available Redis, circuit breakers, and a database sized for a short surge."]],
  ),
  "fail:2": seq(
    "Penetration: ids that never exist always miss and always hit the database. Cache the 'not found', validate, rate-limit.",
    ["Attacker", "App", "Redis", "Database"],
    [[0, 1, "GET /item/-1"], [1, 2, "GET item:-1"], [2, 1, "miss", "", "r"], [1, 3, "SELECT (nothing)"], [0, 1, "GET /item/-2 … -100000", "Endless unique bad ids bypass the cache.", "b"], [1, 3, "100,000 pointless queries", "", "b"], [1, 0, "Fix: validate, negative cache, rate limit, Bloom filter", "Reject impossible ids before they cost anything.", "r"]],
  ),
  "fail:3": flow(
    "A hot key funnels huge traffic into one shard or thread — add an L1, replicate the value under suffixed keys, or use replicas.",
    "row",
    ["Many clients|all want key X|i", "Hot key X|one shard saturates|b", "L1 cache|in-process|g", "x:1 x:2 x:3|copies spread across slots|g"],
    [[0, 1, "everyone → one key"], [0, 2, "absorbs reads"], [0, 3, "random suffix"]],
    [0, 1, 2],
    ["Every client asks for the same key.", "Hot key: one shard/thread takes the whole load and becomes the bottleneck.", "Remedy 1: serve the hottest reads from an in-process L1 cache. Remedy 2: store copies under several keys and pick one at random."],
  ),
  "fail:4": lanes(
    "A big key makes reads and deletes slow, blocking the main thread — split it, page it, UNLINK it.",
    8,
    { "Main thread": [[0, 1, "GET", "g"], [1, 4, "DEL bigkey (frees 2 GB)", "b"], [5, 1, "GET", "g"]], "Other clients": [[1, 4, "blocked — latency spike", "w"]] },
    [[1, "Deleting or reading a huge value occupies the single thread."], [5, "Fix: split into smaller keys, page large collections, use UNLINK (frees memory in the background)."]],
  ),
  "fail:5": seq(
    "A key that omits a dimension that changes the response (user, tenant, locale) can serve one user another's data.",
    ["Alice", "App", "Redis", "Bob"],
    [[0, 1, "GET /account"], [1, 2, "SET page:account = Alice's data", "BAD KEY: no user id in the key.", "b"], [3, 1, "GET /account"], [1, 2, "GET page:account"], [2, 1, "Alice's data!", "", "rb"], [1, 3, "Bob sees Alice's account", "", "rb"], [1, 2, "Fix: page:account:user:42", "Build keys from EVERY input that affects the result.", "r"]],
  ),
  "fail:6": lanes(
    "A new or flushed cache is cold — pre-warm the hottest keys and ramp traffic.",
    9,
    { "Cache": [[0, 2, "empty (cold)", "b"], [2, 3, "warming…", "w"], [5, 4, "warm", "g"]], "Origin load": [[0, 2, "100% of traffic", "b"], [2, 3, "falling", "w"], [5, 4, "normal", "g"]] },
    [[0, "After a deploy or flush every request misses."], [2, "Pre-warm the hottest keys and shift traffic gradually while the origin copes."]],
  ),
  "fail:7": seq(
    "Replication is asynchronous: a replica can return an old value or miss a just-written key.",
    ["App", "Primary", "Replica"],
    [[0, 1, "SET key = v2"], [1, 2, "replicate… (lag)", "Asynchronous: takes time."], [0, 2, "GET key", "The app reads from the replica too soon."], [2, 0, "v1 (stale)", "", "rb"], [1, 2, "v2 arrives", "Use versions or timestamps so older writes can't overwrite newer ones."]],
  ),
};
