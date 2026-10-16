import { bars, compare, flow, lanes, par } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { arch, svc } from "./kit.js";

/* DevOps, observability and cost: IaC, CDK, CI/CD, deployments, CloudWatch, tracing, audit, cost, DR. */

export const ops: ConceptDef[] = [
  {
    t: "Infrastructure as code with CloudFormation",
    lv: 1,
    s: `{{CloudFormation}} turns a {{template}} (YAML/JSON) into a {{stack}} of resources, created in dependency order. Change the template and CloudFormation computes a {{change set}} — what will be added, modified or {{replaced}} — and applies it; if anything fails it {{rolls back}} to the last good state. {{Drift detection}} finds manual console changes. Outputs and exports pass values (a VPC id) between stacks. Because the whole environment is code, dev, staging and prod are identical copies, reviews happen in pull requests, and a destroyed environment can be rebuilt. Terraform and the CDK solve the same problem; the CDK produces CloudFormation underneath.`,
    r: `Always read the change set for "Replacement: True" on databases and buckets; protect stateful resources with {{DeletionPolicy: Retain}} or snapshot policies and termination protection.`,
    i: `What happens if a CloudFormation update fails halfway? How do you avoid accidentally replacing a production database?`,
    v: flow(
      "Template in, change set reviewed, stack updated in order — and rolled back automatically if a step fails.",
      "row",
      ["Template|in Git", "Change set|preview diff|i", "Create / update|in dependency order", "Stack ready|g", "Rollback|last good state|b"],
      [[0, 1], [1, 2, "execute"], [2, 3, "success"], [2, 4, "a resource fails"]],
      [0, 1, 2, 3],
      ["You change the template in a pull request.", "CloudFormation shows exactly what will be added, changed or replaced.", "Resources are created and updated in dependency order (VPC before subnets before database)…", "…and if one fails, the stack returns to its previous working state automatically."],
    ),
  },
  {
    t: "AWS CDK: infrastructure in TypeScript",
    lv: 2,
    s: `The {{AWS Cloud Development Kit}} lets you define infrastructure with real code — TypeScript fits naturally beside a Node/React app. {{Constructs}} come in levels: L1 mirrors CloudFormation one-to-one; L2 adds sensible defaults and helpers ({{bucket.grantRead(role)}} writes the IAM policy for you); L3 {{patterns}} build whole architectures ({{ApplicationLoadBalancedFargateService}}). {{cdk synth}} produces the CloudFormation template, {{cdk diff}} shows changes, {{cdk deploy}} applies them. Loops, functions, types and unit tests work as in any program. Keep stateful resources (database, buckets) in their own stack with retention, and stateless app stacks separately so they can be rebuilt freely.`,
    r: `ShopNest's repository has {{infra/}} with a NetworkStack, DataStack (RDS, buckets) and ApiStack (Fargate service), deployed by CI.`,
    i: `What are L1, L2 and L3 constructs? Why split stateful and stateless stacks?`,
    c: `// infra/lib/api-stack.ts — the ShopNest API on Fargate behind an ALB
import { Stack, type StackProps, Duration } from "aws-cdk-lib";
import * as ecs from "aws-cdk-lib/aws-ecs";
import * as ecsPatterns from "aws-cdk-lib/aws-ecs-patterns";
import type * as ec2 from "aws-cdk-lib/aws-ec2";
import type * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import type { Construct } from "constructs";

interface ApiProps extends StackProps { vpc: ec2.IVpc; dbSecret: secretsmanager.ISecret }

export class ApiStack extends Stack {
  constructor(scope: Construct, id: string, props: ApiProps) {
    super(scope, id, props);
    const svc = new ecsPatterns.ApplicationLoadBalancedFargateService(this, "Api", {
      vpc: props.vpc,
      cpu: 512, memoryLimitMiB: 1024, desiredCount: 2,
      taskImageOptions: {
        image: ecs.ContainerImage.fromAsset("../api"),          // builds and pushes to ECR
        containerPort: 3000,
        secrets: { DB_PASSWORD: ecs.Secret.fromSecretsManager(props.dbSecret, "password") },
      },
      circuitBreaker: { rollback: true },
    });
    svc.targetGroup.configureHealthCheck({ path: "/healthz", interval: Duration.seconds(15) });
    svc.service.autoScaleTaskCount({ minCapacity: 2, maxCapacity: 10 })
      .scaleOnRequestCount("Rps", { requestsPerTarget: 500, targetGroup: svc.targetGroup });
  }
}`,
    v: flow(
      "Write TypeScript, synthesise a template, review the diff, deploy — CloudFormation does the actual work.",
      "row",
      ["CDK app (TS)|constructs", "cdk synth|CloudFormation template", "cdk diff|what changes|i", "cdk deploy|stack update|g"],
      [[0, 1], [1, 2], [2, 3]],
      [0, 1, 2],
      ["{{new ApplicationLoadBalancedFargateService(...)}} — about 20 lines become an ALB, target group, service, roles, log group and security groups.", "{{cdk diff}} compares with the deployed stack: new resources, IAM changes and replacements are highlighted.", "{{cdk deploy}} hands the template to CloudFormation, which applies it with rollback on failure."],
    ),
  },
  {
    t: "CI/CD: from git push to production",
    lv: 1,
    s: `A pipeline turns every merge into a safe release: {{test}} (unit tests, lint, typecheck), {{build}} once (Docker image tagged with the commit SHA, React bundle), {{deploy to staging}}, run smoke/integration tests, {{approve}} (or automatically promote), {{deploy to prod}}, watch alarms and {{roll back}} on errors. Credentials come from OIDC role assumption, never stored keys. On AWS you can build this with GitHub Actions, GitLab CI or {{AWS CodePipeline}} + {{CodeBuild}}; the shape is the same. The same artefact moves through environments — never rebuild for production.`,
    r: `Database migrations run as a separate, backwards-compatible step before the new code, so old and new versions can run side by side during the rollout.`,
    i: `Describe a CI/CD pipeline for a containerised Node API on AWS. Why build once and promote the same image?`,
    v: arch(
      "Build once, promote the same artefact, deploy with short-lived credentials, and let alarms decide whether to roll back.",
      [5, 2],
      [
        svc("gha", 0, 0, "Runs tests, builds the image tagged with the commit SHA, then deploys stage by stage."),
        svc("sts", 1, 1, "OIDC → {{AssumeRoleWithWebIdentity}}: a one-hour session for the deploy role."),
        svc("ecr", 1, 0),
        svc("ecs", 2, 0, "Staging: smoke tests run against it.", { id: "stg", label: "Staging", sub: "ECS service" }),
        svc("ecs", 3, 0, "Production rollout (rolling or blue/green).", { id: "prod", label: "Production", sub: "ECS service" }),
        svc("cw", 4, 0, "Alarms on 5xx rate and p99 latency; an alarm during deploy triggers rollback."),
      ],
      ["gha>sts", ["gha", "ecr", "push :sha"], "ecr>stg", "ecr>prod", "prod>cw"],
      {
        "Release a commit": [
          ["gha", "sts", "The workflow exchanges its OIDC token for the deploy role."],
          ["gha", "ecr", "Tests pass; the image {{shopnest-api:9f3c2e1}} is pushed once."],
          ["ecr", "stg", "Staging runs that exact image; smoke tests hit {{/healthz}} and key endpoints."],
          ["ecr", "prod", "After approval the same image goes to production."],
          ["prod", "cw", "Alarms are watched during the rollout; a breach rolls back to the previous task definition."],
        ],
      },
    ),
  },
  {
    t: "Deployment strategies: rolling, blue/green, canary",
    lv: 2,
    s: `How new code replaces old decides how much a bad release can hurt. {{Rolling}}: replace instances or tasks a few at a time — no extra cost, but old and new serve together and rollback means rolling again. {{Blue/green}}: start a full new copy (green), test it, switch traffic in one step, keep blue for instant rollback — ECS supports this natively and CodeDeploy for EC2/Lambda. {{Canary}} / {{linear}}: send 5–10 % of traffic to the new version, watch error rate and latency, then shift the rest — Lambda aliases, ALB weighted target groups and Lambda Web Function revision weights all do this. {{Feature flags}} go further by decoupling deploy from release.`,
    r: `Automate the decision: an alarm on the canary's error rate should stop and reverse the shift without a human.`,
    i: `Compare rolling, blue/green and canary deployments. Which would you use for a payment service and why?`,
    v: lanes(
      "Canary: a small slice of traffic tests the new version; alarms decide whether the rest follows.",
      10,
      {
        "v1 (current)": [[0, 3, "100 %", "g"], [3, 3, "90 %", "g"], [6, 2, "50 %", "g"], [8, 2, "0 % · kept for rollback", "p"]],
        "v2 (new)": [[3, 3, "10 % canary", "w"], [6, 2, "50 %", "w"], [8, 2, "100 %", "g"]],
        "Alarms": [[3, 7, "5xx and p99 watched", "i"]],
      },
      [[0, "All traffic on v1."], [3, "Deploy v2 and send it 10 % — real users, small blast radius."], [6, "No alarms after the bake time: shift to 50 %."], [8, "Still healthy: 100 % on v2; v1 stays available for a quick rollback."]],
    ),
  },
  {
    t: "CloudWatch: metrics, logs and alarms",
    lv: 1,
    s: `{{Amazon CloudWatch}} collects {{metrics}} from every service (ALB request count and 5xx, ECS CPU, RDS connections, Lambda errors and duration, SQS queue age) and your own custom metrics; {{Logs}} stores stdout from containers and Lambda, searchable with {{Logs Insights}}; {{alarms}} watch a metric against a threshold and notify (SNS → email/Slack/pager) or act (scale, roll back). Log JSON, not free text, with a request id, so one query finds everything about a request. Alarm on symptoms users feel — error rate, latency percentiles, queue age — rather than on every CPU wiggle, and build a dashboard per service.`,
    r: `ShopNest's key alarms: ALB 5xx > 1 % for 5 minutes, p99 latency > 1.5 s, orders queue oldest message > 5 minutes, DLQ not empty, RDS free storage < 10 %.`,
    i: `What would you alarm on for a web API? How do you find all logs for one failing request?`,
    c: `# CloudWatch Logs Insights: slowest API routes in the last hour (JSON logs)
fields @timestamp, route, status, durationMs
| filter status >= 500 or durationMs > 1000
| stats count() as hits, avg(durationMs) as avgMs, pct(durationMs, 99) as p99 by route
| sort p99 desc
| limit 10`,
    v: flow(
      "Metrics and logs flow in; alarms turn symptoms into action — a page, a scale-out or a rollback.",
      "row",
      ["App + services|metrics · JSON logs", "CloudWatch|store · query|i", "Alarm|5xx > 1 % for 5 min|w", "SNS|notify", "On-call / rollback|b"],
      [[0, 1], [1, 2], [2, 3, "ALARM"], [3, 4]],
      [0, 1, 2, 3],
      ["Every service emits metrics; the API writes one JSON log line per request with a request id.", "Logs Insights queries and dashboards answer 'what is slow, what is failing'.", "An alarm evaluates the 5xx rate every minute and changes state after 5 bad data points.", "SNS notifies the on-call channel — or a deployment hook rolls back automatically."],
    ),
  },
  {
    t: "Distributed tracing with X-Ray and OpenTelemetry",
    lv: 2,
    s: `Logs tell you what happened inside one component; a {{trace}} follows one request across all of them. Each hop records a {{span}} (start, duration, status, attributes) tied together by a trace id propagated in headers. The resulting waterfall shows instantly that a slow checkout spent 40 ms in the API and 900 ms waiting for MySQL. On AWS, instrument Node with {{OpenTelemetry}} (the AWS Distro for OpenTelemetry) and send traces to {{AWS X-Ray}} / CloudWatch Application Signals; API Gateway, Lambda and ALB can add their own segments. Sample a percentage of normal traffic and all errors to control cost.`,
    r: `Add the trace id to every log line so you can jump from a slow trace to its logs and back.`,
    i: `What is a span and how is a trace stitched together across services?`,
    v: lanes(
      "The waterfall shows where the time went: most of this checkout is the MySQL query, not the code.",
      12,
      {
        "CloudFront": [[0, 12, "GET /api/checkout · 1.1 s", "p"]],
        "API (Express)": [[0, 11, "POST /checkout", "i"]],
        "Cognito JWT verify": [[0, 1, "8 ms", "g"]],
        "MySQL": [[1, 9, "SELECT … FOR UPDATE · 900 ms", "b"]],
        "SQS SendMessage": [[10, 1, "15 ms", "g"]],
      },
      [[0, "One trace id follows the request from the edge into every service."], [1, "The MySQL span dominates: a missing index on order_items is the real problem."], [10, "Publishing the order event is quick; the fix is in the database, not the API."]],
    ),
  },
  {
    t: "Audit and threat detection: CloudTrail, Config, GuardDuty",
    lv: 2,
    s: `Four services answer different security questions. {{CloudTrail}} records {{every API call}} — who, what, when, from where — and an organization trail sends them to a protected S3 bucket: your audit log and incident-response timeline. {{AWS Config}} records {{resource configuration over time}} and evaluates rules ("S3 buckets must block public access", "RDS must be encrypted"), flagging drift. {{Amazon GuardDuty}} uses threat intelligence and anomaly detection on CloudTrail, VPC flow and DNS logs to spot {{active threats}}: crypto-mining, credentials used from unusual places, reconnaissance. {{Security Hub}} aggregates findings and scores you against standards. Turn them on organization-wide on day one.`,
    r: `An SCP that denies stopping CloudTrail or disabling GuardDuty keeps these controls on even if an account is compromised.`,
    i: `An access key leaked yesterday. Which services tell you what it did, and which would have alerted you?`,
    v: compare(
      "CloudTrail: who did what. Config: how resources are configured. GuardDuty: is someone attacking. Security Hub: the overview.",
      ["Answers", "Example"],
      [
        ["CloudTrail", "Who called which API, when, from where", "{{DeleteBucket}} by role X from IP Y at 03:12"],
        ["AWS Config", "What changed, and is it compliant", "Bucket became public at 03:10 — rule failed"],
        ["GuardDuty", "Is something malicious happening", "Credentials used from a Tor exit node"],
        ["Security Hub", "Overall posture and findings", "Score against AWS Foundational Best Practices"],
      ],
    ),
  },
  {
    t: "Cost: pricing models and optimisation",
    lv: 1,
    s: `AWS bills by usage, so architecture decisions are cost decisions. Levers: {{right-size}} (most instances are oversized — check utilisation), {{turn off}} idle dev environments at night, {{Savings Plans}} (commit to a dollar-per-hour of compute for 1 or 3 years for a large discount; Compute Savings Plans also cover Fargate and Lambda) or Reserved Instances for databases, {{Spot}} for interruptible work (spare capacity at a steep discount, with a 2-minute interruption notice), {{Graviton}} for better price-performance, and storage lifecycle rules. Watch the sneaky ones: NAT gateway data, cross-AZ and internet data transfer, idle public IPv4 addresses, unattached EBS volumes, log retention set to "never expire". Compare Lambda and an always-on Fargate service for ShopNest's API in the calculator (US East list prices on 2026-10-17, x86, no free tier).`,
    r: `Tag everything, review Cost Explorer weekly, use AWS Budgets alerts and Cost Anomaly Detection, and give each team its own cost view.`,
    i: `At what traffic does an always-on container become cheaper than Lambda for an API? What are common hidden costs?`,
    v: bars(
      "Lambda's cost grows with requests × duration × memory; an always-on service costs the same whether busy or idle — the crossover depends on traffic.",
      [["Lambda (USD / month)", "lam"], ["Fargate always-on (USD / month)", "far"]],
      {
        max: 160,
        params: [par("r", "requests per month (millions)", 1, 120, 1, 30), par("d", "average duration (ms)", 20, 1000, 10, 200), par("m", "Lambda memory (GB)", 0.125, 2, 0.125, 0.5), par("t", "Fargate tasks (0.5 vCPU, 1 GB)", 1, 6, 1, 2)],
        defs: [["lam", "r*0.20 + r*1000000*(d/1000)*m*0.0000166667"], ["far", "t*730*(0.5*0.040478 + 1*0.004446)"]],
        readout: ["Lambda: {round(lam)} USD ({r} M requests × {d} ms × {m} GB)", "Fargate: {round(far)} USD for {t} tasks running all month"],
        steps: [["30 M requests at 200 ms, 0.5 GB: Lambda ≈ 56 USD vs 2 Fargate tasks ≈ 36 USD.", { r: 30, d: 200, m: 0.5, t: 2 }], ["A quiet app (3 M requests): Lambda ≈ 6 USD — far below the always-on tasks.", { r: 3 }], ["Faster code (50 ms) cuts Lambda's compute cost by 4×.", { r: 30, d: 50 }]],
      },
    ),
  },
  {
    t: "Backups and disaster recovery",
    lv: 2,
    s: `Two numbers define recovery: {{RPO}} (recovery point objective — how much data you can lose) and {{RTO}} (recovery time objective — how long you can be down). Four standard strategies trade cost for speed. {{Backup & restore}}: backups (AWS Backup, RDS snapshots, S3 replication) copied to another Region; rebuild with IaC — hours. {{Pilot light}}: data continuously replicated, core infrastructure off or minimal — tens of minutes. {{Warm standby}}: a scaled-down full copy running — minutes. {{Multi-site active/active}}: full capacity in two Regions — near zero, highest cost and complexity. Whatever you choose, {{test the restore}}: an untested backup is a hope, not a plan.`,
    r: `ShopNest starts with backup & restore (AWS Backup with cross-Region copy, IaC to rebuild) and moves to pilot light with Aurora Global Database when the business needs a sub-hour RTO.`,
    i: `Define RPO and RTO. Which DR strategy fits RTO 4 hours / RPO 24 hours, and which fits RTO 1 minute?`,
    v: compare(
      "Faster recovery costs more: choose the strategy from the business's RTO and RPO, then rehearse it.",
      ["RPO", "RTO", "Cost"],
      [
        ["Backup & restore", "Hours (last backup)", "Hours", "$"],
        ["Pilot light", "Minutes (replicated data)", "Tens of minutes", "$$"],
        ["Warm standby", "Seconds–minutes", "Minutes", "$$$"],
        ["Multi-site active/active", "Near zero", "Near zero", "$$$$"],
      ],
    ),
  },
];
