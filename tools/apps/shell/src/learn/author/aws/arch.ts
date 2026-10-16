import { compare, layers } from "../../visuals/kit.js";
import type { ArchVisual } from "../../visuals/types.js";
import type { ConceptDef } from "../build.js";
import { arch, grp, svc } from "./kit.js";

/* Reference architectures: ShopNest from one server to serverless, events and AI.
   The ARCH_* maps are also used by the Cloud Lab home page's "evolve the app" explorer. */

export const ARCH_V1: ArchVisual = arch(
  "Simple and cheap, but one instance is a single point of failure for everything — fine for a demo, not for a shop.",
  [5, 2],
  [
    svc("user", 0, 0),
    svc("r53", 1, 0, "{{shopnest.example}} → the instance's Elastic IP."),
    svc("ec2", 2, 0, "One t4g.small runs nginx (serving the React build), the Node API under PM2 and MySQL — all on one disk.", { label: "One EC2", sub: "nginx + Node + MySQL" }),
    svc("s3", 3, 0, "Nightly mysqldump uploaded by cron — the only backup.", { label: "Backups", sub: "nightly dump" }),
    svc("cw", 2, 1, "Basic instance metrics; an alarm on status check failure recovers the instance."),
  ],
  [["user", "r53", "DNS"], ["r53", "ec2", "Elastic IP"], ["ec2", "s3", "cron dump"], "ec2>cw"],
  {
    "Normal request": [
      ["user", "r53", "The browser resolves shopnest.example."],
      ["r53", "ec2", "Everything — HTML, API, database — is served by one machine."],
    ],
    "The instance fails": [
      ["ec2", "cw", "A hardware problem stops the instance.", "bad"],
      ["r53", "ec2", "The whole shop is down until it recovers or is rebuilt.", "bad"],
      ["ec2", "s3", "If the disk is lost, orders since last night's dump are gone.", "bad"],
    ],
  },
);

export const ARCH_V2: ArchVisual = arch(
  "Three tiers across two AZs: CDN for the front end, a scaling API tier, a Multi-AZ database — no single point of failure.",
  [6, 4],
  [
    svc("user", 0, 1),
    svc("cf", 1, 1, "Serves the React build from S3 and forwards {{/api/*}} to the ALB; AWS WAF attached here."),
    svc("s3", 2, 0, "React build, private behind Origin Access Control.", { label: "S3 web", sub: "React build" }),
    svc("alb", 2, 2, "Public subnets in both AZs; health-checks {{/healthz}}."),
    svc("ec2", 3, 1, "Auto Scaling group, AZ a.", { id: "ec2a", label: "API · AZ a", sub: "ASG" }),
    svc("ec2", 3, 3, "Auto Scaling group, AZ b.", { id: "ec2b", label: "API · AZ b", sub: "ASG" }),
    svc("cache", 4, 0, "Hot product pages and sessions."),
    svc("rds", 5, 1, "Primary in AZ a."),
    svc("standby", 5, 3, "Synchronous standby in AZ b."),
    svc("secrets", 4, 2, "DB credentials, rotated."),
  ],
  ["user>cf", ["cf", "s3", "static"], ["cf", "alb", "/api/*"], "alb>ec2a", "alb>ec2b", "ec2a>cache", "ec2a>rds", "ec2b>rds", ["rds", "standby", "sync"], "ec2a>secrets"],
  {
    "Browse products": [
      ["user", "cf", "The page loads from the nearest edge."],
      ["cf", "s3", "Static files come from S3 (cached at the edge)."],
      ["cf", "alb", "{{GET /api/products}} is forwarded to the load balancer."],
      ["alb", "ec2a", "A healthy API instance handles it."],
      ["ec2a", "cache", "Cache hit: MySQL is not touched."],
    ],
    "AZ a fails": [
      ["alb", "ec2a", "Health checks to AZ a fail.", "bad"],
      ["alb", "ec2b", "Traffic shifts to AZ b; the ASG launches replacement instances there."],
      ["rds", "standby", "RDS fails over to the standby."],
      ["ec2b", "standby", "The shop keeps taking orders."],
    ],
  },
  [grp("VPC", 2, 0, 4, 4, "vpc")],
);

export const ARCH_V3: ArchVisual = arch(
  "Containers remove server care: CI builds one image, Fargate runs it, the platform handles placement, health and scaling.",
  [6, 3],
  [
    svc("gha", 0, 0),
    svc("ecr", 1, 0),
    svc("user", 0, 2),
    svc("cf", 1, 2),
    svc("alb", 2, 2),
    svc("ecs", 3, 1, "ECS service on Fargate: 2–10 tasks across AZs, scaling on requests per target.", { label: "API tasks", sub: "Fargate" }),
    svc("rds", 4, 2, undefined, { label: "RDS / Aurora", sub: "MySQL" }),
    svc("secrets", 4, 0),
    svc("cw", 5, 1, "Container logs, metrics and alarms; deployment alarms trigger rollback."),
  ],
  [["gha", "ecr", "push :sha"], ["ecr", "ecs", "pull"], "user>cf", "cf>alb", "alb>ecs", "ecs>rds", "ecs>secrets", "ecs>cw"],
  {
    "Deploy": [
      ["gha", "ecr", "On merge: test, build, push {{shopnest-api:<sha>}}."],
      ["ecr", "ecs", "ECS rolls out new tasks from that image; the circuit breaker watches health."],
      ["ecs", "cw", "Alarms stay quiet: the deployment completes."],
    ],
    "Shopper request": [
      ["user", "cf", "Request at the edge."],
      ["cf", "alb", "Forwarded to the ALB."],
      ["alb", "ecs", "A task handles it."],
      ["ecs", "rds", "Data from MySQL."],
    ],
  },
);

export const ARCH_V4: ArchVisual = arch(
  "Serverless: no servers, scale to zero, pay per request — with RDS Proxy (or DynamoDB) protecting the database from Lambda's burst.",
  [6, 3],
  [
    svc("user", 0, 1),
    svc("cognito", 1, 0, "Shoppers sign in; React receives JWTs."),
    svc("cf", 1, 1),
    svc("s3", 2, 0, undefined, { label: "S3 web", sub: "React build" }),
    svc("apigw", 2, 2, "HTTP API with a Cognito JWT authorizer; routes to functions."),
    svc("lambda", 3, 2, "One function per route group: products, cart, checkout.", { label: "API functions", sub: "Lambda" }),
    svc("proxy", 4, 2),
    svc("aurora", 5, 2, "Aurora Serverless v2: capacity follows load, pauses when idle in dev."),
    svc("ddb", 4, 0, "Carts and idempotency keys."),
  ],
  ["user>cognito", "user>cf", ["cf", "s3", "static"], ["cf", "apigw", "/api/*"], "apigw>lambda", "lambda>proxy", "proxy>aurora", "lambda>ddb"],
  {
    "Checkout": [
      ["user", "cognito", "The shopper is signed in (JWT in memory)."],
      ["user", "cf", "{{POST /api/checkout}} with the access token."],
      ["cf", "apigw", "API Gateway verifies the JWT before any code runs."],
      ["apigw", "lambda", "The checkout function runs (a warm environment if one is free)."],
      ["lambda", "ddb", "An idempotency key guards against double submits."],
      ["lambda", "proxy", "The order is written through RDS Proxy's connection pool…"],
      ["proxy", "aurora", "…to Aurora. A sale spike adds Lambda environments, not database connections."],
    ],
  },
);

export const ARCH_EVENTS: ArchVisual = arch(
  "Checkout only records the order and emits an event; everything slow or failure-prone happens asynchronously with retries.",
  [6, 3],
  [
    svc("ecs", 0, 1, "Commits the order in MySQL, then publishes {{OrderPlaced}} (or uses a transactional outbox).", { label: "Checkout API", sub: "202 Accepted" }),
    svc("eb", 1, 1),
    svc("sfn", 2, 0, "Fulfilment saga: reserve stock → charge → ship; compensate on failure."),
    svc("sqs", 2, 2, "Buffer for the email worker.", { label: "email-queue", sub: "SQS" }),
    svc("lambda", 3, 0, "Calls the payment provider with the order id as idempotency key.", { id: "pay", label: "charge-card", sub: "Lambda" }),
    svc("lambda", 3, 2, "Sends the confirmation email through Amazon SES.", { id: "mail", label: "send-email", sub: "Lambda" }),
    svc("dlq", 4, 2, "Messages that fail 5 times; an alarm pages the team."),
    svc("rds", 4, 0, undefined, { label: "MySQL", sub: "order status" }),
  ],
  ["ecs>eb", ["eb", "sfn", "OrderPlaced"], ["eb", "sqs", "OrderPlaced"], "sfn>pay", "pay>rds", "sqs>mail", ["sqs", "dlq", "after 5 tries"]],
  {
    "Order placed": [
      ["ecs", "eb", "The API stores the order (status PENDING) and emits {{OrderPlaced}}; the shopper sees 'order received' instantly."],
      ["eb", "sfn", "Rule: start the fulfilment workflow."],
      ["sfn", "pay", "Charge the card (retried with backoff on 5xx)."],
      ["pay", "rds", "Status → PAID."],
      ["eb", "sqs", "Rule: queue the confirmation email."],
      ["sqs", "mail", "The worker sends the email."],
    ],
    "Email provider down": [
      ["sqs", "mail", "Sending fails; the message becomes visible again and is retried.", "bad"],
      ["sqs", "dlq", "After 5 attempts it moves to the dead-letter queue; payment and shipping were never affected."],
    ],
  },
);

export const ARCH_AI: ArchVisual = arch(
  "The assistant is just another API route: retrieval for facts, tools for live data, guardrails on both ends, and every call logged and budgeted.",
  [6, 3],
  [
    svc("react", 0, 1, "Assistant panel; streams answers token by token."),
    svc("ecs", 1, 1, "{{/api/assistant}}: checks the user, rate-limits, calls Bedrock, streams back.", { label: "Node API", sub: "assistant route" }),
    svc("guard", 2, 0, "Denied topics, prompt-attack filter, PII masking, grounding check."),
    svc("bedrock", 3, 1, "Converse with tools: {{search_products}}, {{get_order_status}}."),
    svc("kb", 4, 0, "Policies and FAQs, synced from S3."),
    svc("vec", 5, 0, undefined, { label: "S3 Vectors", sub: "embeddings" }),
    svc("rds", 4, 2, "Tools query live data with the user's identity.", { label: "MySQL", sub: "orders · products" }),
    svc("cw", 2, 2, "Invocation logs, token usage per user, latency, guardrail interventions."),
  ],
  ["react>ecs", "ecs>guard", "ecs>bedrock", "bedrock>kb", "kb>vec", ["bedrock", "rds", "tool calls"], "ecs>cw"],
  {
    "Ask about returns": [
      ["react", "ecs", "'Can I return these shoes?' (with the user's token)."],
      ["ecs", "guard", "Input passes the guardrail (on-topic, no injection)."],
      ["ecs", "bedrock", "Converse with the question, tools and a system prompt."],
      ["bedrock", "kb", "Retrieve the returns policy chunks."],
      ["bedrock", "rds", "Tool call: the order shows the shoes were delivered 12 days ago."],
      ["ecs", "react", "Grounded answer with a citation streams to the user: 'Yes, within 30 days…'."],
      ["ecs", "cw", "Tokens, latency and sources are logged for evaluation and cost."],
    ],
  },
);

export const arch_: ConceptDef[] = [
  {
    t: "ShopNest v1: one server",
    lv: 1,
    s: `The first deployment many teams make: one EC2 instance running nginx (serving the React build), the Node API and MySQL, with an Elastic IP and a Route 53 record. It is cheap and quick to understand. It is also a {{single point of failure}} for compute, data and availability: a hardware fault, a full disk or a bad deploy takes everything down, and backups are only as good as the last cron job. Scaling means a bigger instance (vertical) and a restart. Recognising these limits — rather than avoiding v1 — is the point: every later version removes one of them.`,
    r: `Good for a prototype or an internal tool; move the database to RDS first, because data loss is the failure you cannot undo.`,
    i: `What are the risks of running the web server and the database on the same instance? What would you change first?`,
    v: ARCH_V1,
  },
  {
    t: "ShopNest v2: three tiers, highly available",
    lv: 1,
    s: `The classic production layout. {{Presentation}}: React on S3 behind CloudFront (with WAF). {{Application}}: stateless Node API instances in an Auto Scaling group across two AZs, in private subnets, behind an ALB. {{Data}}: RDS MySQL Multi-AZ in isolated subnets, ElastiCache for hot reads, secrets in Secrets Manager. Security groups chain ALB → API → DB. Any one instance, or a whole AZ, can fail without an outage; the API tier scales horizontally because it keeps no state locally (sessions in the cache or in JWTs, files in S3).`,
    r: `This is the architecture most interview questions about "design a web app on AWS" are looking for — be ready to justify each box.`,
    i: `Design a highly available web application on AWS for a React front end, a Node API and MySQL. What makes it survive an AZ failure?`,
    v: ARCH_V2,
  },
  {
    t: "ShopNest v3: containers on Fargate",
    lv: 2,
    s: `Same three tiers, but the API runs as {{containers on ECS Fargate}}: no AMIs to bake, no OS to patch, the same image from laptop to production. CI builds and pushes the image to ECR, ECS performs rolling or blue/green deployments with a circuit breaker, and service auto scaling tracks requests per target. Infrastructure is defined in CDK and deployed by the pipeline with OIDC credentials. Compared with v2 you trade a little per-unit cost for much less operational work and faster, safer deploys.`,
    r: `Most product teams settle here for their main API: predictable performance, simple mental model, no servers.`,
    i: `What do you gain and give up moving from EC2 Auto Scaling to ECS Fargate?`,
    v: ARCH_V3,
  },
  {
    t: "ShopNest v4: serverless",
    lv: 2,
    s: `Fully serverless: React on S3 + CloudFront, Cognito for sign-in, {{API Gateway (HTTP API)}} with a JWT authorizer in front of {{Lambda}} functions (or the Express app as one {{Lambda Web Function}}), {{RDS Proxy}} in front of {{Aurora Serverless v2}}, and {{DynamoDB}} for carts and idempotency. Nothing runs when nobody shops; capacity follows traffic automatically. The new concerns are cold starts on latency-sensitive paths, database connection storms (hence the proxy), concurrency limits, and observability across many small functions.`,
    r: `Serverless shines for spiky or low traffic and small teams; at steady high volume compare the bill with containers.`,
    i: `What changes in your database layer when moving an API to Lambda? How do you handle cold starts?`,
    v: ARCH_V4,
  },
  {
    t: "Event-driven order processing",
    lv: 2,
    s: `Checkout should do the minimum synchronously: validate, write the order, publish {{OrderPlaced}}, return {{202}}. Everything else — payment capture, stock, emails, invoices, analytics — reacts to the event through {{EventBridge}} rules, {{SQS}} queues and a {{Step Functions}} saga, each with its own retries and dead-letter queue. A failing email provider no longer blocks checkout. To avoid "order saved but event lost", use a {{transactional outbox}}: write the event to an outbox table in the same MySQL transaction and publish it from there. Consumers must be idempotent.`,
    r: `Give each event a stable id and version; document schemas so new consumers can join without changing checkout.`,
    i: `How do you make sure an event is published if and only if the order is committed? What is a saga?`,
    v: ARCH_EVENTS,
  },
  {
    t: "ShopNest AI assistant (RAG + tools)",
    lv: 2,
    s: `The assistant combines everything from the AI area. The React panel calls an API route that authenticates the shopper, rate-limits, and calls Bedrock {{ConverseStream}} with a system prompt, {{Guardrails}}, a {{Knowledge Base}} for policies and FAQs, and {{tools}} for live data (search products, order status) that run with the user's identity. Answers stream back with citations. Every call logs tokens, latency, sources and guardrail interventions; an evaluation set runs in CI on every prompt or model change; a per-user daily token budget prevents abuse.`,
    r: `Start read-only (answers + lookups). Add actions (cancel, change address) only with explicit user confirmation and audit logs.`,
    i: `Design a customer-support assistant for an online shop on AWS. How do you keep it accurate, safe and within budget?`,
    v: ARCH_AI,
  },
  {
    t: "Multi-Region and disaster recovery for ShopNest",
    lv: 3,
    s: `A Region-wide outage is rare but possible, and some businesses must survive it. ShopNest's options: {{backup & restore}} (AWS Backup copies RDS snapshots and S3 data to a second Region; CDK rebuilds the stack — RTO hours), {{pilot light}} (Aurora Global Database replicates continuously, the API stack exists but scaled to zero — RTO tens of minutes), {{warm standby}} (a small running copy that scales up on failover — minutes) or {{active/active}} (both Regions serve traffic with Route 53 latency routing; needs multi-writer data design such as DynamoDB global tables — near zero, most complex). Failover is a decision plus a runbook plus DNS: practise it.`,
    r: `Most shops choose backup & restore or pilot light; active/active is justified only when downtime is extremely expensive.`,
    i: `The business asks for RTO 30 minutes and RPO 1 minute for the order database. Which design do you propose and what does it cost?`,
    v: compare(
      "Each step up shortens recovery and adds standing cost and complexity.",
      ["Data", "Compute in Region 2", "RTO"],
      [
        ["Backup & restore", "Snapshots copied cross-Region", "None until needed", "Hours"],
        ["Pilot light", "Aurora Global Database", "Defined in IaC, scaled to 0", "~10–30 min"],
        ["Warm standby", "Global Database", "Small copy running", "Minutes"],
        ["Active/active", "Multi-writer (DynamoDB global tables)", "Full capacity", "Near zero"],
      ],
    ),
  },
  {
    t: "Security review checklist",
    lv: 2,
    s: `Before ShopNest goes live, walk the layers. {{Accounts}}: separate prod account, SCPs, root locked with MFA, no IAM users with keys. {{Identity}}: one role per component, least privilege, OIDC for CI, Identity Center for people. {{Network}}: only CloudFront/ALB public; API and DB private; security groups chained; endpoints for AWS services. {{Data}}: encryption at rest (KMS) and in transit (TLS to MySQL too), Block Public Access, backups tested. {{Application}}: WAF, Cognito tokens verified server-side, input validation, secrets in Secrets Manager. {{Detection}}: CloudTrail organization trail, GuardDuty, Config rules, Security Hub, alarms routed to people.`,
    r: `Automate the checklist: Config rules, Security Hub standards and IaC linting (cdk-nag, cfn-guard) catch regressions in every pull request.`,
    i: `You inherit an AWS account running a web shop. What are the first ten things you check?`,
    v: layers(
      "Secure every layer, then automate the checks so they stay secure.",
      ["Accounts|Org + SCPs, prod isolated, root MFA, no access keys|b", "Identity|Role per component, least privilege, OIDC CI, SSO for humans", "Network|Only edge public; private API/DB; SG chains; VPC endpoints", "Data|KMS at rest, TLS in transit, Block Public Access, tested backups", "Application|WAF, verified JWTs, validation, Secrets Manager", "Detection|CloudTrail, GuardDuty, Config, Security Hub, alarms|g"],
    ),
  },
];
