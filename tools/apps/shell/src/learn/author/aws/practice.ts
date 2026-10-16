import type { DrillDef, QuestionDef } from "../build.js";

/* Practice for the AWS track: question bank, design scenarios, hands-on labs, quick reference. */

export const questions: QuestionDef[] = [
  ["start", 1, "What is the difference between a Region and an Availability Zone?", "A Region is a geographic area (eu-west-1) containing several isolated Availability Zones — separate data centres with independent power and networking, connected by low-latency links. Spread resources across AZs for availability; choose Regions for latency, data residency, service availability and price."],
  ["start", 1, "Explain the shared responsibility model with an example.", "AWS secures the infrastructure (facilities, hardware, hypervisor, managed service software); the customer secures what they configure: IAM, network rules, encryption settings, data, and on EC2 the guest OS. Example: AWS patches the RDS MySQL engine, but you decide who can connect to it and whether it is public."],
  ["start", 1, "Why use several AWS accounts instead of one?", "The account is the strongest isolation boundary for permissions, quotas and billing. Separate dev/staging/prod accounts limit the blast radius of mistakes and breaches, make cost attribution easy and let SCPs apply different guardrails per environment."],
  ["start", 2, "How does the AWS SDK for JavaScript find credentials?", "Through the default credential provider chain: environment variables, shared config/SSO profiles, web identity tokens, the ECS container credentials endpoint, then the EC2 instance metadata service. On AWS compute it therefore picks up the attached role automatically, so code never contains keys."],
  ["start", 2, "What are the six pillars of the Well-Architected Framework?", "Operational excellence, security, reliability, performance efficiency, cost optimisation and sustainability. Design reviews check a workload against each; most decisions trade one pillar against another (Multi-AZ: reliability for cost)."],
  ["start", 1, "How do you avoid a surprise AWS bill as a beginner?", "Set an AWS Budgets alert immediately, enable Cost Anomaly Detection, delete resources after experiments (NAT gateways, load balancers, databases bill per hour), tag resources, and use the free account plan or Free Tier credits while learning."],
  ["start", 2, "What is an ARN and why are some fields empty?", "An Amazon Resource Name uniquely identifies a resource: arn:partition:service:region:account:resource. Global services or global namespaces leave fields empty — IAM has no Region, S3 bucket ARNs have neither Region nor account because bucket names are globally unique."],
  ["iam", 1, "What is the difference between an IAM user and an IAM role?", "A user is a long-lived identity with a password and/or access keys. A role has no credentials of its own; trusted principals assume it to receive temporary credentials from STS. Roles are preferred for applications, services, CI and federated humans."],
  ["iam", 2, "Describe the IAM policy evaluation logic within one account.", "Start with implicit deny. Any applicable explicit Deny wins. SCPs (and RCPs) must allow. Then an Allow is needed from an identity-based or resource-based policy. A permissions boundary and a session policy, if present, must also allow. Only then is the request allowed."],
  ["iam", 2, "What is a permissions boundary and when do you use one?", "A managed policy that sets the maximum permissions an identity can have; it grants nothing itself. Use it to let developers create roles for their own workloads safely: any role they create must carry the boundary, so they cannot create one more powerful than allowed."],
  ["iam", 2, "Task role vs task execution role in ECS?", "The task execution role is used by the ECS agent to pull the image from ECR, fetch secrets for injection and write logs. The task role is what the application code inside the container uses to call AWS APIs (S3, SQS, Bedrock)."],
  ["iam", 2, "How do you give GitHub Actions access to AWS without secrets?", "Create an IAM OIDC identity provider for token.actions.githubusercontent.com and a role whose trust policy allows AssumeRoleWithWebIdentity with conditions on aud (sts.amazonaws.com) and sub (repo:org/repo:ref:refs/heads/main or an environment). The workflow requests an ID token (permissions: id-token: write) and assumes the role."],
  ["iam", 1, "Secrets Manager or Parameter Store for a database password?", "Secrets Manager: it is built for credentials, rotates them automatically (native RDS support), supports cross-account access and versioning. Parameter Store SecureString works for simple secrets and config without rotation and the standard tier is free."],
  ["iam", 2, "Explain envelope encryption with KMS.", "KMS generates a data key; the service encrypts data locally with the plaintext data key and stores the data key encrypted under the KMS key. To decrypt, it asks KMS to decrypt the small data key (checked by IAM and the key policy, logged in CloudTrail). Large data never travels to KMS."],
  ["iam", 2, "How does an API verify a Cognito user's identity?", "The client sends the access (or ID) token as a Bearer token; the API verifies the JWT signature with the user pool's JWKS public keys, and checks expiry, issuer, token use and client id (aws-jwt-verify does this). The user id is taken from the verified sub claim, never from the request body."],
  ["iam", 3, "An identity policy allows s3:* but requests are denied. Where do you look?", "In evaluation order: an explicit Deny in any policy (including the bucket policy or an SCP), an SCP or RCP that does not allow S3, the bucket policy's conditions (e.g. TLS-only, VPC endpoint only), a permissions boundary, a session policy, and KMS key policy if objects use SSE-KMS. CloudTrail's error and the IAM policy simulator narrow it down."],
  ["net", 1, "What makes a subnet public?", "Its route table has a route for 0.0.0.0/0 (or ::/0) to an internet gateway. Instances there still need a public IP to be reachable. Private subnets lack that route and reach the internet, if needed, through a NAT gateway."],
  ["net", 1, "How many usable IP addresses does a /26 subnet have in AWS?", "A /26 has 64 addresses; AWS reserves 5 (network address, VPC router, DNS, one reserved for future use, broadcast), leaving 59 usable."],
  ["net", 1, "Security group vs network ACL?", "Security groups are stateful, allow-only, attached to network interfaces and can reference other security groups. NACLs are stateless, have ordered allow and deny rules, apply to whole subnets and require explicit return-traffic rules."],
  ["net", 2, "Why might your NAT gateway bill be high and how do you reduce it?", "NAT charges per hour and per GB processed. Private resources pulling images, reading S3 or calling AWS APIs through NAT drive data charges. Use the free S3/DynamoDB gateway endpoints, interface endpoints for ECR, Logs and Secrets Manager, and avoid cross-AZ NAT traffic (one NAT per AZ)."],
  ["net", 1, "ALB or NLB?", "ALB for HTTP/HTTPS: path/host routing, TLS termination, WebSockets, gRPC, WAF and Cognito integration. NLB for TCP/UDP/TLS at very high throughput and low latency, static IPs per AZ, client IP preservation or PrivateLink services."],
  ["net", 2, "How do you host a React SPA on S3 and CloudFront securely?", "Keep the bucket private with Block Public Access, serve through CloudFront with Origin Access Control and a bucket policy allowing only that distribution, set long cache headers for hashed assets and no-cache for index.html, map 403/404 to /index.html for client routes, and attach a TLS certificate from ACM (us-east-1) and WAF."],
  ["net", 2, "Gateway endpoint vs interface endpoint?", "Gateway endpoints exist only for S3 and DynamoDB, are route-table targets and cost nothing. Interface endpoints (PrivateLink) put ENIs with private IPs in your subnets for most other services and are billed per hour per AZ plus per GB."],
  ["net", 2, "Name Route 53 routing policies and a use for each.", "Simple (one record), weighted (canary 10 %), latency (closest Region), failover (active/passive with health checks), geolocation (by country, e.g. legal content), geoproximity (bias by distance), multivalue (several healthy IPs), IP-based (by client CIDR)."],
  ["net", 2, "How would you rate-limit login attempts at the edge?", "AWS WAF on CloudFront (or the ALB) with a rate-based rule scoped to the /api/login path, plus managed rule groups for bad inputs and IP reputation; start in count mode, then block. Combine with application-level lockouts and Cognito's advanced security features."],
  ["compute", 1, "What is user data on EC2?", "A script (or cloud-init config) passed at launch that runs on first boot as root — typically to install packages, fetch the app and start services. Baking these steps into an AMI or container image makes scaling faster and more reliable."],
  ["compute", 2, "How does target tracking auto scaling work?", "You choose a metric and target (average CPU 50 %, ALB requests per target 500). Auto Scaling creates CloudWatch alarms and adds capacity when the metric is above target and removes it, more conservatively, when below — always within min and max, accounting for instance warm-up."],
  ["compute", 1, "Fargate or EC2 launch type for ECS?", "Fargate: no instances to manage, per-task billing, strong isolation — the default for most teams. EC2: cheaper at large steady scale, GPU or special instance types, daemon tasks, more control, but you manage capacity, AMIs and patching."],
  ["compute", 2, "What is a Lambda cold start and how do you reduce its impact?", "The time to create an execution environment, load the code and run initialisation before the first request. Reduce it with smaller bundles, lazy imports, less init work, more memory (more CPU), and provisioned concurrency for latency-critical paths; keep clients and connections outside the handler for reuse."],
  ["compute", 1, "Key Lambda limits that affect design?", "15-minute maximum invocation (event functions), 128 MB–10,240 MB memory, 6 MB synchronous / 1 MB asynchronous payload, 250 MB unzipped deployment package (10 GB container images), 512 MB–10 GB /tmp, and a default 1,000 concurrent executions per Region."],
  ["compute", 2, "How do Lambda Web Functions differ from functions behind API Gateway?", "A Web Function runs a normal HTTP server (Express) listening on AWS_LAMBDA_HTTP_ENDPOINT; Lambda gives it an HTTPS endpoint, sends many concurrent requests to each execution environment, scales to zero and routes traffic between immutable revisions. An event function gets one event per invocation through an integration such as API Gateway and handles one request per environment at a time."],
  ["compute", 2, "What does ECS Express Mode need and create?", "It needs a container image, a task execution role and an infrastructure role, and creates a Fargate service with an HTTPS URL, an Application Load Balancer with TLS (shared across services with the same network setup), auto scaling, monitoring and networking — all normal resources in your account, at no extra charge."],
  ["compute", 3, "A steady 400 req/s API, a nightly 2-hour batch and S3-triggered thumbnails: choose compute.", "API: ECS Fargate (steady load, long-lived connections; Savings Plans apply). Batch: an ECS task or AWS Batch started by EventBridge Scheduler (over Lambda's 15-minute limit, Spot for cost). Thumbnails: Lambda event function triggered by S3 (spiky, short)."],
  ["data", 1, "Multi-AZ vs read replica?", "Multi-AZ provides availability with a synchronous standby and automatic failover (not readable in the instance deployment). Read replicas are asynchronous, readable copies for read scaling or cross-Region DR; they can lag and need promotion to become writable."],
  ["data", 1, "How do you let users upload large files without passing them through the API?", "The API authenticates the user and returns a short-lived presigned PUT URL (or presigned POST with a content-length-range condition) for a server-chosen key; the browser uploads directly to S3; an S3 event triggers processing. The bucket remains private with CORS allowing the site's origin."],
  ["data", 2, "Why does RDS Proxy matter for Lambda?", "Each Lambda execution environment opens its own database connection; bursts can exhaust MySQL's max_connections. RDS Proxy pools and multiplexes connections, queues briefly when busy, keeps client connections across failovers and supports IAM authentication."],
  ["data", 2, "How do you model 'latest 10 orders for a user' in DynamoDB?", "Partition key USER#<id>, sort key ORDER#<ISO timestamp>#<id>; Query with PK = USER#42 and begins_with(SK, 'ORDER#'), ScanIndexForward false, Limit 10. Add a GSI for other access patterns such as orders by status."],
  ["data", 2, "Explain cache-aside and its pitfalls.", "Read from the cache; on a miss read the database, write the cache with a TTL, return. On writes update the database and invalidate the key. Pitfalls: stale data, stampedes when hot keys expire (use jitter, locks or early refresh), caching rarely read data, and treating the cache as a source of truth."],
  ["data", 1, "Which S3 storage class for data accessed unpredictably?", "S3 Intelligent-Tiering: it moves objects between access tiers automatically based on usage, with no retrieval fees, for a small monitoring charge per object."],
  ["data", 2, "Why upgrade RDS MySQL 8.0 databases now?", "MySQL 8.0 reached community end of life in April 2026 and RDS end of standard support on 31 July 2026; it now runs only under paid RDS Extended Support. Upgrade to MySQL 8.4 (supported RDS upgrade path), testing first on a restored snapshot clone."],
  ["data", 3, "Aurora vs RDS MySQL — when is Aurora worth it?", "When you need fast failover, many low-lag read replicas, storage that grows automatically with six-way replication across three AZs, Global Database for cross-Region DR, or Serverless v2's elastic capacity. For small steady workloads RDS MySQL is usually cheaper; compare instance and I/O costs."],
  ["events", 1, "What is the SQS visibility timeout?", "After a consumer receives a message it is hidden for the visibility timeout. If deleted within that time it is gone; otherwise it becomes visible again and is redelivered. Set it longer than processing takes (with Lambda, at least six times the function timeout)."],
  ["events", 2, "How do you handle a poison message in an SQS-triggered Lambda?", "Enable ReportBatchItemFailures and return only failed message ids so successful messages are not retried; configure a redrive policy with maxReceiveCount to move repeatedly failing messages to a dead-letter queue; alarm on DLQ depth and redrive after fixing."],
  ["events", 2, "SNS vs SQS vs EventBridge?", "SQS: a queue for one consumer group to pull work at its own pace. SNS: push pub/sub fan-out to many subscribers (often SQS queues), plus email/SMS/mobile. EventBridge: an event bus with content-based routing rules, many targets, archive/replay, schema registry and schedules."],
  ["events", 2, "What is idempotency and how do you implement it?", "An operation is idempotent if repeating it has the same effect as doing it once. Use an idempotency key (order id, client UUID): record it with a conditional write before acting and return the stored result for duplicates; pass the key to downstream APIs such as payment providers."],
  ["events", 2, "Standard vs Express Step Functions workflows?", "Standard: up to one year, exactly-once execution, full history, priced per state transition — for business processes and sagas. Express: up to five minutes, at-least-once (async) or at-most-once (sync), high volume, priced by requests and duration — for event processing."],
  ["events", 2, "How many concurrent Lambda executions does 300 req/s at 400 ms need?", "Concurrency ≈ rate × duration = 300 × 0.4 = 120 concurrent execution environments."],
  ["events", 1, "HTTP API or REST API in API Gateway?", "HTTP API for most Lambda/HTTP back ends: lower price, JWT authorizers, simple. REST API when you need API keys and usage plans, request validation, caching, mapping templates, AWS WAF on the API, private APIs or edge-optimised endpoints."],
  ["events", 3, "How do you guarantee an event is published only if the order is committed?", "Use the transactional outbox pattern: insert the event into an outbox table in the same database transaction as the order; a relay (polling job or change-data-capture) publishes outbox rows to EventBridge/SNS and marks them sent. Consumers dedupe on the event id."],
  ["ops", 1, "What does a CloudFormation change set show?", "The resources that will be added, modified or removed by a stack update and whether a modification requires replacement — crucial for spotting accidental replacement of databases or buckets before executing."],
  ["ops", 2, "Why split CDK stacks into stateful and stateless?", "Stateful resources (databases, buckets, KMS keys) change rarely and must never be replaced accidentally; they get retention policies and termination protection. Stateless stacks (services, functions) change often and can be destroyed and recreated freely."],
  ["ops", 2, "Rolling vs blue/green vs canary?", "Rolling replaces capacity gradually (no extra cost, mixed versions, slower rollback). Blue/green runs a full new environment and switches traffic at once (instant rollback, double capacity briefly). Canary sends a small share first and shifts the rest if alarms stay quiet (smallest blast radius)."],
  ["ops", 1, "What would you alarm on for a web API?", "User-facing symptoms: 5xx error rate, p95/p99 latency, availability from synthetic checks, queue age for async work, DLQ depth; plus saturation signals with lead time such as DB connections, free storage and CPU credit balance."],
  ["ops", 2, "CloudTrail vs Config vs GuardDuty?", "CloudTrail records API activity (who did what). Config records resource configuration history and evaluates compliance rules. GuardDuty analyses logs with threat intelligence and ML to detect active threats. Security Hub aggregates findings."],
  ["ops", 2, "Define RTO and RPO and name the four DR strategies.", "RTO: maximum acceptable downtime. RPO: maximum acceptable data loss in time. Strategies in increasing cost: backup & restore, pilot light, warm standby, multi-site active/active."],
  ["ops", 2, "Three hidden costs in a typical AWS web stack?", "NAT gateway data processing, data transfer (cross-AZ, to the internet), public IPv4 addresses, idle load balancers and unattached EBS volumes, CloudWatch Logs kept forever, oversized RDS instances, and forgotten dev environments."],
  ["ops", 3, "When is an always-on container cheaper than Lambda for an API?", "When traffic is steady enough that per-request compute exceeds the fixed cost of the tasks. Lambda cost ≈ requests × (price per request + duration × memory × GB-second price); Fargate cost ≈ tasks × hours × (vCPU and memory prices). Compute both for your volume and latency; Savings Plans change the numbers for both."],
  ["ai", 1, "Bedrock, SageMaker AI or an AI service — how do you choose?", "Use a pre-built AI service when one task matches (OCR → Textract, moderation → Rekognition). Use Bedrock for generative tasks with foundation models, RAG and agents without managing infrastructure. Use SageMaker AI when you must train, fine-tune or host your own model."],
  ["ai", 1, "What does the Converse API return that matters for cost?", "usage.inputTokens and usage.outputTokens (and totalTokens) per call, plus stopReason; output tokens are usually priced higher than input tokens, so maxTokens and prompt size drive cost."],
  ["ai", 2, "Explain what a Bedrock Knowledge Base does at ingestion and query time.", "Ingestion: read documents from the data source (e.g. S3), split them into chunks, embed each chunk with an embedding model and store vectors with text and metadata in a vector store. Query: embed the question, retrieve the nearest chunks (with metadata filters), and optionally generate a grounded answer with citations."],
  ["ai", 2, "OpenSearch Serverless, Aurora pgvector or S3 Vectors?", "OpenSearch Serverless for low-latency, high-query-rate and hybrid search; Aurora PostgreSQL pgvector to keep vectors with relational data and SQL filters; S3 Vectors for large, infrequently queried collections at the lowest storage cost with sub-second queries."],
  ["ai", 2, "What can Bedrock Guardrails enforce?", "Content filters (harmful categories and prompt attacks), denied topics, word filters, sensitive information filters that block or mask PII, and contextual grounding checks — applied to input and output, through Converse's guardrailConfig, Knowledge Bases, agents or the standalone ApplyGuardrail API."],
  ["ai", 2, "Describe the tool-use loop with Converse.", "Send messages plus toolConfig (tool names, descriptions, JSON input schemas). If the model returns stopReason tool_use with tool name and input, execute the tool in your code, append a toolResult message and call Converse again; repeat until stopReason end_turn."],
  ["ai", 2, "What does Amazon Bedrock AgentCore provide?", "Services to run agents built with any framework and model: Runtime (isolated serverless sessions), Memory, Gateway (APIs and Lambda as MCP tools), Identity, Code Interpreter, Browser, Observability, Policy, Evaluations, plus newer pieces such as Harness and Registry."],
  ["ai", 3, "How would you estimate and control the cost of an LLM feature?", "Estimate requests × (input tokens × input price + output tokens × output price) from real prompt sizes; control with smaller models where evals allow, fewer retrieved chunks, prompt caching, batch inference for offline work, maxTokens, per-user rate limits and budgets, and dashboards from logged usage."],
  ["ai", 2, "How do you stop prompt injection from retrieved documents?", "Treat retrieved text as data: wrap it clearly, tell the model it contains no instructions, enable Guardrails prompt-attack filters, restrict tools to least privilege with user-level authorisation and confirmations for side effects, and evaluate with adversarial test cases."],
  ["arch", 1, "Design a highly available web app for React + Node + MySQL on AWS.", "React on S3 behind CloudFront (OAC, WAF); Node API stateless in private subnets across two or three AZs (ECS Fargate or an Auto Scaling group) behind an ALB; RDS MySQL Multi-AZ in isolated subnets, ElastiCache for hot reads; secrets in Secrets Manager; security groups chained; CloudWatch alarms; IaC and CI/CD."],
  ["arch", 2, "How does the design change for ten times the traffic?", "Scale the API horizontally (higher max, request-based scaling), add caching (CloudFront for public API responses, ElastiCache), read replicas or Aurora replicas for reads, move slow work to queues, tune indexes and queries, and load-test to find the next bottleneck (often the database)."],
  ["arch", 2, "Why make the API stateless?", "So any instance can serve any request, instances can be added, removed or replaced freely, and an AZ failure loses nothing. Sessions go to JWTs or a shared cache, files to S3, data to the database."],
  ["arch", 2, "What is a saga and why use Step Functions for it?", "A sequence of local transactions with compensating actions when a later step fails (refund the card if shipping fails), because there is no distributed transaction across services. Step Functions gives retries, catches, state and a visible history for each run."],
  ["arch", 3, "Business needs RTO 30 min, RPO 1 min for orders. Proposal?", "Pilot light or warm standby: Aurora Global Database (typical cross-Region lag around a second) for the order data, IaC-defined API stack in the second Region (scaled down or ready to scale), S3 cross-Region replication, Route 53 failover, and a rehearsed runbook."],
  ["arch", 2, "What are the first things you check in an inherited AWS account?", "Root MFA and no root keys; IAM users with old access keys; admin policies on workloads; public buckets and security groups open to 0.0.0.0/0 on admin ports; CloudTrail, GuardDuty and Config enabled; backups and their last restore test; encryption; budgets and cost spikes; untagged resources."],
];

export const drills: DrillDef[] = [
  {
    t: "The site dies with the server",
    q: "ShopNest v1 runs Node and MySQL on one EC2 instance. Last night the instance's host failed and the shop was down for two hours; 6 hours of orders were lost. What is the most important first change?",
    code: "",
    opts: [
      ["Move MySQL to RDS with Multi-AZ and automated backups", true, "Data loss is the irreversible failure: managed backups with point-in-time restore and a synchronous standby fix both the loss and the database downtime."],
      ["Switch to a bigger instance type", false, "A bigger single instance fails the same way."],
      ["Add CloudFront in front", false, "Caching static files does not protect the database or orders."],
      ["Run the nightly dump every hour", false, "Better RPO, but still loses up to an hour and leaves a single point of failure."],
    ],
    path: ["Separate state from compute first: the database holds what you cannot recreate.", "RDS Multi-AZ + PITR: RPO of minutes or less, automatic failover.", "Then make the API stateless and run two instances behind an ALB."],
    why: "Protect the data before scaling anything.",
    watch: "Restore from a backup once to prove it works.",
    remember: "Compute is replaceable; data is not — fix the data tier first.",
  },
  {
    t: "Access Denied despite s3:*",
    q: "The API's role has an identity policy allowing s3:* on the images bucket, yet GetObject returns AccessDenied. The bucket uses SSE-KMS with a customer managed key. What is the most likely cause?",
    code: "",
    opts: [
      ["The role lacks kms:Decrypt on the bucket's KMS key (or the key policy does not allow it)", true, "Reading an SSE-KMS object needs permission on the key too; the key policy must also allow it."],
      ["S3 is eventually consistent", false, "S3 has strong read-after-write consistency, and that would give NoSuchKey, not AccessDenied."],
      ["The bucket must be public", false, "Never; roles in the same account need no public access."],
      ["IAM changes take a day to apply", false, "IAM is eventually consistent but within seconds."],
    ],
    path: ["S3 permission is fine (s3:* allows GetObject).", "The object is encrypted with a customer managed KMS key.", "Decryption requires kms:Decrypt allowed by both the role and the key policy."],
    why: "Encryption adds a second resource to authorise: the key.",
    watch: "CloudTrail shows the kms:Decrypt denial separately from S3.",
    remember: "SSE-KMS objects need S3 and KMS permissions.",
  },
  {
    t: "The surprise NAT bill",
    q: "A small Fargate API in private subnets costs far more than expected; Cost Explorer shows most spend on 'NAT Gateway - Bytes'. Tasks pull large images on every deploy and read product images from S3 constantly. Best fix?",
    code: "",
    opts: [
      ["Add an S3 gateway endpoint and interface endpoints for ECR (api, dkr) and CloudWatch Logs", true, "Image layers and S3 traffic then bypass NAT; the S3 gateway endpoint is free."],
      ["Move the tasks to public subnets", false, "Exposes tasks and still pays data transfer; it fixes the bill by weakening security."],
      ["Use a bigger NAT gateway", false, "NAT gateways have no sizes; you pay per GB."],
      ["Turn on CloudFront", false, "CloudFront helps shoppers, not the tasks' traffic to AWS services."],
    ],
    path: ["Identify traffic: ECR pulls and S3 reads, all to AWS services.", "AWS-service traffic can use VPC endpoints instead of NAT.", "S3 gateway endpoint (free) + ECR/Logs interface endpoints."],
    why: "VPC endpoints keep AWS-service traffic off the NAT gateway.",
    watch: "ECR image layers are stored in S3 — the S3 gateway endpoint is needed for pulls too.",
    remember: "Check NAT bytes in every cost review.",
  },
  {
    t: "Flash sale slowdown",
    q: "During a flash sale traffic jumps 6× within a minute. Target tracking at 70 % CPU works, but the site is slow for about five minutes each time. Which change helps most for the next planned sale?",
    code: "",
    opts: [
      ["Scheduled scaling to raise min capacity before the sale, plus a lower target", true, "Capacity is ready before the spike; new instances' warm-up no longer hits users."],
      ["Raise the maximum capacity only", false, "Max was never reached; the problem is the time to add capacity."],
      ["Switch to step scaling with 10-minute cooldowns", false, "Slower reactions make it worse."],
      ["Add read replicas", false, "The bottleneck shown is the API tier warming up, not database reads."],
    ],
    path: ["Reactive scaling always lags by warm-up time.", "The sale time is known → scale ahead of it.", "A lower target keeps headroom for the first minute; faster-starting images shorten warm-up."],
    why: "Known peaks should be met by scheduled or predictive scaling, not reactive policies alone.",
    watch: "Try it in the scaling lab: min, target and warm-up change the overloaded minutes.",
    remember: "Scale ahead of known spikes; react to unknown ones.",
  },
  {
    t: "Lambda melts MySQL",
    q: "ShopNest v4 moved the API to Lambda. During a sale, MySQL reports 'Too many connections' and errors spike. Which fix addresses the root cause?",
    code: "",
    opts: [
      ["Put RDS Proxy between Lambda and MySQL (and cap the function's concurrency)", true, "The proxy pools and multiplexes connections; reserved concurrency bounds the load."],
      ["Increase the Lambda timeout", false, "Longer timeouts hold connections longer."],
      ["Increase Lambda memory", false, "Faster functions help a bit but still open one connection per environment."],
      ["Open a new connection per request and close it", false, "Even more connection churn on MySQL."],
    ],
    path: ["Each execution environment holds its own connection.", "Burst → hundreds of environments → hundreds of connections.", "RDS Proxy shares a small pool; reserved concurrency limits the burst."],
    why: "Serverless compute needs a connection pooler in front of a relational database.",
    watch: "Keep transactions short; session pinning reduces multiplexing.",
    remember: "Lambda + RDS ⇒ RDS Proxy.",
  },
  {
    t: "Duplicate charges",
    q: "An SQS-triggered Lambda charges cards. A few customers were charged twice after a timeout. What is the correct fix?",
    code: "",
    opts: [
      ["Make the handler idempotent with an idempotency key (order id) recorded by a conditional write and passed to the payment API", true, "At-least-once delivery means duplicates will happen; idempotency makes them harmless."],
      ["Switch to a FIFO queue and stop worrying", false, "FIFO dedupes within a 5-minute window and in SQS only; a timeout after the charge still retries."],
      ["Lower the visibility timeout", false, "Makes duplicates more likely."],
      ["Disable retries", false, "Then genuine failures are lost."],
    ],
    path: ["Delivery is at-least-once; retries follow timeouts.", "Record the order id before charging; on repeat, return the saved result.", "Payment providers accept idempotency keys too."],
    why: "Idempotency, not delivery guarantees, prevents double side effects.",
    watch: "The visibility timeout must exceed the processing time.",
    remember: "Every consumer must be idempotent.",
  },
  {
    t: "One poison message",
    q: "A batch of 10 SQS messages reaches Lambda; one has malformed JSON and the handler throws. What happens without partial batch responses?",
    code: "",
    opts: [
      ["All 10 messages return to the queue and are retried, repeatedly reprocessing the 9 good ones", true, "A thrown error fails the whole batch."],
      ["Only the bad message is retried", false, "That requires ReportBatchItemFailures."],
      ["The bad message is deleted automatically", false, "SQS deletes nothing on failure."],
      ["Lambda skips the batch", false, "It retries until success or the redrive policy moves messages to the DLQ."],
    ],
    path: ["Throwing fails the invocation.", "Every message in the batch becomes visible again after the visibility timeout.", "Return batchItemFailures to retry only the failed one; a DLQ catches it after maxReceiveCount."],
    why: "Report partial failures to avoid reprocessing successes.",
    watch: "Successful messages processed twice must be harmless (idempotency again).",
    remember: "SQS + Lambda: ReportBatchItemFailures + DLQ.",
  },
  {
    t: "The public bucket",
    q: "Product images must load on the public website. A teammate proposes making the bucket public. Best approach?",
    code: "",
    opts: [
      ["Keep the bucket private and serve it through CloudFront with Origin Access Control", true, "Public delivery without a public bucket, plus caching and TLS at the edge."],
      ["Make only the products/ prefix public with a bucket policy", false, "Still a public bucket and blocked by account-level Block Public Access (as it should be)."],
      ["Presign every image URL in the API", false, "Works but defeats caching and adds load; presigning suits private content."],
      ["Use ACLs to make each object public", false, "ACLs are disabled by default and the pattern is discouraged."],
    ],
    path: ["Users need read access to some objects.", "CloudFront can read a private bucket via OAC.", "The bucket policy allows only that distribution."],
    why: "Public content does not require public storage.",
    watch: "Turn on account-level Block Public Access everywhere.",
    remember: "S3 + CloudFront + OAC.",
  },
  {
    t: "Keys in the repository",
    q: "You find an AWS access key in the Git history of the API repo. It belongs to an IAM user used by the app on EC2. Right sequence?",
    code: "",
    opts: [
      ["Deactivate/delete the key, check CloudTrail for its use, then switch the app to an instance role", true, "Contain first, investigate second, remove the root cause."],
      ["Rewrite Git history to remove it", false, "The key is already exposed; removing history does not revoke it."],
      ["Rotate the key and store the new one in .env", false, "Repeats the same risk."],
      ["Add an IP condition to the user", false, "Mitigates but keeps a long-lived key."],
    ],
    path: ["Assume the key is compromised: disable it now.", "CloudTrail shows what it did; GuardDuty may already have findings.", "Use roles so there is no key to leak."],
    why: "Long-lived keys are the leak; roles remove them.",
    watch: "Turn on secret scanning in the repository.",
    remember: "Applications on AWS never need access keys.",
  },
  {
    t: "Deep links 404",
    q: "The React app on S3 + CloudFront loads at /, but refreshing /orders/42 shows an S3 error. Why and how do you fix it?",
    code: "",
    opts: [
      ["There is no object at orders/42; map 403/404 responses to /index.html (custom error response or a CloudFront Function)", true, "Client-side routes exist only in React; the server must return index.html."],
      ["Enable S3 static website hosting and make the bucket public", false, "Unnecessary and less secure."],
      ["Invalidate the CloudFront cache", false, "Caching is not the problem."],
      ["Add CORS to the bucket", false, "CORS is about cross-origin requests from the browser."],
    ],
    path: ["CloudFront asks S3 for the key orders/42.", "With OAC a missing key returns 403 (or 404).", "Serve index.html instead; React Router then renders the route."],
    why: "Single-page apps need a fallback to index.html.",
    watch: "Do not apply the fallback to /api/* paths — real API 404s must stay 404s.",
    remember: "SPA on CloudFront ⇒ error fallback to index.html.",
  },
  {
    t: "Slow checkout trace",
    q: "Checkout p99 is 1.4 s. The X-Ray trace shows: JWT verify 8 ms, MySQL SELECT … FOR UPDATE 900 ms, SQS send 15 ms. What do you do first?",
    code: "",
    opts: [
      ["Investigate the MySQL query: EXPLAIN it and add the missing index / shorten the lock", true, "The trace says the database span dominates."],
      ["Scale out the API tasks", false, "The API is waiting, not busy."],
      ["Add a cache in front of checkout", false, "Checkout writes need fresh, locked data."],
      ["Move to Lambda", false, "Same query, same wait."],
    ],
    path: ["Read the waterfall: 900 of 1,400 ms is one SQL statement.", "FOR UPDATE + a scan locks many rows.", "Index the predicate; keep the transaction short."],
    why: "Optimise the span that dominates the trace.",
    watch: "Lock contention grows with traffic — fix it before the sale.",
    remember: "Measure with traces before scaling.",
  },
  {
    t: "Canary went wrong",
    q: "A new API version was shifted to 10 % of traffic; its 5xx rate is 4 % versus 0.2 % on the old version. What should happen?",
    code: "",
    opts: [
      ["The alarm stops the rollout and shifts traffic back to the old version automatically", true, "That is the point of a canary: limit the blast radius and reverse quickly."],
      ["Shift to 50 % to gather more data", false, "Exposes more users to a known-bad version."],
      ["Restart the new tasks", false, "The errors are likely in the code or config."],
      ["Wait for the full bake time", false, "Clear alarms should end it early."],
    ],
    path: ["Canary alarms compare the new version's error rate.", "Breach → automatic rollback.", "Investigate with the canary's logs and traces."],
    why: "Automated rollback turns a bad deploy into a non-event.",
    watch: "Database migrations must stay backwards compatible so rollback is possible.",
    remember: "Canary + alarm + automatic rollback.",
  },
  {
    t: "Assistant answers off-topic",
    q: "ShopNest's Bedrock assistant gave a user medical advice and once repeated another customer's email that appeared in a review. Best combined fix?",
    code: "",
    opts: [
      ["A Bedrock Guardrail with a denied topic (medical advice) and PII masking on input and output", true, "Guardrails enforce topic and PII rules regardless of the model or prompt."],
      ["Add 'do not give medical advice' to the system prompt", false, "Helps, but prompts are not enforcement and do nothing for PII leaks."],
      ["Switch to a bigger model", false, "Bigger models still follow manipulative inputs and repeat data they see."],
      ["Lower the temperature", false, "Changes randomness, not policy."],
    ],
    path: ["Two failures: topic scope and PII exposure.", "Denied topics block out-of-scope questions.", "Sensitive information filters mask emails in input and output."],
    why: "Policy belongs in an enforced layer, not only in the prompt.",
    watch: "Also remove PII from documents before they are indexed.",
    remember: "Guardrails on both input and output.",
  },
  {
    t: "RAG gives outdated policy",
    q: "The returns policy changed from 14 to 30 days, but the assistant still says 14. The new PDF is in the S3 data source. Most likely cause?",
    code: "",
    opts: [
      ["The Knowledge Base has not been synced since the document changed", true, "Ingestion runs on sync; until then the vector store holds the old chunks."],
      ["The model is outdated", false, "The answer comes from retrieved chunks."],
      ["S3 is eventually consistent", false, "S3 is strongly consistent."],
      ["The temperature is too high", false, "Randomness does not explain a consistent old fact."],
    ],
    path: ["Answers come from retrieved chunks.", "Chunks are created at sync time.", "Start a sync (or schedule one on S3 change events) and delete the old document."],
    why: "Retrieval quality depends on keeping the index in step with the sources.",
    watch: "Old and new versions both indexed produce contradictions — remove superseded files.",
    remember: "Changed docs → sync the Knowledge Base.",
  },
  {
    t: "LLM bill tripled",
    q: "The assistant's Bedrock cost tripled after a release. Logs show input tokens per request went from 1,500 to 6,000; output is unchanged. What happened, most likely?",
    code: "",
    opts: [
      ["The release retrieves more or bigger chunks (or sends full chat history) into every prompt", true, "Input tokens grew 4×; context size is the usual cause."],
      ["The model's price changed", false, "Usage, not price, changed in the logs."],
      ["maxTokens was raised", false, "That would affect output tokens."],
      ["Streaming was enabled", false, "Streaming does not change token counts."],
    ],
    path: ["Cost ∝ input tokens × price + output tokens × price.", "Input quadrupled: look at retrieval settings and conversation history.", "Trim history, retrieve fewer chunks, consider prompt caching for the stable prefix."],
    why: "Logged usage tells you exactly which side of the bill grew.",
    watch: "Add a CI check on average prompt size for the evaluation set.",
    remember: "Log tokens per request, and alert on changes.",
  },
  {
    t: "Choose the vector store",
    q: "ShopNest wants an assistant over ~200,000 support articles. Queries are a few per minute; budget is tight; sub-second answers are fine. Which vector store fits best?",
    code: "",
    opts: [
      ["Amazon S3 Vectors", true, "Large collections, infrequent queries, lowest cost, sub-second latency."],
      ["OpenSearch Serverless", false, "Great for high query rates and hybrid search, but pays for capacity the workload does not need."],
      ["DynamoDB", false, "Not a vector similarity store."],
      ["ElastiCache", false, "Memory is the most expensive place to keep 200k vectors for rare queries."],
    ],
    path: ["Volume: large. Query rate: low. Latency: sub-second OK. Budget: tight.", "S3 Vectors targets exactly this profile.", "Revisit if traffic grows or hybrid keyword search becomes essential."],
    why: "Match the store to query rate and cost, not to popularity.",
    watch: "Embedding dimensions must match the vector index.",
    remember: "Rare queries over lots of vectors → S3 Vectors.",
  },
];

export const codeLab: [title: string, brief: string, code: string][] = [
  [
    "Lab 1 · Safe account setup",
    "Secure a new account before building: CLI with SSO, a budget, and a check of who you are. Run in a terminal after creating an IAM Identity Center user.",
    `aws configure sso                         # profile: shopnest-dev, region eu-west-1
aws sso login --profile shopnest-dev
aws sts get-caller-identity --profile shopnest-dev

# Budget alert at 80 % of 25 USD (replace the account id and email)
aws budgets create-budget --account-id 111122223333 --profile shopnest-dev \\
  --budget '{"BudgetName":"shopnest","BudgetLimit":{"Amount":"25","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'`,
  ],
  [
    "Lab 2 · Host the React app on S3 + CloudFront (CDK)",
    "A private bucket, a CloudFront distribution with OAC, SPA fallback, and the build uploaded on deploy.",
    `import { Stack, RemovalPolicy, Duration } from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as origins from "aws-cdk-lib/aws-cloudfront-origins";
import * as deploy from "aws-cdk-lib/aws-s3-deployment";

export class WebStack extends Stack {
  constructor(scope, id, props) {
    super(scope, id, props);
    const bucket = new s3.Bucket(this, "Web", {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      removalPolicy: RemovalPolicy.DESTROY, autoDeleteObjects: true,   // dev only
    });
    const dist = new cloudfront.Distribution(this, "Cdn", {
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(bucket),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
      },
      defaultRootObject: "index.html",
      errorResponses: [403, 404].map((httpStatus) => ({ httpStatus, responseHttpStatus: 200, responsePagePath: "/index.html", ttl: Duration.seconds(0) })),
    });
    new deploy.BucketDeployment(this, "Upload", {
      sources: [deploy.Source.asset("../web/dist")],
      destinationBucket: bucket, distribution: dist, distributionPaths: ["/index.html"],
    });
  }
}`,
  ],
  [
    "Lab 3 · VPC + RDS MySQL 8.4 (CDK)",
    "Network with public/app/data subnets and a Multi-AZ MySQL database whose credentials live in Secrets Manager.",
    `import { Duration } from "aws-cdk-lib";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";

const vpc = new ec2.Vpc(this, "Vpc", {
  maxAzs: 2, natGateways: 1,
  subnetConfiguration: [
    { name: "public", subnetType: ec2.SubnetType.PUBLIC },
    { name: "app", subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS },
    { name: "data", subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
  ],
});
const db = new rds.DatabaseInstance(this, "Db", {
  engine: rds.DatabaseInstanceEngine.mysql({ version: rds.MysqlEngineVersion.of("8.4.7", "8.4") }),
  vpc, vpcSubnets: { subnetType: ec2.SubnetType.PRIVATE_ISOLATED },
  instanceType: ec2.InstanceType.of(ec2.InstanceClass.T4G, ec2.InstanceSize.SMALL),
  multiAz: true,
  credentials: rds.Credentials.fromGeneratedSecret("shop"),     // stored in Secrets Manager
  backupRetention: Duration.days(7),
  deletionProtection: true,
  storageEncrypted: true,
});
// later: db.connections.allowDefaultPortFrom(apiService)       — SG chaining, no CIDRs`,
  ],
  [
    "Lab 4 · Containerise and deploy the API",
    "Dockerfile, health check and the CDK pattern for an ALB + Fargate service with secrets and autoscaling (see the CDK concept for the full stack).",
    `# api/Dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
HEALTHCHECK CMD wget -qO- http://localhost:3000/healthz || exit 1
CMD ["node", "server.js"]

# local check before deploying
docker build -t shopnest-api . && docker run -p 3000:3000 -e DB_HOST=host.docker.internal shopnest-api
curl localhost:3000/healthz

# deploy (CDK builds the image, pushes to ECR and updates the service)
npx cdk deploy ApiStack`,
  ],
  [
    "Lab 5 · Presigned uploads + thumbnail Lambda",
    "Wire the upload flow end to end: API route for presigned URLs, S3 event notification, and a resize function.",
    `// inside the stack (s3, Duration and apiTaskRole as in earlier labs)
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as nodejs from "aws-cdk-lib/aws-lambda-nodejs";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

const images = new s3.Bucket(this, "Images", {
  cors: [{ allowedMethods: [s3.HttpMethods.PUT], allowedOrigins: ["https://shopnest.example"], allowedHeaders: ["*"] }],
  lifecycleRules: [{ prefix: "uploads/", expiration: Duration.days(7) }],
});
const resize = new nodejs.NodejsFunction(this, "Resize", {
  entry: "../functions/resize.mjs", runtime: lambda.Runtime.NODEJS_22_X,
  memorySize: 1024, timeout: Duration.seconds(30),
  bundling: { nodeModules: ["sharp"] },
});
images.grantRead(resize, "uploads/*");
images.grantPut(resize, "thumbs/*");
images.addEventNotification(s3.EventType.OBJECT_CREATED, new s3n.LambdaDestination(resize), { prefix: "uploads/" });
images.grantPut(apiTaskRole, "uploads/*");     // lets the API sign PUT URLs for that prefix only`,
  ],
  [
    "Lab 6 · Order events: SQS worker with DLQ",
    "Checkout publishes to a queue; a Lambda worker processes batches with partial failures; poison messages go to a DLQ with an alarm.",
    `import * as sqs from "aws-cdk-lib/aws-sqs";
import * as sources from "aws-cdk-lib/aws-lambda-event-sources";
import * as cw from "aws-cdk-lib/aws-cloudwatch";

const dlq = new sqs.Queue(this, "OrdersDlq", { retentionPeriod: Duration.days(14) });
const orders = new sqs.Queue(this, "Orders", {
  visibilityTimeout: Duration.seconds(180),            // ≥ 6 × the function timeout
  deadLetterQueue: { queue: dlq, maxReceiveCount: 5 },
});
const worker = new nodejs.NodejsFunction(this, "OrderWorker", { entry: "../functions/order-worker.mjs", timeout: Duration.seconds(30) });
worker.addEventSource(new sources.SqsEventSource(orders, { batchSize: 10, reportBatchItemFailures: true, maxConcurrency: 20 }));
orders.grantSendMessages(apiTaskRole);
new cw.Alarm(this, "DlqNotEmpty", {
  metric: dlq.metricApproximateNumberOfMessagesVisible(), threshold: 1, evaluationPeriods: 1,
});`,
  ],
  [
    "Lab 7 · GitHub Actions deploy with OIDC",
    "One workflow: test, then deploy with a role trusted only for this repository's main branch.",
    `name: deploy
on: { push: { branches: [main] } }
permissions: { id-token: write, contents: read }
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm test
      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::111122223333:role/shopnest-deploy
          aws-region: eu-west-1
      - run: npx cdk deploy --all --require-approval never`,
  ],
  [
    "Lab 8 · The AI assistant route",
    "Bedrock Knowledge Base retrieval + a guardrail + token logging behind an authenticated Express route.",
    `import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";
const kb = new BedrockAgentRuntimeClient({});

app.post("/api/assistant", requireUser, rateLimit({ perUserPerDay: 50 }), async (req, res) => {
  const out = await kb.send(new RetrieveAndGenerateCommand({
    input: { text: req.body.question.slice(0, 1000) },
    retrieveAndGenerateConfiguration: {
      type: "KNOWLEDGE_BASE",
      knowledgeBaseConfiguration: {
        knowledgeBaseId: process.env.KB_ID,
        modelArn: process.env.MODEL_ARN,
        generationConfiguration: {
          guardrailConfiguration: { guardrailId: process.env.GUARDRAIL_ID, guardrailVersion: "1" },
          inferenceConfig: { textInferenceConfig: { maxTokens: 400, temperature: 0.2 } },
        },
      },
    },
  }));
  const sources = (out.citations ?? []).flatMap((c) => c.retrievedReferences.map((r) => r.location?.s3Location?.uri));
  console.log(JSON.stringify({ user: req.user.id, sources }));    // + usage from invocation logging
  res.json({ answer: out.output.text, sources });
});`,
  ],
];

export const glance: [string, string][] = [
  ["Regions & AZs", "Region = geography; AZ = isolated data centre; spread across ≥ 2 AZs."],
  ["IAM evaluation", "Explicit Deny > SCP/RCP > Allow (identity or resource) > boundary > session policy."],
  ["Roles, not keys", "Instance profile (EC2), task role (ECS), execution role (Lambda), OIDC (CI)."],
  ["Subnet maths", "2^(32 − prefix) − 5 usable; /24 → 251, /26 → 59."],
  ["Public subnet", "Route 0.0.0.0/0 → internet gateway; private uses NAT for outbound."],
  ["SG vs NACL", "SG stateful allow-only per ENI; NACL stateless, ordered, per subnet."],
  ["Lambda limits", "15 min, 10,240 MB, 6 MB sync / 1 MB async payload, 1,000 concurrency default."],
  ["SQS", "1 MiB messages, 14-day max retention, visibility timeout ≤ 12 h, DLQ via redrive."],
  ["API Gateway", "HTTP API ≤ 30 s, REST 29 s (raisable), 10 MB payload, 10,000 rps account default."],
  ["S3", "50 TB max object, 5 GB single PUT, strong consistency, Block Public Access by default."],
  ["RDS MySQL", "8.4 is current; 8.0 on paid Extended Support since 1 Aug 2026."],
  ["DR", "Backup & restore → pilot light → warm standby → active/active (RTO/RPO ↓, cost ↑)."],
  ["Bedrock cost", "requests × (in tokens × in price + out tokens × out price)."],
];

export const lists: [string, string[]][] = [
  ["Day-one account checklist", ["MFA on root, no root access keys", "IAM Identity Center for people", "Budget alert + Cost Anomaly Detection", "CloudTrail (organization trail), GuardDuty, Config", "Account-level S3 Block Public Access", "Default region chosen, unused regions blocked by SCP"]],
  ["ShopNest production checklist", ["Two+ AZs for API and DB", "Private subnets for API and DB, SG chaining", "Secrets in Secrets Manager, TLS to MySQL", "Health checks, alarms on 5xx / p99 / queue age / DLQ", "Backups with a tested restore", "IaC + CI/CD with OIDC, canary or blue/green", "WAF on CloudFront, rate limit on login", "Tags for cost allocation"]],
  ["AI feature launch checklist", ["Scoped IAM on model ARNs; PrivateLink if required", "Guardrail: topics, prompt attacks, PII, grounding", "Evaluation set in CI", "Token usage logged per request and per user", "maxTokens and per-user limits", "Fallback path when the model is slow or throttled"]],
  ["Common interview designs", ["Highly available 3-tier web app", "Serverless REST API with auth", "Image upload and processing pipeline", "Event-driven order processing with a saga", "Multi-Region DR for a database", "RAG assistant over company documents"]],
];

export const materials: [string, [string, string][]][] = [
  ["Official documentation (checked 2026-10-17)", [
    ["IAM policy evaluation logic", "https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html"],
    ["Lambda quotas", "https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html"],
    ["Lambda Web Functions", "https://docs.aws.amazon.com/lambda/latest/dg/web-functions.html"],
    ["SQS message quotas", "https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-messages.html"],
    ["API Gateway quotas", "https://docs.aws.amazon.com/apigateway/latest/developerguide/limits.html"],
    ["S3: uploading objects", "https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html"],
    ["RDS for MySQL versions", "https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/MySQL.Concepts.VersionMgmt.html"],
    ["ECS Express Mode", "https://docs.aws.amazon.com/AmazonECS/latest/developerguide/express-service-overview.html"],
    ["ElastiCache overview", "https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/WhatIs.html"],
    ["AWS Free Tier", "https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/free-tier.html"],
  ]],
  ["AI on AWS", [
    ["Amazon Bedrock user guide", "https://docs.aws.amazon.com/bedrock/latest/userguide/what-is-bedrock.html"],
    ["Converse API", "https://docs.aws.amazon.com/bedrock/latest/userguide/conversation-inference.html"],
    ["Knowledge Base vector stores", "https://docs.aws.amazon.com/bedrock/latest/userguide/knowledge-base-setup.html"],
    ["Amazon Bedrock AgentCore", "https://docs.aws.amazon.com/bedrock-agentcore/latest/devguide/what-is-bedrock-agentcore.html"],
  ]],
  ["Architecture and practice", [
    ["AWS Well-Architected Framework", "https://docs.aws.amazon.com/wellarchitected/latest/framework/welcome.html"],
    ["AWS Architecture Center", "https://aws.amazon.com/architecture/"],
    ["AWS CDK developer guide", "https://docs.aws.amazon.com/cdk/v2/guide/home.html"],
    ["configure-aws-credentials (GitHub OIDC)", "https://github.com/aws-actions/configure-aws-credentials"],
  ]],
];
