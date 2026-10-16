import type { ArchKind, ArchNode, ArchVisual, CidrVisual, IamStatement, IamVisual, ScaleVisual } from "../../visuals/types.js";

/**
 * Compact helpers for the AWS track's interactive diagrams. Every service has one
 * entry in SERVICES so icons, names and colours stay consistent across diagrams.
 */
const SERVICES: Record<string, [icon: string, label: string, sub: string, kind: ArchKind, info: string]> = {
  user: ["👤", "Shopper", "browser", "client", "A customer using ShopNest in a web browser."],
  react: ["⚛", "React app", "runs in browser", "client", "The ShopNest single-page app: static HTML, JS and CSS that run in the shopper's browser and call the API."],
  dev: ["💻", "Your laptop", "local dev", "client", "Where you develop: {{npm run dev}} for React, {{node server.js}} for the API, MySQL in Docker."],
  admin: ["🧑‍💻", "Developer", "you", "client", "A person on your team, signing in through IAM Identity Center — never with long-lived keys."],
  gha: ["⚙", "GitHub Actions", "CI/CD", "client", "Your pipeline: builds, tests, then deploys with short-lived AWS credentials obtained through OIDC."],
  r53: ["🧭", "Route 53", "DNS", "edge", "Answers {{shopnest.example}} lookups and can route by latency, weight, health or location."],
  cf: ["🌐", "CloudFront", "CDN", "edge", "The CDN: hundreds of edge locations worldwide cache the React files and images near shoppers and forward API calls to the origin."],
  waf: ["🛡", "AWS WAF", "web firewall", "sec", "Inspects HTTP requests at CloudFront or the load balancer: blocks SQL injection, bad bots and floods by rate."],
  igw: ["🚪", "Internet gateway", "VPC door", "net", "Connects the VPC to the internet. Only subnets whose route table points {{0.0.0.0/0}} at it are public."],
  nat: ["🔁", "NAT gateway", "outbound only", "net", "Lets private subnets reach the internet (npm, external APIs) while nothing on the internet can start a connection back in."],
  alb: ["⚖", "Load balancer", "ALB · layer 7", "net", "Application Load Balancer: terminates HTTPS, routes by path or host, health-checks targets and spreads requests across AZs."],
  vpce: ["🔌", "VPC endpoint", "private link", "net", "Reaches an AWS service (S3, Secrets Manager, Bedrock…) from private subnets without the internet or a NAT gateway."],
  apigw: ["🔀", "API Gateway", "managed API", "int", "Managed front door for APIs: routing, auth (JWT/IAM/Lambda authorizers), throttling and stages."],
  ec2: ["🖥", "EC2", "virtual server", "compute", "A virtual machine you choose and patch: instance type, AMI, disk, security groups. Runs the Node API with PM2 or systemd."],
  asg: ["📈", "Auto Scaling", "EC2 group", "compute", "Keeps between min and max instances healthy and adds or removes them to track a target metric."],
  ecs: ["🐳", "ECS on Fargate", "containers", "compute", "Runs the API as Docker containers (tasks) without managing servers; the service keeps the desired count running."],
  ecr: ["📦", "ECR", "image registry", "compute", "Private Docker registry. CI pushes {{shopnest-api:<git-sha>}}; ECS pulls it at deploy time."],
  lambda: ["λ", "Lambda", "event function", "compute", "Runs a handler per event (API call, queue message, S3 upload, schedule). Pay per request and duration; up to 15 minutes per call."],
  webfn: ["🕸", "Lambda Web Fn", "Express server", "compute", "A Lambda Web Function: your Express app listens on a port, Lambda gives it an HTTPS endpoint and scales it — including to zero."],
  amplify: ["✨", "Amplify Hosting", "frontend CI/CD", "compute", "Connects to the Git repo, builds the React app on every push and serves it from a CDN with preview branches."],
  s3: ["🪣", "S3", "object storage", "data", "Stores files as objects in buckets: the React build, product images, user uploads, logs and backups. 11 nines of durability."],
  rds: ["🐬", "RDS MySQL", "primary", "data", "Managed MySQL 8.4: automated backups, patching, Multi-AZ standby, encryption. You still design schemas and indexes."],
  standby: ["🐬", "Standby", "other AZ", "data", "Multi-AZ standby: synchronously replicated, takes over automatically if the primary or its AZ fails. Not readable."],
  replica: ["📖", "Read replica", "async copy", "data", "Asynchronous copy that serves read-only queries (reports, search pages). Can lag behind the primary."],
  aurora: ["🌌", "Aurora MySQL", "cluster", "data", "MySQL-compatible cluster: storage replicated 6 ways over 3 AZs, up to 15 low-lag replicas, Serverless v2 capacity."],
  proxy: ["🔗", "RDS Proxy", "connection pool", "data", "Pools and reuses database connections so thousands of Lambda invocations do not exhaust MySQL's connection limit."],
  ddb: ["🗂", "DynamoDB", "key-value", "data", "Serverless NoSQL table: single-digit-millisecond reads by key at any scale. Design keys around your access patterns."],
  cache: ["⚡", "ElastiCache", "Valkey", "data", "In-memory cache (Valkey / Redis OSS compatible): hot product pages, sessions, rate-limit counters."],
  vec: ["🧮", "Vector store", "embeddings", "data", "Holds document embeddings for semantic search: OpenSearch Serverless, Aurora PostgreSQL pgvector or S3 Vectors."],
  sqs: ["📨", "SQS", "queue", "int", "Durable queue between producer and worker. Messages stay until a consumer deletes them; failures go to a dead-letter queue."],
  dlq: ["🪦", "Dead-letter queue", "failed messages", "int", "Messages that failed too many times land here so they can be inspected and replayed instead of retried forever."],
  sns: ["📣", "SNS", "pub/sub topic", "int", "One message in, many copies out: fan-out to SQS queues, Lambda, email, SMS, HTTPS."],
  eb: ["🚌", "EventBridge", "event bus", "int", "Routes events by content rules to targets; also runs cron-style schedules (EventBridge Scheduler)."],
  sfn: ["🪜", "Step Functions", "workflow", "int", "A state machine that calls services step by step with retries, branches, waits and human approval."],
  iam: ["🔑", "IAM", "permissions", "sec", "Who can do what to which resource. Policies are JSON documents evaluated on every API call."],
  sts: ["🎫", "STS", "temp credentials", "sec", "Issues short-lived credentials when a role is assumed — the reason applications never need access keys."],
  cognito: ["🪪", "Cognito", "user sign-in", "sec", "User pools for your app's customers: sign-up, sign-in, MFA, social login; issues JWTs the API verifies."],
  secrets: ["🗝", "Secrets Manager", "DB password", "sec", "Stores secrets encrypted, rotates database passwords automatically and serves them to roles allowed to read them."],
  kms: ["🔐", "KMS", "encryption keys", "sec", "Creates and guards encryption keys; services encrypt data keys with them (envelope encryption). Every use is logged."],
  cw: ["📊", "CloudWatch", "metrics · logs", "ops", "Metrics, logs, alarms and dashboards for every service; alarms page you or trigger scaling."],
  xray: ["🔎", "X-Ray / OTel", "traces", "ops", "Distributed tracing: follows one request across CloudFront, the API, MySQL and queues to show where time goes."],
  trail: ["🧾", "CloudTrail", "audit log", "ops", "Records every API call in the account — who did what, when, from where."],
  cfn: ["📜", "CloudFormation", "stacks", "ops", "Creates and updates resources from a template, in dependency order, with rollback on failure."],
  cdk: ["🧱", "AWS CDK", "IaC in TypeScript", "ops", "Write infrastructure as TypeScript classes; {{cdk deploy}} synthesises a CloudFormation template and deploys it."],
  bedrock: ["🤖", "Bedrock", "foundation models", "ai", "Serverless access to foundation models (Amazon Nova, Claude, OpenAI, Mistral and more) through one API and IAM."],
  kb: ["📚", "Knowledge Base", "managed RAG", "ai", "Bedrock Knowledge Bases: chunks and embeds your documents from S3, stores vectors, retrieves and cites sources at query time."],
  guard: ["🚧", "Guardrails", "safety filters", "ai", "Bedrock Guardrails: blocks harmful content, denied topics and prompt attacks, and masks personal data, on input and output."],
  agentcore: ["🧩", "AgentCore", "agent runtime", "ai", "Bedrock AgentCore: runtime, memory, gateway (tools as MCP), identity and observability for agents built with any framework."],
  sagemaker: ["🔬", "SageMaker AI", "train · deploy", "ai", "Train, tune and host your own models: notebooks, training jobs, real-time, serverless or batch endpoints."],
  rekog: ["👁", "Rekognition", "image analysis", "ai", "Labels, faces, text and unsafe-content moderation in images and video — no model training needed."],
  textract: ["📄", "Textract", "document OCR", "ai", "Extracts text, forms, tables and invoice fields from scans and PDFs."],
  transcribe: ["🎙", "Transcribe", "speech → text", "ai", "Converts speech to text, in batch or streaming, with speaker labels and custom vocabulary."],
  polly: ["🔊", "Polly", "text → speech", "ai", "Turns text into natural-sounding speech for voice features."],
};

/** A service box at grid cell (x, y). `info` overrides the default description; `id` lets one diagram use a service twice. */
export function svc(key: string, x: number, y: number, info?: string, o: { id?: string; label?: string; sub?: string } = {}): ArchNode {
  const s = SERVICES[key];
  if (!s) throw new Error(`unknown service ${key}`);
  const [icon, label, sub, kind, def] = s;
  return { id: o.id ?? key, icon, label: o.label ?? label, sub: o.sub ?? sub, kind, x, y, info: info ?? def };
}

export const grp = (label: string, x: number, y: number, w: number, h: number, tone: NonNullable<ArchVisual["groups"]>[number]["tone"] = "vpc") => ({ label, x, y, w, h, tone });

type Hop = [from: string, to: string, note: string, bad?: "bad"];

/** arch(takeaway, [cols, rows], nodes, edges "a>b" or ["a","b","label"], { "Flow name": hops }, groups?) */
export function arch(
  takeaway: string,
  [cols, rows]: [number, number],
  nodes: ArchNode[],
  edges: (string | [string, string, string])[],
  flows: Record<string, Hop[]>,
  groups: ArchVisual["groups"] = [],
): ArchVisual {
  return {
    type: "arch",
    takeaway,
    cols,
    rows,
    nodes,
    edges: edges.map((e) => {
      if (typeof e !== "string") return e;
      const [a = "", b = ""] = e.split(">");
      return [a, b];
    }),
    groups,
    flows: Object.entries(flows).map(([name, hops]) => ({ name, steps: hops.map(([from, to, note, bad]) => ({ from, to, note, ...(bad ? { bad: true } : {}) })) })),
  };
}

/** Statement shorthand: allow(["s3:GetObject"], ["arn:…"]). */
export const allow = (actions: string[], resources: string[] = ["*"]): IamStatement => ({ effect: "Allow", actions, resources });
export const deny = (actions: string[], resources: string[] = ["*"]): IamStatement => ({ effect: "Deny", actions, resources });

export function iam(takeaway: string, principal: string, requests: [label: string, action: string, resource: string][], policies: IamVisual["policies"]): IamVisual {
  return { type: "iam", takeaway, principal, requests: requests.map(([label, action, resource]) => ({ label, action, resource })), policies };
}

export const cidr = (takeaway: string, o: Omit<CidrVisual, "type" | "takeaway">): CidrVisual => ({ type: "cidr", takeaway, ...o });
export const scale = (takeaway: string, o: Omit<ScaleVisual, "type" | "takeaway">): ScaleVisual => ({ type: "scale", takeaway, ...o });

/** A day of shop traffic (req/s per minute-tick): quiet, a marketing email at t=12, then a flash sale at t=30. */
export const SALE_DAY = [120, 130, 125, 140, 150, 145, 160, 170, 165, 180, 175, 190, 520, 610, 560, 480, 400, 330, 290, 260, 240, 230, 220, 230, 240, 250, 245, 260, 270, 280, 900, 1150, 1200, 1180, 1100, 950, 800, 640, 500, 400, 330, 280, 240, 210, 190, 180, 170, 160];
