import { compare, seq } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { allow, arch, deny, iam, svc } from "./kit.js";

/* Identity and security: IAM, roles for apps, policy evaluation, secrets, encryption, Cognito. */

const BUCKET = "arn:aws:s3:::shopnest-images";

export const iamArea: ConceptDef[] = [
  {
    t: "IAM building blocks: principals, policies, roles",
    lv: 1,
    s: `{{IAM}} answers one question on every API call: {{may this principal do this action on this resource?}} A {{principal}} is who is asking — an IAM user, a role session, an AWS service. A {{policy}} is a JSON document of statements, each with {{Effect}} (Allow/Deny), {{Action}} ({{s3:GetObject}}), {{Resource}} (an ARN) and optional {{Condition}}. Policies attach to identities ({{identity-based}}) or to resources such as buckets and queues ({{resource-based}}). A {{role}} is an identity with no password or keys that someone — a person, an EC2 instance, a Lambda function, a GitHub workflow — {{assumes}} to receive temporary credentials. Modern AWS uses roles almost everywhere; IAM users with access keys are a last resort.`,
    r: `Each component of ShopNest gets its own role with only the permissions it needs: the API role reads one bucket and one secret, the image-resize Lambda writes one prefix.`,
    i: `What is the difference between an IAM user and an IAM role? Between identity-based and resource-based policies?`,
    c: `{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadProductImages",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::shopnest-images/products/*"
    },
    {
      "Sid": "ReadDbSecret",
      "Effect": "Allow",
      "Action": "secretsmanager:GetSecretValue",
      "Resource": "arn:aws:secretsmanager:eu-west-1:111122223333:secret:shopnest/db-*"
    }
  ]
}`,
    v: arch(
      "A principal makes a request; policies on the identity and on the resource decide; roles hand out temporary credentials instead of permanent keys.",
      [5, 2],
      [
        svc("ecs", 0, 0, "The API container runs with a task role — it never sees a password or access key.", { label: "API task", sub: "assumes role" }),
        svc("sts", 1, 0, "STS returns temporary credentials (key, secret, session token) that expire, usually within hours, and are refreshed automatically by the SDK."),
        svc("iam", 2, 0, "The role {{shopnest-api}}: a trust policy says who may assume it; a permissions policy says what it may do.", { label: "Role", sub: "shopnest-api" }),
        svc("s3", 3, 0, "The bucket can also carry its own resource-based policy (for example, deny anything without TLS)."),
        svc("secrets", 3, 1),
      ],
      [["ecs", "sts", "AssumeRole"], "sts>iam", ["ecs", "s3", "GetObject"], ["ecs", "secrets", "GetSecretValue"]],
      {
        "API reads an image": [
          ["ecs", "sts", "At start-up the SDK asks for the task role's credentials (ECS fetches them for the container)."],
          ["sts", "iam", "STS checks the role's trust policy: may ECS tasks assume {{shopnest-api}}? Yes."],
          ["sts", "ecs", "Temporary credentials come back and are cached and refreshed by the SDK."],
          ["ecs", "s3", "{{GetObject products/42.jpg}} is signed with them; IAM evaluates the policies: allowed."],
          ["ecs", "secrets", "Reading {{shopnest/admin}} instead would be denied: the policy only names {{shopnest/db-*}}.", "bad"],
        ],
      },
    ),
  },
  {
    t: "How AWS evaluates a request",
    lv: 2,
    s: `Every request starts {{implicitly denied}}. AWS then looks at all policies that apply. (1) Any {{explicit Deny}} anywhere wins — nothing overrides it. (2) {{SCPs}} from Organizations (and resource control policies) must allow the action, or it is denied. (3) Something must {{Allow}} it: within one account an Allow in the identity policy {{or}} in the resource-based policy is enough. (4) If the role has a {{permissions boundary}}, the action must be inside it. (5) If the session was started with a {{session policy}}, that must allow it too. Boundaries, SCPs and session policies never grant anything — they only cap. Toggle the policies in the lab and watch each stage decide.`,
    r: `When something is "Access Denied", walk the same order: explicit deny? SCP? any allow? boundary? session policy? — the CloudTrail event and the IAM policy simulator show which one.`,
    i: `If an identity policy allows {{s3:*}} and an SCP does not mention S3, is the call allowed? What beats an explicit Allow?`,
    v: iam(
      "Explicit Deny beats everything; SCPs, boundaries and session policies only limit; an Allow from the identity or resource policy is still required.",
      "role/shopnest-api (ECS task role)",
      [
        ["Read a product image", "s3:GetObject", `${BUCKET}/products/42.jpg`],
        ["Delete an image", "s3:DeleteObject", `${BUCKET}/products/42.jpg`],
        ["Create a bucket", "s3:CreateBucket", "arn:aws:s3:::shopnest-new"],
        ["Read invoices bucket", "s3:GetObject", "arn:aws:s3:::shopnest-invoices/2026/inv-1.pdf"],
      ],
      [
        { name: "shopnest-api-s3", kind: "identity", statements: [allow(["s3:*"], [`${BUCKET}`, `${BUCKET}/*`, "arn:aws:s3:::shopnest-new"])] },
        { name: "no-deletes-in-prod", kind: "identity", statements: [deny(["s3:DeleteObject", "s3:DeleteBucket"])] },
        { name: "invoices bucket policy", kind: "resource", statements: [allow(["s3:GetObject"], ["arn:aws:s3:::shopnest-invoices/*"])] },
        { name: "org-guardrails", kind: "scp", statements: [allow(["*"]), deny(["s3:CreateBucket"])] },
        { name: "app-boundary", kind: "boundary", on: false, statements: [allow(["s3:GetObject", "s3:PutObject"], ["arn:aws:s3:::shopnest-*"])] },
      ],
    ),
  },
  {
    t: "Roles for applications: no access keys",
    lv: 1,
    s: `Code running on AWS should get credentials from the {{role of the compute it runs on}}: an {{instance profile}} on EC2, a {{task role}} on ECS/Fargate, an {{execution role}} on Lambda. The SDK's default credential chain picks them up automatically and refreshes them before they expire. Long-lived access keys in {{.env}} files, Docker images or Git are the classic leak: they work from anywhere, never expire by themselves and are hard to rotate. Roles also make audit clear — CloudTrail shows which role (and which instance or task) made each call. On ECS keep the two roles distinct: the {{task execution role}} lets ECS pull the image and write logs; the {{task role}} is what your Node code uses.`,
    r: `Scan repositories and images for keys (GitHub secret scanning, git-secrets), and alert on any IAM user access key older than a few days.`,
    i: `How does a Node.js app on ECS get AWS credentials? What is the difference between the task role and the task execution role?`,
    c: `// Nothing to configure: on EC2, ECS and Lambda the SDK finds the role's credentials.
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const sm = new SecretsManagerClient({});        // Region from AWS_REGION
const { SecretString } = await sm.send(new GetSecretValueCommand({ SecretId: "shopnest/db" }));
const { username, password, host } = JSON.parse(SecretString);

// Anti-pattern — never do this:
// new S3Client({ credentials: { accessKeyId: "AKIA…", secretAccessKey: "…" } })`,
    v: seq(
      "The platform hands your code short-lived credentials for its role; nothing secret is ever stored in the app.",
      ["Node code", "AWS SDK", "ECS agent", "STS", "Secrets Manager"],
      [
        [0, 1, "send(GetSecretValue)", "Your code just calls the SDK — no keys anywhere."],
        [1, 2, "credentials?", "The default provider chain finds the container credentials endpoint ECS injected."],
        [2, 3, "AssumeRole(task role)", "ECS obtains temporary credentials for the task role."],
        [3, 1, "key + secret + token (expires)", "Short-lived and refreshed automatically before expiry.", "r"],
        [1, 4, "signed request", "The call is signed (SigV4) with the temporary credentials."],
        [4, 0, "secret value", "Allowed because the task role's policy names this secret.", "r"],
      ],
    ),
  },
  {
    t: "Least privilege and IAM Access Analyzer",
    lv: 2,
    s: `{{Least privilege}} means each role can do exactly what it needs and nothing more: specific actions, specific resource ARNs, conditions where they help ({{aws:SecureTransport}}, source VPC, tags). {{"Action": "*", "Resource": "*"}} on an application role turns any code bug (SSRF, injection) into an account takeover. Start narrow and widen from real errors. {{IAM Access Analyzer}} helps from both sides: it flags resources shared outside your account or organization, reports {{unused}} roles, keys and permissions, validates policies against best practices, and can {{generate a policy}} from the actions a role really used in CloudTrail. Compare the two versions of the API role in the lab.`,
    r: `Review "last accessed" information before removing permissions; Access Analyzer's unused-access findings make this a routine job.`,
    i: `How would you take an over-permissive role down to least privilege without breaking production?`,
    v: iam(
      "Scoped actions on scoped ARNs: a bug in the app can then only touch what the app was meant to touch.",
      "role/shopnest-api",
      [
        ["Read product image", "s3:GetObject", `${BUCKET}/products/7.jpg`],
        ["Read another app's data", "s3:GetObject", "arn:aws:s3:::hr-payroll/2026/salaries.csv"],
        ["Delete the database", "rds:DeleteDBInstance", "arn:aws:rds:eu-west-1:111122223333:db:shopnest"],
        ["Write user upload", "s3:PutObject", `${BUCKET}/uploads/u1/avatar.png`],
      ],
      [
        { name: "too-broad (AdministratorAccess)", kind: "identity", on: false, statements: [allow(["*"])] },
        { name: "least-privilege", kind: "identity", statements: [allow(["s3:GetObject"], [`${BUCKET}/products/*`]), allow(["s3:PutObject"], [`${BUCKET}/uploads/*`])] },
      ],
    ),
  },
  {
    t: "People and pipelines: Identity Center and OIDC",
    lv: 2,
    s: `Humans should sign in through {{IAM Identity Center}} (single sign-on, often backed by your company directory): they choose an account and a {{permission set}} (for example {{ReadOnly}} in prod, {{PowerUser}} in dev) and get temporary credentials — on the command line through {{aws sso login}}. Pipelines should not hold keys either: {{GitHub Actions}} (and GitLab, Bitbucket…) can exchange their signed {{OIDC token}} for a role via {{AssumeRoleWithWebIdentity}}. The role's trust policy pins which repository and branch may assume it, so a fork or another repo cannot deploy to your account.`,
    r: `Restrict the CI role's trust policy to {{repo:your-org/shopnest:ref:refs/heads/main}} (or an environment) and give it only deploy permissions.`,
    i: `How do you give GitHub Actions access to AWS without storing secrets? What stops another repository from using that role?`,
    c: `# .github/workflows/deploy.yml
permissions:
  id-token: write        # allow the job to request an OIDC token
  contents: read
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: aws-actions/configure-aws-credentials@v6
        with:
          role-to-assume: arn:aws:iam::111122223333:role/shopnest-deploy
          aws-region: eu-west-1
      - run: npx cdk deploy --require-approval never

# Trust policy condition on shopnest-deploy:
# "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com",
#                   "token.actions.githubusercontent.com:sub": "repo:acme/shopnest:ref:refs/heads/main" }`,
    v: seq(
      "CI proves who it is with a signed OIDC token and receives a short-lived role session; no AWS secret is stored in GitHub.",
      ["GitHub Actions", "GitHub OIDC", "AWS STS", "IAM trust policy", "CloudFormation"],
      [
        [0, 1, "request ID token", "The job asks GitHub for a JWT describing it: repo, branch, workflow."],
        [1, 0, "signed JWT (sub = repo:acme/shopnest:ref:refs/heads/main)", "", "r"],
        [0, 2, "AssumeRoleWithWebIdentity", "The action sends the token to STS."],
        [2, 3, "check aud + sub", "STS verifies the signature and the trust policy conditions — only this repo and branch."],
        [2, 0, "temporary credentials (1 h)", "", "r"],
        [0, 4, "cdk deploy", "The deploy runs with exactly the deploy role's permissions."],
      ],
    ),
  },
  {
    t: "Secrets Manager vs Parameter Store",
    lv: 1,
    s: `Configuration that must stay secret — the MySQL password, a payment API key — belongs in {{AWS Secrets Manager}} or {{SSM Parameter Store}}, never in code, images or plain environment variables in templates. {{Secrets Manager}} is built for credentials: automatic {{rotation}} (with ready-made rotation for RDS), cross-account sharing, versioning, a per-secret monthly price. {{Parameter Store}} holds configuration and secrets as {{SecureString}} parameters encrypted with KMS; standard parameters are free, with no built-in rotation. Read secrets at start-up (and cache them briefly), not on every request. RDS can also manage the master password in Secrets Manager for you.`,
    r: `ShopNest: DB credentials in Secrets Manager with 30-day rotation; feature flags and URLs in Parameter Store under {{/shopnest/prod/…}}.`,
    i: `When would you choose Secrets Manager over Parameter Store? How does an app pick up a rotated password without downtime?`,
    c: `import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const ssm = new SSMClient({});
const sm = new SecretsManagerClient({});

// plain config (free, versioned)
const { Parameter } = await ssm.send(new GetParameterCommand({ Name: "/shopnest/prod/payments-url" }));

// a secret that rotates — cache it for a few minutes, re-read on auth errors
let cached, readAt = 0;
export async function dbSecret() {
  if (!cached || Date.now() - readAt > 5 * 60_000) {
    const r = await sm.send(new GetSecretValueCommand({ SecretId: "shopnest/db" }));
    cached = JSON.parse(r.SecretString); readAt = Date.now();
  }
  return cached;
}`,
    v: compare(
      "Credentials that rotate go to Secrets Manager; ordinary configuration and simple secrets fit Parameter Store.",
      ["Secrets Manager", "Parameter Store"],
      [
        ["Built for", "Credentials, API keys", "Config values, some secrets"],
        ["Automatic rotation", "Yes (Lambda-based, built-in for RDS)", "No"],
        ["Encryption", "Always, with KMS", "SecureString with KMS"],
        ["Price", "Per secret per month + API calls", "Standard tier free"],
        ["ShopNest uses it for", "{{shopnest/db}} password", "{{/shopnest/prod/payments-url}}, feature flags"],
      ],
      0,
    ),
  },
  {
    t: "KMS and envelope encryption",
    lv: 2,
    s: `{{AWS KMS}} manages encryption keys that never leave its hardware security modules unencrypted. Services use {{envelope encryption}}: KMS generates a {{data key}}, the service encrypts your data with it locally, then stores the data key {{encrypted by the KMS key}} next to the data. To read, the service asks KMS to decrypt the small data key — a call that IAM checks and CloudTrail logs. That is why "encryption at rest" in S3, EBS, RDS and DynamoDB is one setting: choose an AWS-managed key, or a {{customer managed key}} when you need your own key policy, rotation control or cross-account use. Encryption in transit is separate: use TLS everywhere, including to MySQL.`,
    r: `A customer managed key's key policy is a second lock: even an admin role cannot decrypt unless the key policy allows it.`,
    i: `Explain envelope encryption. Why not send the whole file to KMS to encrypt?`,
    v: seq(
      "Big data is encrypted locally with a data key; only the tiny data key travels to KMS, which controls and logs every decrypt.",
      ["RDS / S3", "KMS", "Storage"],
      [
        [0, 1, "GenerateDataKey", "Writing: the service asks for a fresh data key."],
        [1, 0, "plaintext key + encrypted key", "KMS returns both; the KMS key itself never leaves KMS.", "r"],
        [0, 2, "data encrypted with the data key, + encrypted key", "The plaintext data key is used in memory and discarded."],
        [0, 1, "Decrypt(encrypted key)", "Reading: IAM and the key policy decide; CloudTrail records the call."],
        [1, 0, "plaintext data key", "The service decrypts the data locally.", "r"],
      ],
    ),
  },
  {
    t: "Cognito: sign-in for your React users",
    lv: 2,
    s: `IAM is for AWS principals; your shop's {{customers}} need app accounts. {{Amazon Cognito user pools}} provide sign-up, sign-in, password reset, MFA and social or enterprise login (Google, Apple, SAML, OIDC) with a hosted UI or your own React forms. After sign-in the browser holds three JWTs: an {{ID token}} (who the user is), an {{access token}} (what the API may let them do) and a {{refresh token}}. The React app sends the access token in {{Authorization: Bearer …}}; the Node API — or API Gateway's JWT authorizer — verifies the signature against the pool's public keys, the expiry, the issuer and the client id. Never trust user ids sent in the request body.`,
    r: `Verify tokens in one middleware; map Cognito groups (e.g. {{admin}}) to app roles; keep tokens short-lived.`,
    i: `What is the difference between Cognito user pools and IAM? How does the API verify a Cognito token?`,
    c: `// Express middleware: verify the Cognito access token on every request
import { CognitoJwtVerifier } from "aws-jwt-verify";

const verifier = CognitoJwtVerifier.create({
  userPoolId: process.env.USER_POOL_ID,       // eu-west-1_AbC123
  clientId: process.env.USER_POOL_CLIENT_ID,
  tokenUse: "access",
});

export async function requireUser(req, res, next) {
  try {
    const token = (req.headers.authorization ?? "").replace(/^Bearer /, "");
    const claims = await verifier.verify(token);   // checks signature, expiry, issuer, client
    req.user = { id: claims.sub, groups: claims["cognito:groups"] ?? [] };
    next();
  } catch {
    res.status(401).json({ error: "sign in again" });
  }
}`,
    v: seq(
      "Cognito signs the user in and issues JWTs; the API verifies every token itself and takes the user id from the token, not the request.",
      ["React app", "Cognito", "Node API", "MySQL"],
      [
        [0, 1, "sign in (email + password + MFA)", "Hosted UI or the Amplify Auth library."],
        [1, 0, "ID, access, refresh tokens", "Short-lived JWTs; the refresh token renews them.", "r"],
        [0, 2, "GET /api/orders  Authorization: Bearer <access>", "Every API call carries the access token."],
        [2, 2, "verify signature, exp, iss, client_id", "Keys come from the pool's JWKS endpoint and are cached."],
        [2, 3, "SELECT … WHERE user_id = token.sub", "The user id comes from the verified token — never from the body."],
      ],
    ),
  },
  {
    t: "Guardrails at scale: resource policies, boundaries, SCPs",
    lv: 3,
    s: `Three tools put limits around what roles can do. {{Resource-based policies}} live on the resource — a bucket, queue, KMS key — and are how you grant {{cross-account}} access or enforce rules such as "deny any request without TLS". {{Permissions boundaries}} cap a role: developers may create roles for their Lambda functions, but only inside the boundary, so nobody can mint an admin role. {{Service control policies}} cap whole accounts in an organization: deny leaving approved Regions, deny disabling CloudTrail, deny deleting the backup vault. None of them grants permissions on its own. In the lab, switch on the boundary and see which requests it blocks even though the role allows them.`,
    r: `Typical SCPs: region allow-list, protect security services, deny root user actions; typical boundary: "may only touch resources tagged with my team".`,
    i: `A developer creates a role with AdministratorAccess but a permissions boundary that allows only S3 reads. What can the role do?`,
    v: iam(
      "Boundaries and SCPs only take away: the effective permission is the overlap of everything that applies.",
      "role/team-a-lambda (created by a developer)",
      [
        ["Read app bucket", "s3:GetObject", "arn:aws:s3:::shopnest-images/products/1.jpg"],
        ["Create an IAM user", "iam:CreateUser", "arn:aws:iam::111122223333:user/backdoor"],
        ["Stop CloudTrail", "cloudtrail:StopLogging", "arn:aws:cloudtrail:eu-west-1:111122223333:trail/org"],
        ["Write order event", "sqs:SendMessage", "arn:aws:sqs:eu-west-1:111122223333:orders"],
      ],
      [
        { name: "AdministratorAccess", kind: "identity", statements: [allow(["*"])] },
        { name: "team-a-boundary", kind: "boundary", statements: [allow(["s3:GetObject", "s3:PutObject", "sqs:SendMessage", "cloudtrail:*"], ["arn:aws:s3:::shopnest-*", "arn:aws:sqs:eu-west-1:111122223333:orders", "arn:aws:cloudtrail:*"])] },
        { name: "protect-security-services", kind: "scp", statements: [allow(["*"]), deny(["cloudtrail:StopLogging", "cloudtrail:DeleteTrail"])] },
      ],
    ),
  },
];
