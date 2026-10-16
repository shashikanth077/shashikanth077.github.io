import { compare, flow, queue, seq } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { arch, grp, svc } from "./kit.js";

/* Storage and databases: S3, presigned uploads, RDS MySQL, Aurora, RDS Proxy, DynamoDB, ElastiCache. */

export const data: ConceptDef[] = [
  {
    t: "S3: buckets, keys and storage classes",
    lv: 1,
    s: `{{Amazon S3}} stores {{objects}} (any bytes plus metadata) under {{keys}} in {{buckets}}; "folders" are just key prefixes ({{products/42/main.jpg}}). It is designed for 99.999999999 % durability, offers strong read-after-write consistency, and holds single objects up to 50 TB (via multipart upload; one PUT carries up to 5 GB). {{Storage classes}} trade retrieval speed for price: {{Standard}} for hot data, {{Intelligent-Tiering}} when access is unknown, {{Standard-IA}} / {{One Zone-IA}} for infrequent access, {{Glacier Instant / Flexible / Deep Archive}} for archives. {{Lifecycle rules}} move or expire objects automatically, and {{versioning}} keeps old versions so a bad overwrite or delete can be undone.`,
    r: `ShopNest: product images in Standard behind CloudFront; raw uploads expire after 7 days once thumbnails exist; invoices move to Glacier Instant Retrieval after 90 days.`,
    i: `Which storage class for logs read twice a year but kept 7 years? How do lifecycle rules and versioning work together?`,
    c: `{
  "Rules": [
    { "ID": "expire-raw-uploads", "Status": "Enabled",
      "Filter": { "Prefix": "uploads/" },
      "Expiration": { "Days": 7 } },
    { "ID": "archive-invoices", "Status": "Enabled",
      "Filter": { "Prefix": "invoices/" },
      "Transitions": [{ "Days": 90, "StorageClass": "GLACIER_IR" }],
      "NoncurrentVersionExpiration": { "NoncurrentDays": 365 } }
  ]
}`,
    v: compare(
      "Pay for the access pattern: hot data in Standard, unknown in Intelligent-Tiering, cold in IA or Glacier — and let lifecycle rules move it.",
      ["Standard", "Intelligent-Tiering", "Standard-IA", "Glacier Deep Archive"],
      [
        ["Access", "Frequent", "Unknown / changing", "Monthly-ish", "Rare, hours to restore"],
        ["Retrieval fee", "No", "No", "Yes, per GB", "Yes + restore time"],
        ["Minimum duration", "None", "None", "30 days", "180 days"],
        ["Storage price", "Highest", "Auto-moves between tiers", "Lower", "Lowest"],
        ["ShopNest", "Product images", "User uploads", "Old order exports", "7-year audit archive"],
      ],
    ),
  },
  {
    t: "Presigned URLs: uploads straight from React",
    lv: 1,
    s: `Users upload avatars and product photos. Streaming them through the Node API wastes its CPU, memory and bandwidth. Instead the API — after checking the user is signed in and allowed — creates a {{presigned URL}}: a URL signed with the API role's credentials that allows one specific action ({{PUT}} this key, with this content type) for a short time. The browser uploads directly to S3; an S3 event then triggers processing (resize, virus scan). For size limits use a {{presigned POST}} with a {{content-length-range}} condition. The bucket needs a CORS rule allowing your site's origin to PUT; it stays private.`,
    r: `Generate the key on the server ({{uploads/<userId>/<uuid>.jpg}}) — never let the client choose an arbitrary key — and keep expiry to minutes.`,
    i: `How would you let users upload 20 MB images without them passing through your API servers? How do you limit size and type?`,
    c: `// API: hand out a 5-minute upload URL for the signed-in user
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";

const s3 = new S3Client({});
app.post("/api/uploads", requireUser, async (req, res) => {
  if (!["image/jpeg", "image/png"].includes(req.body.type)) return res.status(400).end();
  const key = \`uploads/\${req.user.id}/\${randomUUID()}\`;
  const url = await getSignedUrl(s3, new PutObjectCommand({ Bucket: "shopnest-images", Key: key, ContentType: req.body.type }), { expiresIn: 300 });
  res.json({ url, key });
});

// React: upload the file directly to S3
const { url, key } = await api.post("/api/uploads", { type: file.type });
await fetch(url, { method: "PUT", headers: { "Content-Type": file.type }, body: file });`,
    v: seq(
      "The API only signs permission; the bytes go browser → S3 directly, and S3 events trigger the processing.",
      ["React", "Node API", "S3", "Lambda resize"],
      [
        [0, 1, "POST /api/uploads {type}", "The signed-in user asks to upload a JPEG."],
        [1, 1, "check user · pick key · sign URL", "Key {{uploads/u42/7c1e….jpg}}, expires in 5 min, content type fixed."],
        [1, 0, "{ url, key }", "No file bytes touched the API.", "r"],
        [0, 2, "PUT <presigned url> (20 MB)", "The browser uploads straight to S3; CORS allows the site's origin."],
        [2, 3, "ObjectCreated event", "A Lambda makes thumbnails and records the image in MySQL."],
      ],
    ),
  },
  {
    t: "S3 security: Block Public Access, OAC, encryption",
    lv: 1,
    s: `New buckets start safe: {{Block Public Access}} is on, ACLs are disabled (the bucket owner owns every object), and objects are encrypted at rest with {{SSE-S3}} by default. Keep it that way. Websites are served through CloudFront with {{Origin Access Control}}, and the {{bucket policy}} allows reads only from that distribution's ARN. Add a statement denying any request without TLS ({{aws:SecureTransport = false}}). Choose {{SSE-KMS}} with a customer managed key when you need key-level access control and audit. Turn on versioning for important data and {{Object Lock}} for write-once retention.`,
    r: `Account-level Block Public Access in every account (enforced by SCP) prevents the classic "public bucket" headline.`,
    i: `How do you serve S3 content to the public without making the bucket public?`,
    c: `{
  "Version": "2012-10-17",
  "Statement": [
    { "Sid": "CloudFrontReadOnly", "Effect": "Allow",
      "Principal": { "Service": "cloudfront.amazonaws.com" },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::shopnest-web/*",
      "Condition": { "StringEquals": { "AWS:SourceArn": "arn:aws:cloudfront::111122223333:distribution/E123ABC" } } },
    { "Sid": "TlsOnly", "Effect": "Deny", "Principal": "*", "Action": "s3:*",
      "Resource": ["arn:aws:s3:::shopnest-web", "arn:aws:s3:::shopnest-web/*"],
      "Condition": { "Bool": { "aws:SecureTransport": "false" } } }
  ]
}`,
    v: flow(
      "The bucket stays private: only one CloudFront distribution may read it, and only over TLS.",
      "row",
      ["Shopper|browser", "CloudFront|signs with OAC|i", "Bucket policy|SourceArn = this distribution", "S3 bucket|private · encrypted|g", "Direct URL|s3.amazonaws.com/…|b"],
      [[0, 1], [1, 2], [2, 3, "allow"], [0, 4, "try direct"]],
      [0, 1, 2, 3],
      ["The shopper only ever talks to CloudFront.", "CloudFront signs its origin request using Origin Access Control.", "The bucket policy allows {{s3:GetObject}} only when the caller is this distribution.", "Trying the bucket URL directly gets 403: Block Public Access and the policy both refuse."],
    ),
  },
  {
    t: "RDS for MySQL",
    lv: 1,
    s: `{{Amazon RDS for MySQL}} runs MySQL for you: provisioning, minor-version patching in a maintenance window, {{automated backups}} with point-in-time restore (retention up to 35 days), snapshots, monitoring, encryption with KMS, and {{Multi-AZ}} failover. You still own schema design, indexes, query tuning, parameter groups and choosing an instance class. Use {{MySQL 8.4}} (the current long-term-support line on RDS): MySQL 8.0 reached RDS end of standard support on 31 July 2026 and now runs only under paid {{RDS Extended Support}}. Put the database in private subnets, allow port 3306 only from the app's security group, require TLS, and keep the password in Secrets Manager.`,
    r: `Enable Multi-AZ, deletion protection, Performance Insights / Database Insights and a backup retention you have actually tested restoring from.`,
    i: `What does RDS manage for you, and what remains your job? How does point-in-time restore work?`,
    c: `// Node.js: TLS connection to RDS MySQL using the secret
import mysql from "mysql2/promise";
import fs from "node:fs";
import { dbSecret } from "./secrets.js";

const s = await dbSecret();                         // { host, username, password }
export const db = mysql.createPool({
  host: s.host, user: s.username, password: s.password, database: "shopnest",
  connectionLimit: 10,
  ssl: { ca: fs.readFileSync("global-bundle.pem") }, // RDS certificate bundle
});`,
    v: arch(
      "RDS runs MySQL across two AZs with backups and failover; the app reaches it privately by its DNS name.",
      [4, 3],
      [
        svc("ecs", 0, 1, "The API connects to the cluster's endpoint DNS name, never to an IP — failover just changes what the name points to.", { label: "Node API", sub: "app subnets" }),
        svc("rds", 2, 0, "MySQL 8.4 primary in AZ a. Writes are synchronously copied to the standby before they are acknowledged."),
        svc("standby", 2, 2),
        svc("s3", 3, 1, "Automated backups and transaction logs go to S3 (managed by RDS) for point-in-time restore.", { label: "Backups", sub: "PITR · 35 days" }),
        svc("secrets", 0, 0, "The master password is managed and rotated by Secrets Manager."),
      ],
      [["ecs", "rds", "3306 · TLS"], ["rds", "standby", "sync replication"], "rds>s3", "ecs>secrets"],
      {
        "Normal write": [
          ["ecs", "secrets", "At start the API reads the DB credentials."],
          ["ecs", "rds", "{{INSERT INTO orders …}} goes to the primary over TLS."],
          ["rds", "standby", "The write is replicated synchronously to the standby in AZ b."],
          ["rds", "s3", "Transaction logs are shipped every few minutes for point-in-time restore."],
        ],
        "Failover": [
          ["rds", "standby", "The primary's host fails.", "bad"],
          ["standby", "rds", "RDS promotes the standby and repoints the endpoint DNS name."],
          ["ecs", "standby", "The API reconnects to the same name — with retry logic, users see a short pause."],
        ],
      },
      [grp("data subnets (private)", 1, 0, 3, 3, "private")],
    ),
  },
  {
    t: "Multi-AZ vs read replicas",
    lv: 2,
    s: `They solve different problems. {{Multi-AZ}} is for {{availability}}: a synchronous standby in another AZ that takes over automatically; in the classic Multi-AZ instance deployment you cannot read from it. (A Multi-AZ {{DB cluster}} deployment has two readable standbys.) {{Read replicas}} are for {{read scaling}}: asynchronous copies — in the same Region or another — that serve read-only queries such as catalogue pages and reports; they can lag, and promoting one is a manual or scripted step. Many production databases use both. The app must send writes to the writer endpoint and only lag-tolerant reads to replicas.`,
    r: `Route "my orders right after checkout" to the primary (read-your-writes); route catalogue browsing and analytics to replicas.`,
    i: `A product page is slow because of heavy reads. Would Multi-AZ help? What problem appears when reading from a replica right after a write?`,
    v: compare(
      "Multi-AZ keeps you up; replicas spread reads. They are complementary, not alternatives.",
      ["Multi-AZ standby", "Read replica"],
      [
        ["Goal", "High availability", "Read scaling, reporting, DR copy"],
        ["Replication", "Synchronous", "Asynchronous (can lag)"],
        ["Readable", "No (instance deployment)", "Yes"],
        ["Failover", "Automatic", "Manual promotion"],
        ["Location", "Another AZ, same Region", "Same or another Region"],
      ],
    ),
  },
  {
    t: "Aurora MySQL and Aurora Serverless v2",
    lv: 2,
    s: `{{Amazon Aurora}} is AWS's MySQL- and PostgreSQL-compatible engine with a different storage layer: data is kept in six copies across three AZs, compute instances share that storage, so adding up to 15 low-lag replicas needs no copying and failover is fast. A {{cluster endpoint}} always points at the writer and a {{reader endpoint}} spreads reads. {{Aurora Serverless v2}} adjusts capacity in fine-grained {{ACUs}} as load changes and can even pause to zero when idle; {{Global Database}} replicates to other Regions for disaster recovery. Aurora costs more per hour than RDS MySQL for small steady workloads, and storage I/O pricing matters — compare for your load.`,
    r: `ShopNest moves to Aurora when read replicas and fast failover matter, or uses Serverless v2 for dev/test databases that sit idle at night.`,
    i: `How is Aurora's storage different from RDS MySQL's? When would you pick Aurora Serverless v2?`,
    v: compare(
      "Aurora separates compute from shared six-way storage: faster failover and cheap replicas, at a different price model.",
      ["RDS for MySQL", "Aurora MySQL"],
      [
        ["Storage", "EBS per instance", "Shared, 6 copies across 3 AZs"],
        ["Replicas", "Up to 15, copy data", "Up to 15, share storage, low lag"],
        ["Failover", "Standby promotion", "Promote a replica, typically faster"],
        ["Elastic capacity", "Change instance class", "Serverless v2 ACUs, can pause to 0"],
        ["Fits", "Small/steady, lowest cost", "High availability, read-heavy, spiky"],
      ],
    ),
  },
  {
    t: "RDS Proxy and connection limits",
    lv: 2,
    s: `MySQL handles a limited number of connections, and each costs memory. Containers each keep a pool of 10; Lambda can start {{hundreds}} of execution environments in seconds, each opening its own connection — a sale spike can exhaust {{max_connections}} and take the database down. {{RDS Proxy}} sits between the app and the database: it holds a warm pool, multiplexes many client connections onto fewer database connections, queues briefly when the pool is busy, and shortens failover by keeping client connections open while it reconnects. It can use IAM authentication and reads the DB password from Secrets Manager. Watch the queue in the simulation as the pool size changes.`,
    r: `Every Lambda that talks to RDS should go through RDS Proxy; set a connection-borrow timeout and keep transactions short so pinned connections are released quickly.`,
    i: `Why do Lambda functions and relational databases need special care together? What does RDS Proxy do?`,
    v: queue(
      "Many short-lived clients share a small pool of database connections; when demand outruns the pool, requests queue instead of crashing MySQL.",
      { producer: "Lambda invocations", queue: "RDS Proxy queue", worker: "DB connection", arrival: 6, service: 2, workers: 3, capacity: 16, overflow: "drop" },
    ),
  },
  {
    t: "DynamoDB: design keys for your access patterns",
    lv: 2,
    s: `{{DynamoDB}} is a serverless key-value and document database with single-digit-millisecond reads at any scale. Every item has a {{partition key}} (and optionally a {{sort key}}); you can only query efficiently by key, so you {{design the table from your access patterns}}, not from entities. A common pattern stores several item types together: {{PK = USER#42}}, {{SK = ORDER#2026-10-17#981}} lets "latest orders of user 42" be one {{Query}}. {{Global secondary indexes}} add other access paths. Items are at most 400 KB; capacity is {{on-demand}} (pay per request) or provisioned with auto scaling. Conditional writes, TTL and Streams make it great for carts, sessions, idempotency keys and event logs — less so for ad-hoc relational reporting.`,
    r: `ShopNest keeps orders in MySQL but puts shopping carts and idempotency records in DynamoDB, with TTL deleting abandoned carts.`,
    i: `How do you model "get the 10 most recent orders for a user" in DynamoDB? What is a hot partition?`,
    c: `import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}));

await ddb.send(new PutCommand({ TableName: "shopnest", Item: {
  PK: "USER#42", SK: "ORDER#2026-10-17#981", total: 4990, status: "PAID" } }));

const { Items } = await ddb.send(new QueryCommand({
  TableName: "shopnest",
  KeyConditionExpression: "PK = :u AND begins_with(SK, :o)",
  ExpressionAttributeValues: { ":u": "USER#42", ":o": "ORDER#" },
  ScanIndexForward: false,   // newest first
  Limit: 10,
}));`,
    v: compare(
      "One partition holds a user's items sorted by the sort key, so 'latest orders' is a single Query, never a scan.",
      ["PK", "SK", "Attributes"],
      [
        ["item", "USER#42", "PROFILE", "name, email"],
        ["item", "USER#42", "ORDER#2026-10-12#977", "total 1990, SHIPPED"],
        ["item", "USER#42", "ORDER#2026-10-17#981", "total 4990, PAID"],
        ["item", "USER#57", "CART", "3 items · TTL in 7 days"],
        ["Query", "PK = USER#42", "begins_with ORDER#, newest first", "→ 981, then 977"],
      ],
    ),
  },
  {
    t: "ElastiCache: cache-aside for hot reads",
    lv: 2,
    s: `{{Amazon ElastiCache}} offers managed in-memory data stores with the {{Valkey}}, Redis OSS and Memcached engines, as a {{serverless}} cache (no nodes to size) or a node-based cluster. The usual pattern is {{cache-aside}}: read the cache; on a miss read MySQL, store the result with a TTL, return it. Writes update the database and delete (or update) the cache key. Use it for product pages, computed recommendations, sessions and rate-limit counters. The hard parts are {{invalidation}} (stale data after updates), {{stampedes}} (many requests miss at once when a hot key expires — add jitter or a lock) and sizing what to cache.`,
    r: `Cache only what is read far more than written, keep TTLs short enough that stale data is acceptable, and never make the cache the only copy of anything.`,
    i: `Explain cache-aside. What is a cache stampede and how do you prevent it?`,
    c: `import { createClient } from "redis";   // works with Valkey too
const cache = createClient({ url: process.env.CACHE_URL });
await cache.connect();

export async function getProduct(id) {
  const key = \`product:\${id}\`;
  const hit = await cache.get(key);
  if (hit) return JSON.parse(hit);                                   // cache hit
  const [[row]] = await db.query("SELECT * FROM products WHERE id = ?", [id]);
  await cache.set(key, JSON.stringify(row), { EX: 300 + Math.floor(Math.random() * 60) }); // TTL + jitter
  return row;
}
// on update: UPDATE products …; then await cache.del(\`product:\${id}\`);`,
    v: seq(
      "Check the cache first; on a miss load from MySQL and fill the cache with a TTL; on writes delete the key.",
      ["Node API", "ElastiCache", "MySQL"],
      [
        [0, 1, "GET product:42", "First request: not cached."],
        [1, 0, "(nil)", "Miss.", "r"],
        [0, 2, "SELECT * FROM products WHERE id = 42", "Load from the database."],
        [0, 1, "SET product:42 … EX 300+jitter", "Fill the cache; jitter avoids synchronized expiry."],
        [0, 1, "GET product:42 (next shopper)", "Hit: served from memory in well under a millisecond, MySQL untouched."],
      ],
    ),
  },
  {
    t: "Choosing a database",
    lv: 2,
    s: `Match the database to the data's shape and access pattern. Relational data with joins and transactions (orders, payments, inventory) → {{RDS MySQL}} or {{Aurora}}. Key-value at huge scale with predictable access (carts, sessions, idempotency) → {{DynamoDB}}. Read-heavy hot data → add {{ElastiCache}}. Files → {{S3}}. Full-text and log search → {{OpenSearch}}. Vector similarity for AI search → {{OpenSearch Serverless}}, {{Aurora PostgreSQL with pgvector}} or {{S3 Vectors}}. Analytics over big history → S3 + {{Athena}} or {{Redshift}}. Using several stores is normal ("polyglot persistence"), but each one adds operations — do not add one without a clear access pattern it serves better.`,
    r: `ShopNest: MySQL for the system of record, ElastiCache for hot products, DynamoDB for carts, S3 for files, a vector store for the AI assistant.`,
    i: `Your catalogue search needs typo tolerance and facets. Would you put it in MySQL, DynamoDB or something else?`,
    v: compare(
      "One store per access pattern it serves best — and no more stores than you can operate.",
      ["Use for", "ShopNest example"],
      [
        ["RDS / Aurora MySQL", "Relational data, transactions, joins", "Orders, products, users"],
        ["DynamoDB", "Key-value at scale, predictable queries", "Carts, idempotency keys"],
        ["ElastiCache (Valkey)", "Hot reads, counters, sessions", "Product page cache"],
        ["S3", "Files and data lake", "Images, invoices, exports"],
        ["OpenSearch", "Full-text search, facets, logs", "Catalogue search box"],
        ["Vector store", "Semantic similarity", "AI assistant's knowledge"],
      ],
    ),
  },
];
