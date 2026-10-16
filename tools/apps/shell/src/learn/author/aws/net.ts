import { compare, flow } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { arch, cidr, grp, svc } from "./kit.js";

/* Networking and delivery: VPC, subnets, gateways, firewalls, endpoints, load balancers, DNS, CDN, WAF. */

export const net: ConceptDef[] = [
  {
    t: "VPC and CIDR planning",
    lv: 1,
    s: `A {{VPC}} (virtual private cloud) is your private network in a Region, defined by an IPv4 range in {{CIDR}} notation: {{10.0.0.0/16}} means the first 16 bits are fixed, leaving 2^16 = 65,536 addresses. AWS allows VPC blocks from {{/16}} down to {{/28}}. You carve the VPC into {{subnets}}, each living in exactly {{one}} Availability Zone; a standard layout has one subnet per {{tier}} (public, app, data) per AZ. AWS reserves {{5 addresses}} in every subnet (network, router, DNS, one for future use, broadcast), so a /24 gives 251 usable. Plan for growth — and pick a range that will not overlap your office network or other VPCs you may connect later.`,
    r: `A /16 with /20 or /24 subnets across three AZs is a common, roomy default; containers and Lambda in a VPC each take IP addresses, so do not go too small.`,
    i: `How many usable IPs are in a /26 subnet on AWS? Why must VPC ranges not overlap?`,
    v: cidr(
      "Pick a VPC range with room to grow; one subnet per tier per AZ; 5 addresses per subnet belong to AWS.",
      { base: "10.0.0.0", vpcPrefix: 16, subnetPrefix: 24, azs: 2, tiers: ["Public", "App (private)", "Data (private)"] },
    ),
  },
  {
    t: "Public and private subnets, route tables",
    lv: 1,
    s: `What makes a subnet {{public}} is only its {{route table}}: a route {{0.0.0.0/0 → internet gateway}}. Resources there can have public IPs and be reached from the internet — that is where the {{load balancer}} and NAT gateways live. {{Private}} subnets have no such route: the Node API and the MySQL database sit there, reachable only from inside the VPC. Private subnets that need outbound internet (npm installs, a payment API) route {{0.0.0.0/0 → NAT gateway}}. Every route table also has the implicit {{local}} route, so all subnets in the VPC can talk to each other — security groups then decide who actually may.`,
    r: `Nothing except load balancers (and maybe a bastion, better replaced by Session Manager) should sit in a public subnet.`,
    i: `What exactly makes a subnet public? Can an instance in a private subnet download packages from the internet?`,
    c: `// AWS CDK: a VPC with public + private subnets in 2 AZs and one NAT gateway
import * as ec2 from "aws-cdk-lib/aws-ec2";

const vpc = new ec2.Vpc(this, "ShopnestVpc", {
  ipAddresses: ec2.IpAddresses.cidr("10.0.0.0/16"),
  maxAzs: 2,
  natGateways: 1,                       // 1 to save cost in dev; one per AZ in prod
  subnetConfiguration: [
    { name: "public", subnetType: ec2.SubnetType.PUBLIC, cidrMask: 24 },
    { name: "app", subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS, cidrMask: 24 },
    { name: "data", subnetType: ec2.SubnetType.PRIVATE_ISOLATED, cidrMask: 24 },
  ],
});`,
    v: arch(
      "Public means 'has a route to the internet gateway'; the API and database live in private subnets and go out, if at all, through NAT.",
      [5, 3],
      [
        svc("user", 0, 1),
        svc("igw", 1, 1),
        svc("alb", 2, 0, "The only thing shoppers can reach: it sits in the public subnets of both AZs."),
        svc("nat", 2, 2, "In a public subnet; private subnets send their internet-bound traffic here."),
        svc("ec2", 3, 1, "The API instances: private IPs only, no route from the internet.", { label: "Node API", sub: "private · app" }),
        svc("rds", 4, 1, "Data tier: an isolated subnet with no internet route at all.", { sub: "private · data" }),
      ],
      ["user>igw", "igw>alb", "alb>ec2", "ec2>rds", ["ec2", "nat", "0.0.0.0/0"], "nat>igw"],
      {
        "Shopper request": [
          ["user", "igw", "Traffic enters the VPC through the internet gateway."],
          ["igw", "alb", "Only the load balancer's public subnet routes to the IGW."],
          ["alb", "ec2", "The ALB forwards to the API's private IP (local route)."],
          ["ec2", "rds", "The API reaches MySQL inside the VPC."],
        ],
        "API calls Stripe": [
          ["ec2", "nat", "The private route table sends {{0.0.0.0/0}} to the NAT gateway."],
          ["nat", "igw", "NAT swaps in its own public IP and goes out through the IGW."],
          ["igw", "nat", "The reply returns to the NAT gateway, which tracks the connection…"],
          ["nat", "ec2", "…and hands it back to the API. Nobody outside can start a connection inward."],
        ],
      },
      [grp("VPC 10.0.0.0/16", 1, 0, 4, 3, "vpc"), grp("public", 2, 0, 1, 3, "public"), grp("private", 3, 0, 2, 3, "private")],
    ),
  },
  {
    t: "Internet gateway vs NAT gateway",
    lv: 1,
    s: `An {{internet gateway}} is a free, horizontally scaled VPC component that allows {{both directions}} for resources with public IPs. A {{NAT gateway}} gives private resources {{outbound only}} internet: connections they start go out with the NAT's Elastic IP; connections from outside cannot start inward. NAT gateways are zonal and billed per hour and per GB processed — for many small apps they are a top surprise on the bill. Put one per AZ in production (so an AZ failure does not cut outbound traffic), and avoid sending AWS-service traffic (S3, DynamoDB, ECR, Secrets Manager) through NAT at all: use VPC endpoints.`,
    r: `Check "NAT Gateway Bytes" in Cost Explorer: image pulls and S3 traffic through NAT are classic avoidable spend.`,
    i: `Why can't the internet reach an instance behind a NAT gateway? What does a NAT gateway cost you and how do you reduce it?`,
    v: compare(
      "IGW = public two-way door; NAT = private, outbound-only, metered by the hour and the gigabyte.",
      ["Internet gateway", "NAT gateway"],
      [
        ["Direction", "In and out", "Out only (replies come back)"],
        ["Used by", "Public subnets (ALB, NAT itself)", "Private subnets"],
        ["Scaling / AZ", "Regional, managed", "One per AZ for high availability"],
        ["Price", "No charge for the gateway", "Per hour + per GB processed"],
        ["Avoid for AWS services", "—", "Use gateway / interface endpoints"],
      ],
    ),
  },
  {
    t: "Security groups vs network ACLs",
    lv: 1,
    s: `{{Security groups}} are stateful firewalls on each network interface (instance, task, database, load balancer). They contain {{allow}} rules only, and return traffic is allowed automatically. Their superpower is {{referencing other security groups}}: "the database SG allows 3306 from the API SG" — no IP addresses to maintain as instances come and go. {{Network ACLs}} are stateless filters on a whole subnet: numbered rules, {{allow and deny}}, evaluated in order, and you must allow return traffic (ephemeral ports) explicitly. Day to day you design with security groups; NACLs are a coarse extra layer, for example to block an abusive IP range.`,
    r: `ShopNest chain: ALB-SG allows 443 from anywhere → API-SG allows 3000 from ALB-SG → DB-SG allows 3306 from API-SG.`,
    i: `Stateful vs stateless firewall — what does it mean in practice? How would you allow only the API to reach MySQL?`,
    c: `# Database security group: MySQL only from the API security group (no CIDRs)
aws ec2 authorize-security-group-ingress \\
  --group-id sg-0db1111111 \\
  --protocol tcp --port 3306 \\
  --source-group sg-0api222222`,
    v: compare(
      "Security groups: stateful, allow-only, chain them by reference. NACLs: stateless, ordered, subnet-wide.",
      ["Security group", "Network ACL"],
      [
        ["Attached to", "Network interface (instance, task, DB, ALB)", "Subnet"],
        ["Rules", "Allow only", "Allow and deny, numbered order"],
        ["State", "Stateful: replies allowed automatically", "Stateless: allow return ports too"],
        ["Sources", "CIDRs or other security groups", "CIDRs only"],
        ["Typical use", "Primary access control", "Coarse subnet guard, block IP ranges"],
      ],
      0,
    ),
  },
  {
    t: "VPC endpoints: reach AWS services privately",
    lv: 2,
    s: `By default, calls from private subnets to S3, Secrets Manager or Bedrock leave through the NAT gateway to public endpoints. {{VPC endpoints}} keep that traffic on the AWS network. {{Gateway endpoints}} exist for {{S3}} and {{DynamoDB}}: a route-table entry, no hourly charge. {{Interface endpoints}} (AWS PrivateLink) put an elastic network interface with a private IP in your subnets for most other services — ECR, CloudWatch Logs, Secrets Manager, SQS, Bedrock — billed per hour per AZ and per GB. Endpoint policies and bucket policies with {{aws:SourceVpce}} can then require that data is only reachable from inside your VPC.`,
    r: `Fargate tasks in private subnets with no NAT need interface endpoints for ECR (api + dkr), CloudWatch Logs and Secrets Manager, plus the S3 gateway endpoint for image layers.`,
    i: `Gateway vs interface endpoint — which services and what does each cost? How can a bucket be restricted to one VPC?`,
    v: arch(
      "Endpoints keep AWS-service traffic private and off the NAT bill; gateway endpoints for S3 and DynamoDB are free.",
      [4, 3],
      [
        svc("ecs", 0, 1, "API tasks in a private subnet."),
        svc("vpce", 1, 0, "Gateway endpoint: a route-table entry for S3's prefix list. No hourly charge.", { id: "gw", label: "Gateway endpt", sub: "S3 · free" }),
        svc("vpce", 1, 2, "Interface endpoint: a private IP in your subnet that resolves the Secrets Manager hostname.", { id: "if", label: "Interface endpt", sub: "PrivateLink" }),
        svc("nat", 2, 1, "Without endpoints, all of this traffic would cross the NAT gateway and be billed per GB."),
        svc("s3", 3, 0),
        svc("secrets", 3, 2),
      ],
      ["ecs>gw", "gw>s3", "ecs>if", "if>secrets", ["ecs", "nat", "no longer needed"]],
      {
        "With endpoints": [
          ["ecs", "gw", "{{GetObject}} to S3 matches the route to the gateway endpoint."],
          ["gw", "s3", "The traffic stays on the AWS network — no NAT, no internet."],
          ["ecs", "if", "The Secrets Manager hostname resolves to the endpoint's private IP."],
          ["if", "secrets", "PrivateLink carries the call to the service."],
        ],
        "Without endpoints": [
          ["ecs", "nat", "Every S3 and Secrets Manager call goes out through NAT…", "bad"],
          ["nat", "s3", "…to the public endpoint, paying NAT processing per GB.", "bad"],
        ],
      },
      [grp("private subnet", 0, 0, 2, 3, "private")],
    ),
  },
  {
    t: "Load balancers: ALB vs NLB",
    lv: 1,
    s: `A load balancer gives one stable entry point, spreads traffic over healthy targets in several AZs, and lets targets come and go. The {{Application Load Balancer}} works at HTTP level (layer 7): HTTPS termination with free ACM certificates, routing by path ({{/api/*}}) or host, redirects, sticky sessions, WebSockets, authentication with Cognito, and per-target {{health checks}} ({{GET /healthz}}). The {{Network Load Balancer}} works at TCP/UDP level (layer 4): millions of requests per second, ultra-low latency, {{static IPs}} per AZ, and preserved client IP — for non-HTTP protocols or when partners need fixed IPs. ShopNest's API uses an ALB.`,
    r: `Health checks should test the app, not just the process — but not the database on every call, or one slow DB marks every target unhealthy at once.`,
    i: `When would you choose an NLB over an ALB? What happens when a target fails its health check?`,
    v: compare(
      "HTTP apps use an ALB; raw TCP/UDP, static IPs or extreme throughput call for an NLB.",
      ["ALB", "NLB"],
      [
        ["Layer", "7 — HTTP/HTTPS, gRPC, WebSocket", "4 — TCP, UDP, TLS"],
        ["Routing", "Path, host, headers, query", "Port only"],
        ["IP addresses", "Changing (use DNS name)", "Static per AZ (Elastic IP optional)"],
        ["Extras", "Redirects, Cognito auth, WAF", "Client IP preserved, PrivateLink services"],
        ["ShopNest", "{{/api/*}} → API targets", "Not needed"],
      ],
      0,
    ),
  },
  {
    t: "Route 53: DNS and routing policies",
    lv: 2,
    s: `{{Route 53}} hosts your DNS zone ({{shopnest.example}}) and answers lookups worldwide. {{Alias records}} point a name at AWS resources (CloudFront, ALB, S3 website) for free and follow their IP changes. Its {{routing policies}} turn DNS into traffic control: {{simple}}; {{weighted}} (send 10 % to the new stack); {{latency-based}} (the Region closest in latency); {{failover}} (primary unless its health check fails); {{geolocation}} / {{geoproximity}} (by user location); {{multivalue}} (several healthy IPs). Health checks make failover automatic, but clients cache answers for the record's {{TTL}}, so failover is never instant.`,
    r: `Weighted records are a simple way to canary a new stack; keep TTLs short (e.g. 60 s) on records you may need to fail over.`,
    i: `How would you route users to the closest of two Regions and fail over if one is down? Why does a DNS change not take effect immediately?`,
    v: flow(
      "DNS can steer traffic by weight, latency, location or health — limited by how long clients cache the answer.",
      "row",
      ["Browser|shopnest.example?", "Route 53|latency policy|i", "eu-west-1 ALB|healthy|g", "us-east-1 ALB|healthy|g"],
      [[0, 1, "query"], [1, 2, "closest for EU users"], [1, 3, "closest for US users"]],
      [0, 1, 2],
      ["The browser's resolver asks Route 53 for shopnest.example.", "A user in Paris gets the Ireland ALB: lowest measured latency.", "A user in Boston gets N. Virginia. If its health check failed, Route 53 would answer with Ireland instead."],
    ),
  },
  {
    t: "CloudFront: the CDN in front of everything",
    lv: 1,
    s: `{{CloudFront}} serves content from edge locations near users. For ShopNest it fronts two {{origins}}: the S3 bucket with the React build and images, and the ALB for {{/api/*}}. {{Cache behaviours}} decide per path what is cached and for how long: hashed JS/CSS files for a year, {{index.html}} briefly, API responses usually not at all. The bucket stays {{private}}: CloudFront reads it with {{Origin Access Control}} (OAC), so S3 is never publicly exposed. CloudFront also terminates TLS close to the user, compresses responses, supports HTTP/2 and HTTP/3, and is where AWS WAF and Shield sit. After a deploy, either rely on versioned filenames or create an {{invalidation}} for {{/index.html}}.`,
    r: `Single-page apps need a custom error response (or function) that serves {{/index.html}} for unknown paths so client-side routes like {{/orders/42}} work on refresh.`,
    i: `How do you host a React SPA on S3 + CloudFront securely? How do you make sure users get the new version after a deploy?`,
    c: `# Deploy the React build: long cache for hashed assets, no-cache for index.html
npm run build
aws s3 sync dist/ s3://shopnest-web/ --delete \\
  --cache-control "public,max-age=31536000,immutable" --exclude index.html
aws s3 cp dist/index.html s3://shopnest-web/index.html --cache-control "no-cache"
aws cloudfront create-invalidation --distribution-id E123ABC --paths "/index.html"`,
    v: arch(
      "One distribution, two origins: cached static files from a private bucket, uncached API calls to the load balancer.",
      [4, 2],
      [
        svc("user", 0, 0),
        svc("cf", 1, 0, "Behaviours: {{/assets/*}} cached 1 year; {{/index.html}} no-cache; {{/api/*}} forwarded with no caching, all headers and cookies."),
        svc("s3", 2, 0, "Private bucket; the bucket policy allows only this distribution via Origin Access Control.", { label: "S3 web bucket", sub: "private · OAC" }),
        svc("alb", 2, 1, "API origin: CloudFront forwards {{/api/*}} here."),
        svc("ecs", 3, 1, undefined, { label: "Node API", sub: "containers" }),
      ],
      ["user>cf", ["cf", "s3", "/assets/*"], ["cf", "alb", "/api/*"], "alb>ecs"],
      {
        "First visit (cache miss)": [
          ["user", "cf", "GET {{/assets/app.3f9c.js}} reaches the nearest edge."],
          ["cf", "s3", "Not in this edge's cache: fetch from the bucket (signed with OAC)."],
          ["s3", "cf", "The file is stored at the edge for a year (the name changes on every build)."],
          ["cf", "user", "Delivered — the next shopper nearby gets it straight from the edge."],
        ],
        "API call": [
          ["user", "cf", "GET {{/api/products}} — same domain, so no CORS needed."],
          ["cf", "alb", "The {{/api/*}} behaviour does not cache; it forwards to the ALB."],
          ["alb", "ecs", "The API answers from MySQL."],
          ["cf", "user", "TLS ended at the edge, so even uncached calls get faster connection set-up."],
        ],
      },
    ),
  },
  {
    t: "AWS WAF and Shield",
    lv: 2,
    s: `{{AWS WAF}} is a web application firewall you attach to CloudFront, an ALB, API Gateway or Cognito. A {{web ACL}} holds rules: {{AWS managed rule groups}} (common exploits, known bad inputs, SQL injection, bad IP reputation, bot control), your own match rules, and {{rate-based rules}} that block an IP sending too many requests (great for login and checkout endpoints). Start rules in {{count}} mode, watch the logs, then switch to block. {{AWS Shield Standard}} protects every customer from common network and transport-layer DDoS at no cost; {{Shield Advanced}} adds paid protection, cost protection and a response team for high-risk sites.`,
    r: `ShopNest attaches one web ACL to CloudFront: managed core rules, SQLi rules, and a rate limit on {{/api/login}}.`,
    i: `How would you protect a login endpoint from credential stuffing on AWS? What is the difference between WAF and Shield?`,
    v: flow(
      "Requests are inspected at the edge: managed rules, rate limits and your own rules run before anything reaches your servers.",
      "row",
      ["Request|from internet", "Shield|L3/L4 DDoS|i", "WAF web ACL|rules in order", "CloudFront|cache / origin|g", "Blocked|403|b"],
      [[0, 1], [1, 2], [2, 3, "allowed"], [2, 4, "SQLi / rate limit"]],
      [0, 1, 2, 3],
      ["Every request passes Shield's always-on network protection first.", "The web ACL evaluates rules in priority order: managed rule groups, rate-based rules, your custom rules.", "Clean requests continue to CloudFront and the origin.", "A rule match ends the request with a 403 — the API never sees it, and the WAF log shows which rule fired."],
    ),
  },
];
