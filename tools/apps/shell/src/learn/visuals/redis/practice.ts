import { compare, flow, lanes, layers, queue, seq } from "../kit.js";
import type { VisualMap } from "../types.js";

export const practice: VisualMap = {
  /* ---------------- model ---------------- */
  "model:0": layers(
    "A consistent key scheme is documentation: service:entity:id:variant, with a version where formats change.",
    ["shop:product:42|service : entity : id|g", "shop:product:42:en|… : variant (locale)|g", "shop:v3:product:42|a version when the format changes|i", "shop:user:{raw input}|never build keys from unvalidated input|b"],
  ),
  "model:1": compare(
    "Strings for blobs and counters, hashes for fields you touch independently, JSON for document paths.",
    ["String", "Hash", "JSON"],
    [["Shape", "opaque value or counter", "fields: name, email, plan", "nested document"], ["Update one field", "rewrite the whole value", "HSET one field", "JSON.SET path"], ["Memory", "one key", "efficient for small objects", "richer, bigger"]],
  ),
  "model:2": compare(
    "JSON is debuggable; MessagePack/Protobuf are smaller. Compress only large values — compression costs CPU.",
    ["JSON", "MessagePack / Protobuf", "+ compression"],
    [["Size", "largest", "smaller", "smallest for big values"], ["Debuggable", "yes", "needs tools", "needs tools"], ["CPU", "low", "low", "extra — skip for tiny values"]],
  ),
  "model:3": lanes(
    "A sorted set keeps members ordered by score: perfect for leaderboards, top-N and sliding windows.",
    6,
    { "ZINCRBY alice 10": [[0, 1, "alice 10", "g"]], "ZINCRBY bob 25": [[1, 1, "bob 25", "g"]], "ZINCRBY alice 20": [[2, 1, "alice 30", "g"]], "ZREVRANGE 0 1": [[3, 3, "1 alice 30 · 2 bob 25", "i"]] },
    [[0, "Each update is O(log N)."], [2, "Scores change in place and the order follows."], [3, "Range and rank queries read the ordered members directly."]],
  ),
  "model:4": compare(
    "Pick exactness against memory: sets are exact, HyperLogLog is ~12 KB approximate, bitmaps are one bit per id.",
    ["Set", "HyperLogLog", "Bitmap"],
    [["Counts", "exact uniques", "approximate uniques (≈0.8% error)", "boolean flag per integer id"], ["Memory", "grows with members", "~12 KB, fixed", "very compact"], ["Use for", "small exact sets", "unique visitors", "daily active flags"]],
  ),
  "model:5": flow(
    "Every key carries overhead — millions of tiny keys can cost more than their data. Pack small values into hashes.",
    "row",
    ["1M tiny keys|each has metadata|b", "Measure|MEMORY USAGE|i", "Pack into hashes|bucket by id|g", "Smaller footprint|less overhead|g"],
    [[0, 1], [1, 2], [2, 3]],
  ),
  "model:6": seq(
    "Round trips dominate: one MGET or pipeline serves many keys with a single network wait.",
    ["App", "Redis"],
    [[0, 1, "GET a"], [1, 0, "a", "", "r"], [0, 1, "GET b"], [1, 0, "b", "Three separate round trips…", "r"], [0, 1, "GET c"], [1, 0, "c", "", "r"], [0, 1, "MGET a b c", "…versus one round trip."], [1, 0, "a b c", "In Cluster, group keys by slot first.", "r"]],
  ),

  /* ---------------- uses ---------------- */
  "uses:0": queue(
    "Rate limiting: one shared counter or token bucket across every app instance — over the limit gets a 429.",
    { producer: "Requests", queue: "Redis counter / bucket", worker: "Allowed slot", arrival: 6, service: 2, workers: 2, capacity: 8, overflow: "drop" },
  ),
  "uses:1": seq(
    "A lock is SET NX PX with a unique token; release only if the token still matches (Lua compare-and-delete).",
    ["Client A", "Redis", "Client B"],
    [[0, 1, "SET lock tokenA NX PX 30000"], [1, 0, "OK (acquired)", "", "r"], [2, 1, "SET lock tokenB NX PX 30000"], [1, 2, "nil (busy)", "", "rb"], [0, 1, "Lua: if GET==tokenA then DEL", "Release only your own lock — never delete someone else's."], [1, 0, "released", "A slow holder can lose an expired lock → use fencing tokens for correctness-critical work.", "r"]],
  ),
  "uses:2": seq(
    "Sessions fit Redis: fast, shared across instances, idle expiry with a sliding TTL.",
    ["Browser", "App instance", "Redis"],
    [[0, 1, "request + session cookie"], [1, 2, "GET session:abc"], [2, 1, "session data", "", "r"], [1, 2, "EXPIRE session:abc 30m", "Sliding expiry: every use extends the idle TTL."], [1, 0, "response", "Any instance can serve the next request.", "r"]],
  ),
  "uses:3": queue(
    "Lists make simple queues, BullMQ adds retries and delays, Streams add consumer groups and acknowledgements.",
    { producer: "Producers", queue: "List / Stream", worker: "Consumer", arrival: 4, service: 1, workers: 2, capacity: 12, overflow: "block" },
  ),
  "uses:4": seq(
    "Classic pub/sub is fire-and-forget: a subscriber that is down misses messages and nothing is replayed.",
    ["Publisher", "Redis", "Subscriber (online)", "Subscriber (offline)"],
    [[0, 1, "PUBLISH news hello"], [1, 2, "hello", "", "r"], [1, 3, "(not connected)", "The offline subscriber never sees it.", "rb"], [3, 1, "reconnects later", "There is no replay."], [1, 3, "nothing", "Use Streams when you need durability or consumer groups.", "rb"]],
  ),
  "uses:5": seq(
    "SET NX with a TTL records 'already done' so a retry doesn't repeat the side effect.",
    ["Client", "App", "Redis"],
    [[0, 1, "POST /charge  key=abc"], [1, 2, "SET idem:abc NX EX 86400"], [2, 1, "OK (first time)", "", "r"], [1, 0, "charged", "", "r"], [0, 1, "retry  key=abc"], [1, 2, "SET idem:abc NX"], [2, 1, "nil (exists)", "The key already exists — skip the work.", "rb"], [1, 0, "return saved result", "Keep the TTL longer than the longest retry window.", "r"]],
  ),

  /* ---------------- scale ---------------- */
  "scale:0": seq(
    "Replicas copy the primary asynchronously — use them to scale tolerant reads, not for strong consistency.",
    ["App", "Primary", "Replica"],
    [[0, 1, "write"], [1, 0, "ack", "", "r"], [1, 2, "replicate (async)"], [0, 2, "read from replica", "Possibly before the copy arrived."], [2, 0, "old value (lag)", "", "rb"], [1, 1, "primary crashes", "A failover can lose writes not yet replicated.", "b"]],
  ),
  "scale:1": compare(
    "Sentinel = one primary with failover. Cluster = data sharded across many primaries, plus failover.",
    ["Sentinel", "Cluster"],
    [["Data lives on", "one primary (all keys)", "many primaries (hash slots)"], ["Scales", "reads via replicas", "reads and writes, memory"], ["Failover", "yes", "yes"], ["Constraints", "none on keys", "multi-key ops need one slot"]],
  ),
  "scale:2": flow(
    "16,384 hash slots map keys to nodes; a {hash tag} forces related keys into the same slot.",
    "row",
    ["{user:1}:cart|slot = CRC16('user:1') % 16384|i", "{user:1}:profile|same tag → same slot|i", "Slot 5474|lives on one node|g", "Node B|multi-key ops work here|g"],
    [[0, 2, "hash tag"], [1, 2, "hash tag"], [2, 3, "owned by"]],
  ),
  "scale:3": seq(
    "In Cluster, multi-key commands need every key in one slot — otherwise CROSSSLOT.",
    ["Client", "Cluster"],
    [[0, 1, "MGET cart:1 cart:2", "The two keys hash to different slots."], [1, 0, "CROSSSLOT error", "", "rb"], [0, 1, "MGET {u1}:cart {u1}:profile", "Design hash tags up front."], [1, 0, "values", "Same slot → the multi-key command works.", "r"]],
  ),
  "scale:4": compare(
    "RDB = periodic snapshots, AOF = a log of every write. Both help a cache restart warm; neither is a substitute for a database.",
    ["RDB snapshot", "AOF log"],
    [["How", "point-in-time dump", "append every write, fsync per second"], ["Data-loss window", "since the last snapshot", "about 1 second"], ["Restart", "fast", "slower (replay)"], ["Cost", "fork → copy-on-write spike", "bigger files, rewrites"]],
  ),
  "scale:5": lanes(
    "Failover loses writes that the old primary acknowledged but never replicated — retry with timeouts.",
    9,
    { "Old primary": [[0, 3, "serving writes", "g"], [3, 1, "crash", "b"]], "Replica": [[0, 3, "lagging copy", "i"], [4, 5, "promoted → new primary", "g"]], "Clients": [[3, 1, "writes fail", "b"], [4, 1, "reconnect + retry", "w"], [5, 4, "normal", "g"]] },
    [[3, "The primary dies. Writes acknowledged but not yet replicated are gone."], [4, "A replica is promoted; clients briefly cannot write."], [5, "Clients that retry with timeouts recover. Don't store irreplaceable data only here."]],
  ),
  "scale:6": flow(
    "Resharding moves slots between nodes — it costs CPU and network, so add nodes before you saturate.",
    "row",
    ["3 nodes|nearly full|b", "Add node|empty|i", "Move slots|CPU + network cost|w", "4 nodes|balanced|g"],
    [[0, 1], [1, 2, "rebalance"], [2, 3, "done"]],
  ),

  /* ---------------- node ---------------- */
  "node:0": compare(
    "node-redis is the recommended, officially maintained client; ioredis is widely used in existing code.",
    ["node-redis", "ioredis"],
    [["Status", "official, recommended for new projects", "mature, widely used"], ["TypeScript", "built-in types", "good types"], ["New commands", "first to support them", "may lag"]],
    0,
  ),
  "node:1": seq(
    "One client per process; call {{connect()}}; ALWAYS attach an error listener or a connection error crashes the process.",
    ["Your app", "Redis client", "Redis"],
    [[0, 1, "createClient()"], [0, 1, "client.on('error', …)", "Attach the listener BEFORE connecting."], [0, 1, "await client.connect()"], [1, 2, "connect"], [2, 1, "connection lost", "", "rb"], [1, 0, "'error' event → logged", "Without a listener the error is thrown and the process exits.", "r"]],
  ),
  "node:2": flow(
    "Decide per call: if Redis is down, fall back to the database (fail open) or reject the request (fail closed).",
    "row",
    ["App call|with a timeout|i", "Redis|slow / down?|w", "Fail open|use the database|g", "Fail closed|reject the request|b"],
    [[0, 1, "GET key"], [1, 2, "timeout → fallback"], [1, 3, "security-sensitive"]],
    [0, 1, 2],
    ["Every call has a connect and command timeout and a reconnect strategy with jittered backoff.", "Redis fails to answer in time…", "Cache reads should usually fail open. A rate limiter or lock may need to fail closed."],
  ),
  "node:3": compare(
    "Pipelines save round trips but aren't atomic; MULTI/EXEC runs together without interleaving (no rollback); WATCH gives optimistic locking.",
    ["Pipeline", "MULTI / EXEC", "WATCH + MULTI"],
    [["Goal", "fewer round trips", "run together, no interleaving", "optimistic locking"], ["Atomic?", "no", "yes (queued commands)", "yes if nothing changed"], ["Rollback", "—", "none for logic errors", "aborts if the key changed"]],
  ),
  "node:4": seq(
    "A Lua script runs atomically on the server — ideal for compare-and-delete locks and rate limiters.",
    ["Node client", "Redis (Lua)"],
    [[0, 1, "EVAL script KEYS=[lock] ARGV=[token]"], [1, 1, "if GET == token then DEL", "The check and the delete happen with nothing in between."], [1, 0, "1 (deleted)", "Keep scripts short; pass keys via KEYS for Cluster; never block inside.", "r"]],
  ),
  "node:5": flow(
    "A subscriber or a blocking command (BLPOP) holds its connection — give them their own duplicated clients.",
    "row",
    ["Main client|GET / SET|g", "Subscriber client|client.duplicate()|i", "Blocking client|BLPOP|w", "Redis|all three connected|g"],
    [[0, 3, "normal commands"], [1, 3, "SUBSCRIBE (stays busy)"], [2, 3, "BLPOP (waits)"]],
  ),
  "node:6": seq(
    "On shutdown stop taking requests, finish in-flight work, then quit() so pending replies flush.",
    ["Orchestrator", "Node app", "Redis"],
    [[0, 1, "SIGTERM"], [1, 1, "stop accepting requests"], [1, 1, "finish in-flight work"], [1, 2, "client.quit()", "QUIT sends pending commands first and waits for replies."], [2, 1, "OK", "", "r"], [1, 0, "exit", "Closing abruptly can lose queued commands and leave locks to expire on their own.", "r"]],
  ),
  "node:7": flow(
    "On the wire everything is strings or Buffers — handle JSON, Dates and BigInts yourself, and keep a schema version.",
    "row",
    ["Object|Date, BigInt, nested|w", "Serialise|explicit handling|i", "Redis|string / Buffer|g", "Parse + validate|check schema version|g"],
    [[0, 1], [1, 2], [2, 3]],
  ),

  /* ---------------- ops ---------------- */
  "ops:0": layers(
    "Hit ratio alone hides problems — read it with evictions, memory, latency and replication lag.",
    ["Hit ratio|keyspace_hits ÷ (hits + misses)|g", "Evictions|evicted_keys rising = too small|b", "Memory|used_memory vs maxmemory|w", "Throughput & latency|ops/sec, latency percentiles|i", "Replication lag|replica offset behind primary|w"],
  ),
  "ops:1": lanes(
    "KEYS walks the whole keyspace in one blocking call; SCAN iterates in small steps. UNLINK frees big keys in the background.",
    8,
    { "KEYS *": [[0, 5, "blocks everyone", "b"]], "SCAN 0…": [[0, 1, "batch", "g"], [1, 1, "batch", "g"], [2, 1, "batch", "g"], [3, 1, "batch", "g"], [4, 1, "batch", "g"]], "Other clients": [[0, 5, "waiting during KEYS", "w"], [5, 3, "normal", "g"]] },
    [[0, "KEYS blocks the single thread for the whole scan."], [3, "SCAN does the same work in tiny steps, so other commands interleave. Likewise UNLINK instead of DEL for big keys."]],
  ),
  "ops:2": flow(
    "SLOWLOG finds slow commands, LATENCY finds spikes; avoid MONITOR on busy production instances.",
    "row",
    ["Latency spike|users notice|b", "SLOWLOG|commands over threshold|i", "Culprit|big key / O(N) command|w", "Fix|split, paginate, SCAN|g"],
    [[0, 1], [1, 2], [2, 3]],
  ),
  "ops:3": flow(
    "Find big and cold keys with scanning tools — carefully, since they scan the keyspace.",
    "row",
    ["redis-cli --bigkeys|samples by size|i", "MEMORY USAGE key|exact size|i", "OBJECT FREQ / IDLETIME|how often / how long idle|w", "Trim or evict|reclaim memory|g"],
    [[0, 1], [1, 2], [2, 3]],
  ),
  "ops:4": lanes(
    "A snapshot forks the process; copy-on-write can spike memory and latency, so leave headroom.",
    8,
    { "Redis memory": [[0, 2, "normal", "g"], [2, 3, "fork → pages copied as writes arrive", "w"], [5, 3, "normal", "g"]], "Latency": [[0, 2, "flat", "g"], [2, 1, "fork pause", "b"], [3, 2, "elevated", "w"], [5, 3, "flat", "g"]] },
    [[2, "BGSAVE forks the process. Pages are shared until written."], [3, "Heavy writes during the snapshot copy pages, raising memory; fragmentation ratio well above 1 means wasted memory."]],
  ),
  "ops:5": layers(
    "Plan for the working set, growth, replication buffers and snapshot headroom — alert at 70–80%.",
    ["Working set|the hot data you must keep|g", "Value growth|data grows with the product|i", "Replication buffers|extra memory per replica|w", "Snapshot headroom|room for copy-on-write|w", "Alert|at 70–80% of maxmemory|b"],
  ),
  "ops:6": layers(
    "Alert on user impact and capacity, and give every alert a runbook.",
    ["Hit ratio drop|more load on the database|b", "Eviction spike|memory too small|b", "Replication lag|stale replicas, failover risk|w", "Rejected connections|client limit reached|w", "Latency percentiles & failovers|what users feel|b"],
  ),

  /* ---------------- sec ---------------- */
  "sec:0": layers(
    "Each application gets its own ACL user with only the commands and key patterns it needs — over TLS.",
    ["TLS in transit|encrypts traffic|g", "Authentication|no anonymous access|g", "ACL user per app|limited commands + key patterns|g", "Never|share the default user between services|b"],
  ),
  "sec:1": flow(
    "A Redis reachable from the internet is found and compromised within minutes — keep it private.",
    "row",
    ["Internet|scanners everywhere|b", "Firewall / security group|blocks public access|g", "Private network|app servers only|g", "Redis|never exposed|g"],
    [[0, 1, "blocked"], [1, 2, "allow app subnet"], [2, 3]],
  ),
  "sec:2": layers(
    "Restrict dangerous commands for application users using ACL categories.",
    ["FLUSHALL / FLUSHDB|wipes the data|b", "CONFIG / DEBUG|changes or crashes the server|b", "KEYS|blocks the main thread|w", "ACL categories|-@dangerous for app users|g"],
  ),
  "sec:3": layers(
    "A cache is a copy of your data: treat it with the same privacy rules.",
    ["Don't cache secrets|or regulated data without need|b", "Short TTLs|limit how long copies live|g", "Encrypt at rest|where required|g", "Deletion requests|must remove cached copies too|w"],
  ),
  "sec:4": seq(
    "Put the tenant in every key and restrict ACL users by key pattern — never build keys from raw input.",
    ["Tenant A app", "Redis ACL", "Tenant B data"],
    [[0, 1, "GET tenantA:order:7"], [1, 0, "allowed (~tenantA:*)", "", "r"], [0, 1, "GET tenantB:order:7", "A bug or attack builds another tenant's key."], [1, 2, "blocked by key pattern", "", "b"], [1, 0, "NOPERM", "", "rb"]],
  ),

  /* ---------------- design ---------------- */
  "design:0": flow(
    "Product catalogue: cache-aside with jittered TTLs, event invalidation, an L1 for hot items and negative caching.",
    "row",
    ["Request|product page|i", "L1 in-process|hot items|g", "Redis|cache-aside + jitter|g", "Database|catalogue source|w", "Update event|invalidates keys|b"],
    [[0, 1, "hot?"], [1, 2, "miss"], [2, 3, "miss → load"], [4, 2, "product changed → DEL"]],
  ),
  "design:1": seq(
    "A session store is critical infrastructure: sliding TTL, replication, small payloads, rotated ids.",
    ["Browser", "App", "Redis (replicated)"],
    [[0, 1, "request + session id"], [1, 2, "GET session:id"], [2, 1, "session", "", "r"], [1, 2, "EXPIRE 30m (sliding)"], [1, 0, "response + rotated id on login", "Keep payloads small; persist and replicate if losing sessions is costly.", "r"]],
  ),
  "design:2": flow(
    "Timelines: fan out on write for most users, fan out on read for celebrities, keep a bounded sorted set of ids.",
    "row",
    ["New post|author posts|i", "Fan-out on write|push id to followers' sorted sets|g", "Timeline ZSET|ids scored by time, trimmed|g", "Hydrate|fetch post objects by id|g"],
    [[0, 1, "normal author"], [1, 2, "ZADD"], [2, 3, "read: ZREVRANGE"]],
  ),
  "design:3": layers(
    "An HTTP response cache layers CDN, Redis and in-process — key by every varying input.",
    ["CDN|public, shareable data|g", "Redis|shared computed results|g", "In-process|tiny, very hot values|i", "Keys|include every input that varies the response|w", "Invalidation|decide who clears which layer|b"],
    "request",
  ),
  "design:4": seq(
    "A leaderboard is a sorted set: ZINCRBY to score, range commands to read ranks.",
    ["Game server", "Redis ZSET", "Web page"],
    [[0, 1, "ZINCRBY board 50 alice"], [0, 1, "ZINCRBY board 70 bob"], [2, 1, "ZREVRANGE board 0 9 WITHSCORES"], [1, 2, "top 10 with scores", "Shard by period or region for scale; snapshot to a database for history.", "r"], [2, 1, "ZREVRANK board alice"], [1, 2, "rank 2", "", "r"]],
  ),
  "design:5": queue(
    "A distributed rate limiter: token bucket per key in Redis via Lua; 429 + Retry-After; decide fail-open vs fail-closed.",
    { producer: "Requests", queue: "Per-key bucket (Redis + Lua)", worker: "Allowed slot", arrival: 6, service: 2, workers: 2, capacity: 8, overflow: "drop" },
  ),
};
