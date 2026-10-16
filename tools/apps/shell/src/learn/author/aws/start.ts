import { compare, flow, layers } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { arch, grp, svc } from "./kit.js";

/* Start here: what the cloud changes, how AWS is laid out, and the app we build all track long. */

export const start: ConceptDef[] = [
  {
    t: "Meet ShopNest: the app we put on AWS",
    lv: 1,
    s: `Every idea in this track is applied to one ordinary product: {{ShopNest}}, a small online shop. The front end is a {{React}} single-page app; the back end is a {{Node.js}} (Express) REST API; the data lives in {{MySQL}} (products, users, orders). Locally it runs on your laptop with {{npm run dev}}, {{node server.js}} and MySQL in Docker. Through the track the same app moves to AWS step by step — one server, then a highly available three-tier design, containers, serverless, event-driven orders, and finally AI features (a product assistant that answers from the catalogue, invoice reading, image moderation). Seeing one app evolve makes it obvious {{why}} each service exists.`,
    r: `Most real AWS work is exactly this: an existing web app whose pieces get mapped to managed services one at a time, not a green-field design.`,
    i: `Walk me through how you would deploy a React + Node + MySQL app on AWS, and how the design changes as traffic grows.`,
    c: `// server.js — the ShopNest API as it runs on your laptop
import express from "express";
import mysql from "mysql2/promise";

const db = mysql.createPool({
  host: process.env.DB_HOST ?? "localhost",
  user: process.env.DB_USER ?? "shop",
  password: process.env.DB_PASSWORD,      // on AWS this comes from Secrets Manager
  database: "shopnest",
  connectionLimit: 10,
});

const app = express();
app.use(express.json());

app.get("/api/products", async (_req, res) => {
  const [rows] = await db.query("SELECT id, name, price_cents FROM products ORDER BY id LIMIT 50");
  res.json(rows);
});

app.get("/healthz", (_req, res) => res.send("ok"));     // load balancers will call this
app.listen(process.env.PORT ?? 3000);`,
    v: arch(
      "Three pieces — React in the browser, a Node API, MySQL — and every AWS design in this track is a way of hosting, securing and scaling these three.",
      [5, 2],
      [
        svc("user", 0, 0),
        svc("react", 1, 0, "Built with Vite: {{npm run build}} produces static files in {{dist/}}. On AWS they will live in S3 behind CloudFront."),
        svc("dev", 2, 1, "Your laptop runs everything today. The goal of this track: nothing important should depend on it."),
        svc("ec2", 2, 0, "Locally this is just {{node server.js}} on port 3000. On AWS it becomes EC2, containers or Lambda.", { label: "Node API", sub: "Express :3000" }),
        svc("rds", 3, 0, "Locally MySQL in Docker. On AWS: RDS for MySQL (or Aurora) — managed backups, patching and failover.", { label: "MySQL", sub: "orders · products" }),
        svc("s3", 4, 0, "Product photos. Locally a folder; on AWS an S3 bucket with presigned uploads.", { label: "Images", sub: "files" }),
      ],
      ["user>react", ["react", "ec2", "fetch /api"], ["ec2", "rds", "SQL"], "ec2>s3"],
      {
        "Load the product list": [
          ["user", "react", "The shopper opens ShopNest; the browser downloads the React bundle."],
          ["react", "ec2", "React calls {{GET /api/products}} on the Node API."],
          ["ec2", "rds", "Express runs {{SELECT … FROM products}} through a connection pool."],
          ["rds", "ec2", "Rows come back; Express returns JSON."],
          ["ec2", "react", "React renders the product grid. Everything you will build on AWS keeps this same request shape."],
        ],
      },
    ),
  },
  {
    t: "What the cloud really changes",
    lv: 1,
    s: `On-premises you buy servers for your {{peak}} and own them for years. In the cloud you rent capacity by the second and give it back: {{elasticity}} replaces capacity planning, {{pay-as-you-go}} replaces up-front spend (capex becomes opex), and {{managed services}} replace work you used to do yourself — patching MySQL, replacing disks, building load balancers. The trade is control and predictability of the bill for speed and less undifferentiated work. The cloud does not remove architecture work; it moves it from hardware to design: choosing services, wiring permissions, and paying attention to cost.`,
    r: `The fastest teams lean on managed services (RDS, Fargate, Lambda, S3) and spend their own time only on what makes the product different.`,
    i: `What are the main benefits of the cloud, and what new risks does it bring (cost surprises, misconfiguration, lock-in)?`,
    v: compare(
      "You trade owning hardware for renting capacity and buying managed work — and you take on new responsibilities: permissions, configuration and cost.",
      ["Own data centre", "AWS"],
      [
        ["Capacity", "Buy for the peak, idle the rest of the year", "Add and remove in minutes; pay for what runs"],
        ["Money", "Large up-front purchase (capex)", "Monthly bill per use (opex)"],
        ["Time to a new server", "Weeks (order, rack, cable)", "Seconds to minutes"],
        ["Database ops", "You patch, back up, fail over", "RDS does it; you design and tune"],
        ["Global reach", "Build another site", "Pick another Region"],
        ["New risks", "Hardware failure", "Open buckets, broad IAM, surprise bills"],
      ],
      1,
    ),
  },
  {
    t: "Regions, Availability Zones and edge locations",
    lv: 1,
    s: `AWS is split into {{Regions}} (for example {{eu-west-1}} Ireland, {{us-east-1}} N. Virginia, {{ap-south-1}} Mumbai). Each Region holds several {{Availability Zones}} — separate data centres with their own power and networking, a few kilometres apart and joined by fast links. Your data stays in the Region you choose. High availability means spreading copies across {{at least two AZs}}: one AZ can fail and the app keeps running. {{Edge locations}} are a third, much larger set of sites used by CloudFront and Route 53 to sit close to users. Pick a Region by latency to users, data-residency rules, service availability and price.`,
    r: `Production databases and API servers span two or three AZs from day one; a second Region is a business decision for disaster recovery or global latency.`,
    i: `What is the difference between a Region, an AZ and an edge location? How would you make an app survive the loss of one AZ?`,
    v: arch(
      "Spread across AZs for availability, choose the Region for latency and law, and let edge locations bring cached content close to users.",
      [5, 3],
      [
        svc("user", 0, 1),
        svc("cf", 1, 1, "An edge location near the shopper serves cached React files in milliseconds; only cache misses travel to the Region."),
        svc("alb", 2, 1, "The load balancer lives in several AZs at once and only sends traffic to healthy targets."),
        svc("ec2", 3, 0, "API server in AZ a.", { id: "a", label: "API · AZ a", sub: "eu-west-1a" }),
        svc("ec2", 3, 2, "API server in AZ b. If AZ a loses power, this one keeps serving.", { id: "b", label: "API · AZ b", sub: "eu-west-1b" }),
        svc("rds", 4, 0, "Primary database in AZ a."),
        svc("standby", 4, 2, "Synchronous standby in AZ b; RDS promotes it automatically on failure."),
      ],
      ["user>cf", "cf>alb", "alb>a", "alb>b", "a>rds", "b>rds", ["rds", "standby", "sync"]],
      {
        "Normal day": [
          ["user", "cf", "The request reaches the nearest edge location."],
          ["cf", "alb", "Not cached (an API call): CloudFront forwards it to the Region."],
          ["alb", "a", "The load balancer picks a healthy server — here in AZ a."],
          ["a", "rds", "The API queries the primary database."],
        ],
        "AZ a fails": [
          ["alb", "a", "Health checks to AZ a start failing.", "bad"],
          ["alb", "b", "The load balancer sends every request to AZ b instead."],
          ["rds", "standby", "RDS fails over: the standby becomes the new primary (typically within a minute or two)."],
          ["b", "standby", "The app keeps working; shoppers might notice a short blip, not an outage."],
        ],
      },
      [grp("Region eu-west-1", 2, 0, 3, 3, "region"), grp("AZ a", 3, 0, 2, 1, "az"), grp("AZ b", 3, 2, 2, 1, "az")],
    ),
  },
  {
    t: "The shared responsibility model",
    lv: 1,
    s: `Security is split. AWS secures {{the cloud}}: buildings, hardware, the hypervisor, the global network and the managed service software. You secure what you put {{in the cloud}}: your IAM users and roles, security groups, encryption settings, bucket policies, OS patches on EC2, your application code and your data. The line moves with the service: on EC2 you patch the operating system; on RDS AWS patches the database engine but you choose who can connect; on Lambda AWS runs the runtime but your code and its permissions are still yours. Most cloud breaches are on the customer side — a public bucket, a leaked access key, an admin policy on a web server.`,
    r: `Security reviews start with the customer-side list: identity, network exposure, encryption, logging, patching.`,
    i: `Under the shared responsibility model, who patches the OS of an EC2 instance? Of an RDS database? Who is responsible for a public S3 bucket?`,
    v: layers(
      "AWS secures the cloud; you secure what you configure in it — and the more managed the service, the less of the stack is yours.",
      ["Your data and code|Always yours: classify, encrypt, back up, validate input", "Identity and access|Always yours: IAM roles, least privilege, MFA, no shared keys", "Network and firewall config|Yours: security groups, public access settings, WAF rules", "Guest OS and runtime|Yours on EC2; AWS's on RDS, Fargate and Lambda", "Managed service software|AWS: the MySQL engine on RDS, the Lambda runtime", "Hardware, network, facilities|AWS: data centres, hosts, global backbone"],
      "you → AWS",
    ),
  },
  {
    t: "Accounts, Organizations, free tier and budgets",
    lv: 1,
    s: `An {{AWS account}} is the hard boundary for resources, permissions and billing. Teams use several: separate {{dev}}, {{staging}} and {{prod}} accounts so a mistake in dev cannot touch production. {{AWS Organizations}} groups them, pays one bill and applies {{service control policies}} (guardrails such as "nobody may leave eu-west-1"). The root user of each account is for emergencies only: protect it with MFA and never use it day to day. New accounts start with Free Tier credits (USD 100 at sign-up and up to 100 more for completing activities) and choose a {{free plan}} (up to six months, no charges, some services unavailable) or a {{paid plan}}. Set an {{AWS Budgets}} alert on day one.`,
    r: `A budget alert at a small amount, MFA on root and no root access keys are the first three things to do in any new account.`,
    i: `Why use multiple AWS accounts? What do SCPs do? How do you stop a surprise bill?`,
    c: `# Create a monthly cost budget with an email alert at 80 % (AWS CLI)
aws budgets create-budget --account-id 111122223333 \\
  --budget '{"BudgetName":"shopnest-monthly","BudgetLimit":{"Amount":"25","Unit":"USD"},"TimeUnit":"MONTHLY","BudgetType":"COST"}' \\
  --notifications-with-subscribers '[{"Notification":{"NotificationType":"ACTUAL","ComparisonOperator":"GREATER_THAN","Threshold":80,"ThresholdType":"PERCENTAGE"},"Subscribers":[{"SubscriptionType":"EMAIL","Address":"you@example.com"}]}]'`,
    v: flow(
      "One organization, one account per environment, guardrails from SCPs, and a budget alert before anything else.",
      "row",
      ["Management account|billing · Organizations|i", "Security account|logs · audit", "Dev account|experiments|g", "Prod account|ShopNest live|w"],
      [[0, 1, "SCPs + consolidated bill"], [0, 2, "OU: workloads"], [0, 3, "OU: workloads"]],
      [0, 1, 2],
      ["The management account owns AWS Organizations and the single bill; keep workloads out of it.", "Developers can break dev freely: an SCP still blocks expensive or forbidden services.", "Prod is separate, so a dev mistake cannot delete production data — the account is the blast-radius boundary."],
    ),
  },
  {
    t: "Ways to drive AWS: console, CLI, SDK and IaC",
    lv: 1,
    s: `Everything in AWS is an {{API call}}. The {{console}} is a web UI over those APIs — great for exploring, bad for repeatability. The {{AWS CLI}} ({{aws s3 ls}}) scripts the same calls. The {{SDKs}} call them from code — in Node.js the modular {{@aws-sdk/client-*}} packages (v3). {{Infrastructure as code}} (CloudFormation, AWS CDK, Terraform) declares the whole environment in files reviewed like code. Credentials are resolved by a {{provider chain}}: environment variables, the shared config / SSO profile on your laptop, or — on AWS — the role attached to the instance, container or function. Code never needs hard-coded keys.`,
    r: `Rule of thumb: click to learn, script to repeat, IaC for anything that must exist tomorrow.`,
    i: `How does the AWS SDK find credentials? Why should application code never contain access keys?`,
    c: `// List product images in S3 — the SDK finds credentials by itself
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3 = new S3Client({ region: "eu-west-1" });   // no keys in code
const out = await s3.send(new ListObjectsV2Command({ Bucket: "shopnest-images", Prefix: "products/", MaxKeys: 5 }));
for (const o of out.Contents ?? []) console.log(o.Key, o.Size);

// Same call from a terminal:  aws s3 ls s3://shopnest-images/products/ --profile shopnest-dev`,
    v: compare(
      "Console to explore, CLI and SDK to automate, infrastructure as code for anything that must be rebuilt exactly.",
      ["Console", "CLI", "SDK (Node)", "IaC (CDK)"],
      [
        ["Best for", "Learning, one-off checks", "Scripts, ops tasks", "App code calling AWS", "Whole environments"],
        ["Repeatable?", "No", "Yes", "Yes", "Yes, with review and rollback"],
        ["Example", "Click Create bucket", "{{aws s3 mb s3://x}}", "{{s3.send(new PutObjectCommand…)}}", "{{new s3.Bucket(this, 'X')}}"],
        ["Credentials", "Your sign-in", "SSO profile", "The role it runs as", "The deploy role"],
      ],
      3,
    ),
  },
  {
    t: "ARNs, tags and naming",
    lv: 2,
    s: `Every resource has an {{ARN}} (Amazon Resource Name): {{arn:partition:service:region:account-id:resource}}, e.g. {{arn:aws:s3:::shopnest-images/products/1.jpg}} or {{arn:aws:sqs:eu-west-1:111122223333:orders}}. IAM policies, logs and events all refer to resources by ARN, and wildcards in ARNs ({{…:orders-*}}) are how you scope permissions. {{Tags}} are key/value labels ({{app=shopnest}}, {{env=prod}}, {{owner=team-a}}): they drive cost allocation reports, automation and even permissions (attribute-based access control). Agree a naming and tagging scheme early — it is painful to retrofit.`,
    r: `Activate cost-allocation tags such as {{app}} and {{env}} so the bill can be split by product and environment.`,
    i: `What are the parts of an ARN? Why do some ARNs (S3, IAM) have empty Region or account fields?`,
    v: compare(
      "An ARN names a resource precisely; tags describe it for billing and automation.",
      ["Example"],
      [
        ["S3 object", "{{arn:aws:s3:::shopnest-images/products/1.jpg}} (S3 names are global: no Region or account)"],
        ["SQS queue", "{{arn:aws:sqs:eu-west-1:111122223333:orders}}"],
        ["IAM role", "{{arn:aws:iam::111122223333:role/shopnest-api}} (IAM is global: no Region)"],
        ["Lambda", "{{arn:aws:lambda:eu-west-1:111122223333:function:resize-image}}"],
        ["Tags", "{{app=shopnest}} · {{env=prod}} · {{owner=checkout-team}} · {{cost-center=42}}"],
      ],
    ),
  },
  {
    t: "Well-Architected: six pillars to judge a design",
    lv: 2,
    s: `The {{AWS Well-Architected Framework}} gives a shared vocabulary for reviewing designs, in six pillars: {{operational excellence}} (automate, observe, learn from failure), {{security}} (identity, traceability, protect data in transit and at rest), {{reliability}} (recover automatically, test recovery, scale horizontally), {{performance efficiency}} (right resource types, go global, experiment), {{cost optimisation}} (pay only for what you need, measure) and {{sustainability}} (use less, use efficient hardware). Every design decision in this track trades between these pillars — Multi-AZ buys reliability for cost, a cache buys performance for consistency.`,
    r: `Use the pillars as a checklist in design reviews; the free Well-Architected Tool records answers and improvement plans.`,
    i: `Name the six pillars. Give a design decision that improves one pillar at the cost of another.`,
    v: layers(
      "Six lenses on every design — and most decisions are trade-offs between them.",
      ["Operational excellence|IaC, CI/CD, runbooks, observability", "Security|Least privilege, encryption, logging, no long-lived keys", "Reliability|Multi-AZ, health checks, backups you have restored", "Performance efficiency|Caching, CDN, right instance or serverless", "Cost optimisation|Right-size, Savings Plans, turn off idle dev", "Sustainability|Graviton, managed services, delete what you do not use"],
    ),
  },
];
