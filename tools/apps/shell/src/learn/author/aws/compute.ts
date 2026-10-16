import { compare, flow, layers, seq } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { SALE_DAY, arch, grp, scale, svc } from "./kit.js";

/* Compute: EC2, storage for instances, Auto Scaling, containers, Lambda (event and web functions), hosting React. */

export const compute: ConceptDef[] = [
  {
    t: "EC2: virtual servers",
    lv: 1,
    s: `{{EC2}} rents virtual machines. You pick an {{instance type}} — family + size, e.g. {{t4g.small}} (burstable, ARM Graviton), {{m7i.large}} (general purpose), {{c7g}} (compute), {{r7g}} (memory), {{g}}/{{p}}/{{inf}}/{{trn}} families for GPUs and AI chips — an {{AMI}} (the disk image: Amazon Linux, Ubuntu…), storage, a subnet and security groups. {{User data}} runs a script at first boot (install Node, pull the app, start it with systemd or PM2). Connect with {{Session Manager}} instead of opening SSH to the internet, and require {{IMDSv2}} for the metadata service. EC2 gives maximum control and the most work: you patch the OS, harden it and keep it running.`,
    r: `Graviton (ARM) instances are usually the best price-performance for Node.js; build multi-arch images so you can switch.`,
    i: `How do you choose an instance type? What is user data? Why prefer Session Manager to SSH?`,
    c: `#!/bin/bash
# EC2 user data: runs once at first boot (Amazon Linux 2023)
dnf install -y nodejs git
useradd -m shop
sudo -u shop git clone https://github.com/acme/shopnest-api /home/shop/api
cd /home/shop/api && sudo -u shop npm ci --omit=dev
cat >/etc/systemd/system/shopnest.service <<'EOF'
[Unit]
After=network.target
[Service]
User=shop
WorkingDirectory=/home/shop/api
Environment=PORT=3000 NODE_ENV=production
ExecStart=/usr/bin/node server.js
Restart=always
[Install]
WantedBy=multi-user.target
EOF
systemctl enable --now shopnest`,
    v: layers(
      "On EC2 you own everything above the hypervisor: choose it, configure it, patch it.",
      ["Your Node app|deployed by you: git pull, npm ci, systemd/PM2", "Runtime and packages|Node.js, nginx — you install and update", "Operating system|Amazon Linux / Ubuntu AMI — you patch (or use SSM Patch Manager)", "Instance type|vCPU, memory, network: t4g, m7i, c7g, r7g, GPU families", "Storage and network|EBS volumes, ENI, security groups, subnet", "Hypervisor and hardware|AWS Nitro — AWS's responsibility|i"],
    ),
  },
  {
    t: "EBS, instance store and EFS",
    lv: 2,
    s: `An instance needs disks. {{EBS}} volumes are network block storage that persist independently of the instance, live in {{one AZ}}, can be snapshotted to S3 and resized; {{gp3}} is the general-purpose default (baseline IOPS and throughput you can raise separately from size). {{Instance store}} is physically attached NVMe — very fast but {{wiped}} when the instance stops or fails, fine for caches and scratch space. {{EFS}} is a managed NFS file system shared by many instances across AZs, growing automatically — useful when several servers really need the same files. For a stateless Node API, keep only the OS and app on EBS and put user files in S3.`,
    r: `Design servers to be disposable: anything that must survive goes to S3, RDS or EFS — never only on an instance's disk.`,
    i: `What happens to data on an instance store volume when you stop the instance? When is EFS better than EBS?`,
    v: compare(
      "EBS for an instance's own disk, instance store for fast throwaway data, EFS when many servers share files — and S3 for user content.",
      ["EBS", "Instance store", "EFS"],
      [
        ["Kind", "Block volume (network)", "Local NVMe", "NFS file system"],
        ["Survives stop / failure", "Yes", "No", "Yes"],
        ["Scope", "One AZ, one instance (mostly)", "That instance", "Many instances, many AZs"],
        ["Backups", "Snapshots", "None", "AWS Backup"],
        ["ShopNest use", "Root disk", "Temp image processing", "Rarely — prefer S3"],
      ],
      0,
    ),
  },
  {
    t: "Auto Scaling groups",
    lv: 1,
    s: `An {{Auto Scaling group}} (ASG) keeps a fleet of identical instances (from a {{launch template}}) between a {{minimum}} and {{maximum}}, spread over AZs, registered with the load balancer. If an instance fails its EC2 or ELB health check it is replaced. {{Target tracking}} policies add or remove instances to hold a metric near a target — e.g. average CPU 50 % or requests per target 1,000. New instances need {{warm-up}} time before they help, so scaling always lags a sudden spike; {{scheduled}} and {{predictive}} scaling prepare for known peaks, and a sensible minimum absorbs the first surge. Drag the sliders through ShopNest's flash-sale day.`,
    r: `Scale on a metric that tracks load (requests per target, CPU, queue depth), keep warm-up short with pre-baked AMIs or containers, and schedule extra capacity before planned sales.`,
    i: `A flash sale starts at 12:00 and the site is slow for five minutes before scaling catches up. What would you change?`,
    v: scale(
      "Target tracking follows load, but new capacity arrives only after warm-up: a lower target, a higher minimum or a shorter warm-up is what absorbs a sudden spike.",
      { unit: "instance", capacityPer: 100, target: 60, min: 2, max: 16, warmup: 3, pattern: SALE_DAY },
    ),
  },
  {
    t: "Containers: ECR, ECS and Fargate",
    lv: 1,
    s: `Package the API once as a {{Docker image}} and it runs the same on your laptop, in CI and on AWS. {{ECR}} stores the images. {{ECS}} runs them: a {{task definition}} describes the container (image, CPU/memory, port, environment, secrets from Secrets Manager, log driver, task role); a {{service}} keeps N tasks running behind the ALB, replaces unhealthy ones, scales them, and rolls out new versions with a deployment circuit breaker. With the {{Fargate}} launch type there are no servers to manage — you pay per vCPU and GB of memory per second for each task. ECS on EC2 instances is cheaper at large steady scale but brings back patching and capacity planning.`,
    r: `Tag images with the Git commit SHA, never deploy {{:latest}}, enable ECR image scanning, and pass secrets with {{secrets}} in the task definition — not as plain environment values.`,
    i: `Explain task definition vs task vs service. Fargate or EC2 launch type — how do you decide?`,
    c: `# Dockerfile for the ShopNest API
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
USER node
EXPOSE 3000
CMD ["node", "server.js"]

# Build, push to ECR, deploy (CI does this on every merge)
# aws ecr get-login-password | docker login --username AWS --password-stdin 111122223333.dkr.ecr.eu-west-1.amazonaws.com
# docker build -t shopnest-api:$GIT_SHA . && docker push …/shopnest-api:$GIT_SHA
# aws ecs update-service --cluster shopnest --service api --force-new-deployment`,
    v: arch(
      "CI builds an image once; ECS keeps the desired number of tasks running from it, healthy and behind the load balancer.",
      [5, 3],
      [
        svc("gha", 0, 0),
        svc("ecr", 1, 0, "Holds {{shopnest-api:9f3c2e1}} — one immutable image per commit."),
        svc("alb", 2, 1),
        svc("ecs", 3, 0, "Task 1 (AZ a): 0.5 vCPU, 1 GB, task role {{shopnest-api}}.", { id: "t1", label: "Task 1", sub: "Fargate · AZ a" }),
        svc("ecs", 3, 2, "Task 2 (AZ b). The service keeps the desired count (2) running.", { id: "t2", label: "Task 2", sub: "Fargate · AZ b" }),
        svc("secrets", 4, 1, "The task definition maps {{DB_PASSWORD}} to this secret; ECS injects it at start."),
        svc("cw", 1, 2, "The awslogs driver ships container stdout to CloudWatch Logs."),
      ],
      [["gha", "ecr", "docker push"], "ecr>t1", "ecr>t2", "alb>t1", "alb>t2", "t1>secrets", "t2>secrets", "t1>cw", "t2>cw"],
      {
        "Deploy a new version": [
          ["gha", "ecr", "CI pushes the image tagged with the commit SHA and registers a new task definition revision."],
          ["ecr", "t2", "ECS starts a new task from the new image (rolling update)."],
          ["t2", "secrets", "At start the task receives its secrets and role credentials."],
          ["alb", "t2", "The task passes the ALB health check and starts receiving traffic."],
          ["ecr", "t1", "Only then is an old task replaced. If new tasks keep failing, the circuit breaker rolls back."],
        ],
        "A task crashes": [
          ["alb", "t1", "Task 1's health checks fail.", "bad"],
          ["alb", "t2", "The ALB sends all traffic to task 2."],
          ["ecr", "t1", "ECS notices running < desired and launches a replacement."],
        ],
      },
      [grp("ECS service: api (desired 2)", 3, 0, 1, 3, "private")],
    ),
  },
  {
    t: "ECS Express Mode (and App Runner's status)",
    lv: 2,
    s: `For "here is my container, give me an HTTPS URL", {{ECS Express Mode}} needs only three inputs — a container image, a task execution role and an infrastructure role — and creates the rest with production defaults: a Fargate service, an Application Load Balancer with TLS, auto scaling, monitoring and networking. Everything it creates is ordinary ECS, ALB and CloudWatch in your account, so you can take full control later; there is no extra charge beyond those resources, and services with the same network settings share a load balancer. AWS points new projects here because {{App Runner}} stopped accepting new customers on 30 April 2026 (existing customers can keep using it).`,
    r: `A good path for ShopNest's first container deploy; graduate to a hand-written CDK stack when you need custom networking or deployment strategies.`,
    i: `What does ECS Express Mode create for you, and what do you still own?`,
    v: flow(
      "Three inputs in; a production-shaped Fargate service out — built from standard resources you can inspect and change.",
      "row",
      ["Container image|ECR", "Express service|3 inputs|i", "Fargate tasks|auto scaling|g", "ALB + TLS|HTTPS URL|g", "CloudWatch|logs · metrics"],
      [[0, 1], [1, 2, "creates"], [1, 3, "creates"], [1, 4, "creates"]],
      [0, 1, 2, 3],
      ["You provide an image, a task execution role and an infrastructure role.", "Express Mode creates a Fargate service with scaling policies.", "…an Application Load Balancer with a TLS certificate and a unique URL (shared with other Express services on the same network)…", "…and logs, metrics and networking — all regular resources in your account."],
    ),
  },
  {
    t: "EKS: when Kubernetes is worth it",
    lv: 3,
    s: `{{Amazon EKS}} runs the Kubernetes control plane for you; you run workloads on managed node groups, Fargate, or {{EKS Auto Mode}}, which also manages nodes, scaling and core add-ons. Choose Kubernetes when you need its ecosystem — Helm charts, operators, a platform shared by many teams, portability to other clouds — and have people to run it. For one product team with a few services, ECS is simpler: fewer moving parts, deep AWS integration and no cluster upgrades to schedule. The container image is the same either way, so the decision is about operations, not code.`,
    r: `"We might need Kubernetes later" is not a reason to start with it; the image and the twelve-factor app move across easily.`,
    i: `ECS or EKS for a team of five shipping one web app? What would change your answer?`,
    v: compare(
      "Same containers, different operating model: ECS for simplicity, EKS when you need the Kubernetes ecosystem and can run it.",
      ["ECS", "EKS"],
      [
        ["Concepts to learn", "Task, service, cluster", "Pods, deployments, services, ingress, RBAC, CRDs…"],
        ["Control plane", "Free, invisible", "Managed, billed per cluster hour"],
        ["Upgrades", "None to plan", "Kubernetes versions every few months"],
        ["Ecosystem", "AWS-native", "Helm, operators, CNCF tools, multi-cloud"],
        ["Fits", "Most product teams", "Platform teams, many services, portability"],
      ],
      0,
    ),
  },
  {
    t: "Lambda event functions",
    lv: 1,
    s: `{{AWS Lambda}} runs a handler in response to events — an API Gateway request, an SQS message, an S3 upload, an EventBridge schedule. You pay per request plus GB-seconds of run time; it scales by creating more {{execution environments}}, each serving one request at a time. Limits shape designs: up to {{15 minutes}} per invocation, 128 MB–10,240 MB of memory (CPU grows with memory; 1,769 MB ≈ one vCPU), payloads of 6 MB synchronous and 1 MB asynchronous, 1,000 concurrent executions per Region by default. Code outside the handler runs once per environment — create SDK clients and DB pools there. A {{cold start}} is the first request on a new environment, paying for start-up.`,
    r: `Lambda is ideal for spiky and event-driven glue (thumbnails, webhooks, queue workers, cron jobs); long-running or steady high-throughput servers usually fit containers better.`,
    i: `What happens on a cold start, and how do you reduce its impact? Why initialise clients outside the handler?`,
    c: `// resize.mjs — runs when a product photo lands in s3://shopnest-images/uploads/
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import sharp from "sharp";

const s3 = new S3Client({});              // created once per execution environment

export const handler = async (event) => {
  for (const rec of event.Records) {
    const Bucket = rec.s3.bucket.name;
    const Key = decodeURIComponent(rec.s3.object.key.replace(/\\+/g, " "));
    const img = await s3.send(new GetObjectCommand({ Bucket, Key }));
    const thumb = await sharp(Buffer.from(await img.Body.transformToByteArray())).resize(400).webp().toBuffer();
    await s3.send(new PutObjectCommand({ Bucket, Key: Key.replace("uploads/", "thumbs/") + ".webp", Body: thumb, ContentType: "image/webp" }));
  }
};`,
    v: seq(
      "An event triggers the handler; the first call on a new environment pays the cold start, later calls reuse clients and connections.",
      ["S3 upload", "Lambda service", "Execution env", "S3 thumbs/"],
      [
        [0, 1, "ObjectCreated event", "A shopper's photo arrives in {{uploads/}}."],
        [1, 2, "cold start: download code, start Node, run module code", "Init runs once: imports, {{new S3Client()}}."],
        [1, 2, "invoke handler(event)", "The handler reads the image and resizes it."],
        [2, 3, "PutObject thumbs/…webp", ""],
        [1, 2, "next upload → warm invoke", "The environment is reused: no init, just the handler."],
      ],
    ),
  },
  {
    t: "Lambda Web Functions: Express without adapters",
    lv: 2,
    s: `{{Lambda Web Functions}} run a normal Node.js HTTP server — Express, Fastify, Next.js — on Lambda with no event adapter. Your server listens on the host:port in {{AWS_LAMBDA_HTTP_ENDPOINT}}; Lambda gives each {{endpoint}} an HTTPS domain, terminates TLS, and scales {{execution environments}} that each serve many concurrent requests (default up to 64), including down to zero when idle. Each code or config change creates an immutable {{revision}}; an endpoint can split traffic between two revisions for canary or blue/green releases. Billing is per request, active CPU time and memory over each environment's life. Today they support Node.js only ({{nodejs24.x}}), with 2 GB memory per environment and a default 30-second request timeout (up to 15 minutes). For a custom domain or WAF, put CloudFront in front.`,
    r: `A strong fit for ShopNest's API when traffic is uneven and you want no servers — remember the app must be safe for concurrent requests in one process (no per-request globals).`,
    i: `How does a Lambda Web Function differ from a Lambda event function behind API Gateway? What does "multiple concurrent requests per environment" change for your code?`,
    c: `// index.js — the ShopNest Express API, unchanged except for the listen address
import express from "express";
import { router } from "./routes.js";

const app = express();
app.use(express.json());
app.use("/api", router);
app.get("/healthz", (_req, res) => res.send("ok"));

// Lambda tells the server where to listen; locally it falls back to :3000
const [host, port] = (process.env.AWS_LAMBDA_HTTP_ENDPOINT || "localhost:3000").split(":");
app.listen(port, host);`,
    v: arch(
      "Your Express server runs as-is: Lambda provides HTTPS, scales environments that each take many concurrent requests, and shifts traffic between revisions.",
      [5, 3],
      [
        svc("user", 0, 1),
        svc("cf", 1, 1, "Optional: custom domain, WAF and caching in front of the Web Function endpoint."),
        svc("webfn", 2, 1, "The endpoint: HTTPS domain, auth type (IAM or application-managed), rate limit and max environments. Here 90 % → revision 7, 10 % → revision 8.", { label: "Endpoint prod", sub: "90 / 10 split" }),
        svc("webfn", 3, 0, "Revision 7: the current release. Each environment runs your Express server and handles up to 64 requests at once.", { id: "r7", label: "Revision 7", sub: "90 %" }),
        svc("webfn", 3, 2, "Revision 8: the canary. If errors rise, set its weight back to 0 — rollback is a routing change.", { id: "r8", label: "Revision 8", sub: "10 % canary" }),
        svc("rds", 4, 1, "Connect through an egress network connector to reach RDS in your VPC, and cap environments so the DB is not flooded."),
      ],
      ["user>cf", "cf>webfn", "webfn>r7", "webfn>r8", "r7>rds", "r8>rds"],
      {
        "Canary release": [
          ["user", "cf", "Requests arrive at the custom domain."],
          ["cf", "webfn", "CloudFront forwards to the Web Function endpoint."],
          ["webfn", "r7", "9 of 10 requests go to revision 7…"],
          ["webfn", "r8", "…1 in 10 to the new revision 8. Watch errors and latency, then move to 100 %."],
          ["r8", "rds", "Both revisions share the database — schema changes must stay backwards compatible."],
        ],
      },
    ),
  },
  {
    t: "Hosting the React app",
    lv: 1,
    s: `A React build is just static files, so it needs no server. Two good options. {{S3 + CloudFront}}: upload {{dist/}} to a private bucket, serve it through CloudFront with Origin Access Control, long cache headers on hashed assets, and a rule that answers unknown paths with {{index.html}} for client-side routing. {{Amplify Hosting}}: connect the Git repository and it builds on each push, deploys to a CDN, gives preview URLs per branch or pull request, and handles SPA rewrites and custom domains. Next.js or other server-rendered apps need compute — Amplify supports SSR, or run the server on a Web Function or containers. Either way the API sits on the same domain under {{/api}} (CloudFront path) or on {{api.shopnest.example}} with CORS.`,
    r: `Teams wanting full control and one CloudFront for site + API pick S3 + CloudFront in CDK; teams wanting zero-config previews pick Amplify Hosting.`,
    i: `How do you deploy a React SPA on AWS so deep links like /orders/42 work and users get new versions after deploys?`,
    v: compare(
      "Static React needs no servers: S3 + CloudFront for control, Amplify Hosting for convenience and previews.",
      ["S3 + CloudFront", "Amplify Hosting"],
      [
        ["Build", "Your CI ({{npm run build}})", "Amplify builds on push"],
        ["Preview per PR", "Build it yourself", "Built in"],
        ["SPA deep links", "Custom error response / function → index.html", "Rewrite rule"],
        ["API on same domain", "Second origin {{/api/*}}", "Rewrite / proxy to API"],
        ["Control", "Full (cache, headers, WAF)", "Less, but simpler"],
      ],
    ),
  },
  {
    t: "Choosing compute for each piece",
    lv: 2,
    s: `There is no single best compute service — match it to the workload. {{EC2}}: full control, special software, licensed or long-lived stateful processes. {{ECS/Fargate}}: containerised web APIs and workers with steady traffic; no servers. {{Lambda Web Functions}}: HTTP apps with uneven traffic that should scale to zero. {{Lambda event functions}}: glue, events, queues, schedules, anything short and spiky. {{EKS}}: a Kubernetes platform. ShopNest in its final form mixes them: React on S3 + CloudFront, the API on Fargate (or a Web Function), image resizing and order emails on Lambda, nightly reports on a scheduled task.`,
    r: `Decide per component using traffic shape, run time, operational effort the team can afford, and cost at expected volume.`,
    i: `Given a steady 500 req/s API, a nightly 2-hour batch job, and an S3-upload thumbnail generator, which compute would you choose for each and why?`,
    v: compare(
      "Pick per workload: control (EC2), containers (Fargate), HTTP that scales to zero (Web Functions), events (Lambda).",
      ["EC2", "Fargate", "Lambda Web Fn", "Lambda event fn"],
      [
        ["You manage", "OS, scaling, patching", "Image + task size", "Code + endpoint config", "Code + triggers"],
        ["Max run time", "Unlimited", "Unlimited", "15 min per request", "15 min per call"],
        ["Scale to zero", "No", "No (min 1 task)", "Yes", "Yes"],
        ["Billing", "Per second, running", "Per vCPU/GB second", "Requests + CPU + memory", "Requests + GB-seconds"],
        ["ShopNest piece", "Legacy v1", "API (steady)", "API (spiky)", "Thumbnails, emails, cron"],
      ],
    ),
  },
];
