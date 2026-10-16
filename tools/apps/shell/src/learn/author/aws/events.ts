import { compare, flow, lanes, queue, seq } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { arch, svc } from "./kit.js";

/* Serverless and integration: API Gateway, SQS, SNS, EventBridge, Step Functions, retries, concurrency. */

export const events: ConceptDef[] = [
  {
    t: "API Gateway: HTTP APIs vs REST APIs",
    lv: 1,
    s: `{{Amazon API Gateway}} is a managed front door for APIs, most often in front of Lambda. {{HTTP APIs}} are the lean, cheaper option: routes, JWT authorizers (perfect for Cognito tokens), Lambda and HTTP integrations, CORS, and a maximum integration timeout of 30 seconds. {{REST APIs}} add features: API keys and usage plans, request validation, response caching, request/response mapping, AWS WAF, private APIs, and an integration timeout of 29 seconds by default that can be raised for Regional and private APIs. Both throttle at the account level (10,000 requests per second by default per Region, with bursts) and accept payloads up to 10 MB. Long work does not belong behind a synchronous API call — accept, queue, return {{202}}, and let the client poll or receive a notification.`,
    r: `Start with an HTTP API unless you need a REST-only feature; put CloudFront in front for a custom domain on the same origin as the React app.`,
    i: `When would you choose a REST API over an HTTP API? How would you handle a request that takes two minutes?`,
    c: `// Lambda behind an HTTP API (payload v2.0): GET /orders/{id}
export const handler = async (event) => {
  const userId = event.requestContext.authorizer.jwt.claims.sub;   // verified by the JWT authorizer
  const id = event.pathParameters.id;
  const order = await getOrder(userId, id);
  if (!order) return { statusCode: 404, body: JSON.stringify({ error: "not found" }) };
  return { statusCode: 200, headers: { "content-type": "application/json" }, body: JSON.stringify(order) };
};`,
    v: compare(
      "HTTP APIs for most Lambda back ends; REST APIs when you need keys, usage plans, caching, validation or WAF on the API itself.",
      ["HTTP API", "REST API"],
      [
        ["Price", "Lower", "Higher"],
        ["Auth", "JWT (Cognito/OIDC), IAM, Lambda", "Cognito, IAM, Lambda, API keys"],
        ["Integration timeout", "Up to 30 s", "29 s default, raisable (Regional/private)"],
        ["Extras", "CORS, auto-deploy", "Usage plans, caching, validation, mapping, WAF"],
        ["ShopNest", "Serverless API v4", "Partner API with keys and quotas"],
      ],
      0,
    ),
  },
  {
    t: "SQS: queues, visibility timeout, dead-letter queues",
    lv: 1,
    s: `{{Amazon SQS}} decouples producers from consumers: checkout puts an "order placed" message on a queue and returns immediately; workers process it at their own pace. A consumer receives a message, which becomes {{invisible}} for the {{visibility timeout}} (default 30 s, up to 12 h); if the consumer deletes it, it is done; if the consumer crashes, it reappears and is retried. After {{maxReceiveCount}} failures a {{redrive policy}} moves it to a {{dead-letter queue}}. Standard queues give at-least-once delivery and best-effort order; {{FIFO}} queues give exactly-once processing and order per message group, with lower throughput. Messages can be up to 1 MiB and are kept up to 14 days. Play with the arrival rate and workers.`,
    r: `Set the visibility timeout to at least six times the Lambda function timeout when Lambda consumes the queue, and alarm on the dead-letter queue's depth.`,
    i: `What happens to an SQS message if the worker crashes mid-processing? Why can the same message be processed twice?`,
    v: queue(
      "The queue absorbs bursts: when orders arrive faster than workers can finish, the backlog grows instead of requests failing — add workers to drain it.",
      { producer: "Checkout", queue: "orders queue", worker: "Worker", arrival: 5, service: 1.5, workers: 2, capacity: 20, overflow: "block" },
    ),
  },
  {
    t: "SQS + Lambda: batches and partial failures",
    lv: 2,
    s: `With an {{event source mapping}}, Lambda polls the queue for you and invokes your function with a {{batch}} of messages. If the handler throws, the {{whole batch}} returns to the queue — including messages that succeeded, which will then be processed again. Report partial failures instead: enable {{ReportBatchItemFailures}} and return the ids of only the messages that failed. Lambda scales the number of concurrent pollers with the backlog; use {{maximum concurrency}} on the mapping to protect a downstream database. Every handler must be {{idempotent}}, because at-least-once delivery means duplicates will happen.`,
    r: `ShopNest's order worker returns {{batchItemFailures}}, caps concurrency at 20 to protect MySQL, and dedupes on the order id.`,
    i: `A batch of 10 messages has one poison message. What happens with and without partial batch responses?`,
    c: `// Lambda consuming SQS with partial batch responses
export const handler = async (event) => {
  const batchItemFailures = [];
  for (const record of event.Records) {
    try {
      const order = JSON.parse(record.body);
      await fulfil(order);                  // must be idempotent
    } catch (err) {
      console.error("failed", record.messageId, err);
      batchItemFailures.push({ itemIdentifier: record.messageId });
    }
  }
  return { batchItemFailures };             // only these go back to the queue
};`,
    v: seq(
      "Return only the failed message ids: successes are deleted, failures retry, and poison messages end up in the DLQ.",
      ["SQS", "Lambda poller", "Handler", "DLQ"],
      [
        [1, 0, "ReceiveMessage (batch of 10)", "Lambda's pollers long-poll the queue."],
        [1, 2, "invoke(Records[10])", "The handler processes each order."],
        [2, 1, "{ batchItemFailures: [msg 7] }", "Nine succeeded; message 7 threw.", "r"],
        [1, 0, "delete 9 · release msg 7", "Only message 7 becomes visible again for a retry."],
        [0, 3, "msg 7 after maxReceiveCount", "If it keeps failing it is moved to the dead-letter queue for a human to inspect.", "b"],
      ],
    ),
  },
  {
    t: "SNS fan-out",
    lv: 2,
    s: `{{Amazon SNS}} is publish/subscribe: one message published to a {{topic}} is pushed to every {{subscription}} — SQS queues, Lambda functions, HTTPS endpoints, email, SMS, mobile push. The classic pattern is {{fan-out}}: publish "OrderPlaced" once; separate SQS queues for email, inventory and analytics each get a copy and are processed independently, so a slow analytics consumer never delays the confirmation email. {{Subscription filter policies}} deliver only matching messages to each subscriber. FIFO topics pair with FIFO queues when order matters.`,
    r: `Put an SQS queue between SNS and each consumer (rather than invoking Lambda directly) so every consumer gets buffering, retries and its own DLQ.`,
    i: `Why use SNS + SQS fan-out instead of having checkout call three services directly?`,
    v: arch(
      "Publish once; each consumer has its own queue, its own pace and its own failures.",
      [4, 3],
      [
        svc("ecs", 0, 1, "Checkout publishes one message after the order is committed in MySQL.", { label: "Checkout API", sub: "publisher" }),
        svc("sns", 1, 1, "Topic {{order-events}}; three SQS subscriptions, one with a filter policy {{total ≥ 10000}}."),
        svc("sqs", 2, 0, "Email queue → Lambda sends the confirmation through Amazon SES.", { id: "q1", label: "email-queue", sub: "SQS" }),
        svc("sqs", 2, 1, "Inventory queue → worker decrements stock.", { id: "q2", label: "stock-queue", sub: "SQS" }),
        svc("sqs", 2, 2, "Fraud queue: filter policy only passes orders over 100.00.", { id: "q3", label: "fraud-queue", sub: "filtered" }),
        svc("lambda", 3, 0, undefined, { id: "l1", label: "send-email", sub: "Lambda" }),
        svc("lambda", 3, 1, undefined, { id: "l2", label: "update-stock", sub: "Lambda" }),
        svc("lambda", 3, 2, undefined, { id: "l3", label: "fraud-check", sub: "Lambda" }),
      ],
      ["ecs>sns", "sns>q1", "sns>q2", "sns>q3", "q1>l1", "q2>l2", "q3>l3"],
      {
        "Order placed (total 49.90)": [
          ["ecs", "sns", "Publish {{OrderPlaced}} once."],
          ["sns", "q1", "Copy to the email queue…"],
          ["sns", "q2", "…and to the stock queue. The fraud filter does not match (total < 100)."],
          ["q1", "l1", "Each consumer processes independently."],
          ["q2", "l2", "If stock updates fail, emails are unaffected; retries happen only for stock."],
        ],
      },
    ),
  },
  {
    t: "EventBridge: event buses and schedules",
    lv: 2,
    s: `{{Amazon EventBridge}} routes {{events}} — JSON describing something that happened — from AWS services, SaaS partners and your own code to targets, using {{rules}} that match on event content (for example {{detail-type = OrderPlaced}} and {{detail.total >= 10000}}). Producers do not know the consumers, so teams can add new reactions without touching checkout. {{Archive and replay}} re-sends past events, {{schema registry}} documents them, and {{EventBridge Scheduler}} runs one-off or cron/rate schedules at scale (nightly report, "remind me in 3 days"). Compared with SNS: richer content filtering and many targets per rule; SNS: higher fan-out throughput and push to phones/email.`,
    r: `Publish domain events ({{OrderPlaced}}, {{OrderShipped}}) to a custom bus; use Scheduler instead of cron on a server.`,
    i: `SNS vs EventBridge — how do you choose? How would you send an email three days after an abandoned cart?`,
    c: `import { EventBridgeClient, PutEventsCommand } from "@aws-sdk/client-eventbridge";
const eb = new EventBridgeClient({});

await eb.send(new PutEventsCommand({ Entries: [{
  EventBusName: "shopnest",
  Source: "shopnest.checkout",
  DetailType: "OrderPlaced",
  Detail: JSON.stringify({ orderId: 981, userId: 42, total: 4990, currency: "EUR" }),
}] }));`,
    v: arch(
      "Producers emit facts; rules decide who reacts — new consumers plug in without changing the producer.",
      [4, 3],
      [
        svc("ecs", 0, 1, undefined, { label: "Checkout", sub: "emits events" }),
        svc("eb", 1, 1, "Custom bus {{shopnest}}. Rules match on source, detail-type and fields in the detail."),
        svc("sfn", 2, 0, "Rule 1: every OrderPlaced starts the fulfilment workflow."),
        svc("lambda", 2, 2, "Rule 2: orders over 100.00 go to a fraud-check function.", { label: "fraud-check", sub: "Lambda" }),
        svc("s3", 3, 1, "Rule 3: all events archived for analytics (via Firehose).", { label: "Event archive", sub: "analytics" }),
      ],
      ["ecs>eb", ["eb", "sfn", "OrderPlaced"], ["eb", "lambda", "total ≥ 10000"], ["eb", "s3", "all"]],
      {
        "OrderPlaced (big order)": [
          ["ecs", "eb", "{{PutEvents}}: source shopnest.checkout, detail-type OrderPlaced, total 12900."],
          ["eb", "sfn", "Rule 1 matches: start fulfilment."],
          ["eb", "lambda", "Rule 2 matches (total ≥ 10000): fraud check."],
          ["eb", "s3", "Rule 3 matches everything: archive."],
        ],
      },
    ),
  },
  {
    t: "Step Functions: workflows with retries and waits",
    lv: 2,
    s: `{{AWS Step Functions}} runs {{state machines}}: steps that call Lambda or 200+ AWS services directly, with {{Choice}} branches, {{Parallel}} and {{Map}} states, {{Wait}} states, built-in {{Retry}} with backoff and {{Catch}} for errors, and {{callbacks}} that pause for a human or an external system. Every execution's history is visible step by step. {{Standard}} workflows can run up to a year and are exactly-once — order fulfilment, approvals. {{Express}} workflows run up to five minutes at high volume — event processing. Putting the order saga here (reserve stock → charge card → ship; on failure refund and release stock) keeps that logic out of a fragile chain of functions.`,
    r: `Use direct service integrations (DynamoDB, SQS, SNS, Bedrock) instead of Lambda functions that only forward a call.`,
    i: `How would you implement an order process that must refund the card if shipping fails? Standard vs Express workflows?`,
    v: flow(
      "Each step has its own retries; a failure triggers compensating steps, and the whole run is visible as a history.",
      "row",
      ["Reserve stock|DynamoDB", "Charge card|payment API", "Create shipment|carrier API", "Done|g", "Refund + release|compensate|b"],
      [[0, 1], [1, 2], [2, 3, "ok"], [2, 4, "Catch"]],
      [0, 1, 2, 3],
      ["Step 1 reserves stock with a conditional update (retry 3× on throttling).", "Step 2 charges the card through the payment provider (with an idempotency key).", "Step 3 books the shipment. On success the order is complete…", "…but if the carrier API keeps failing, the Catch runs compensation: refund the payment and release the stock."],
    ),
  },
  {
    t: "Idempotency, retries and backoff",
    lv: 1,
    s: `In distributed systems every call can time out, and every queue can deliver twice, so operations must be {{idempotent}}: doing them twice has the same effect as once. The standard technique is an {{idempotency key}} (an order id or a UUID from the client): record it with a conditional write ({{attribute_not_exists}} in DynamoDB, a unique index in MySQL) before acting, and return the stored result on a repeat. Retry only on transient errors ({{throttling}}, {{5xx}}, timeouts) with {{exponential backoff and jitter}} so thousands of clients do not retry in lock-step. The AWS SDKs already retry their own calls this way.`,
    r: `Pass the same idempotency key through every hop — API, queue message, payment provider — so a retry anywhere is safe.`,
    i: `A payment request times out. Is it safe to retry? How do you make "charge the card" idempotent?`,
    c: `// Full-jitter exponential backoff: wait a random time in [0, min(cap, base * 2^attempt)]
function backoffMs(attempt, base = 100, cap = 5000, rand = Math.random) {
  return Math.floor(rand() * Math.min(cap, base * 2 ** attempt));
}
for (let a = 0; a < 6; a++) {
  console.log(\`attempt \${a}: up to \${Math.min(5000, 100 * 2 ** a)} ms, e.g. \${backoffMs(a, 100, 5000, () => 0.5)} ms\`);
}`,
    o: `attempt 0: up to 100 ms, e.g. 50 ms
attempt 1: up to 200 ms, e.g. 100 ms
attempt 2: up to 400 ms, e.g. 200 ms
attempt 3: up to 800 ms, e.g. 400 ms
attempt 4: up to 1600 ms, e.g. 800 ms
attempt 5: up to 3200 ms, e.g. 1600 ms`,
    v: seq(
      "Record the key first; a duplicate finds it and returns the original result instead of charging twice.",
      ["Worker", "DynamoDB (idempotency)", "Payment API"],
      [
        [0, 1, "PutItem key=order-981 IF attribute_not_exists", "First delivery: the key is new, so we may proceed."],
        [0, 2, "charge 49.90 (Idempotency-Key: order-981)", "The provider also dedupes on the key."],
        [0, 1, "update key=order-981 → result: charged", ""],
        [0, 1, "PutItem key=order-981 IF attribute_not_exists (duplicate delivery)", "SQS delivered the message again."],
        [1, 0, "ConditionalCheckFailed → return stored result", "No second charge: the duplicate is harmless.", "r"],
      ],
    ),
  },
  {
    t: "Lambda concurrency, throttling and cold starts",
    lv: 2,
    s: `{{Concurrency}} is the number of requests being handled at the same moment ≈ requests per second × average duration in seconds: 200 req/s × 0.25 s = 50 concurrent environments. The Region's default quota is 1,000 shared by all functions, and each function can add up to 1,000 environments every 10 seconds. {{Reserved concurrency}} guarantees (and caps) a function's share — useful to protect a database. {{Provisioned concurrency}} keeps environments initialised ahead of time to remove cold starts for latency-sensitive paths, at a cost. Above the limit, synchronous calls get {{429 throttling}} errors; asynchronous and queue events are retried. Keep init light, bundle and tree-shake your code, and reuse connections.`,
    r: `Give the checkout function reserved concurrency so a runaway report job cannot starve it, and provisioned concurrency only where p99 latency matters.`,
    i: `How many concurrent executions does a function need at 300 requests per second with 400 ms average duration? What happens above the limit?`,
    v: lanes(
      "Each environment serves one request at a time: concurrency = rate × duration; new environments pay a cold start, reused ones do not.",
      12,
      {
        "Env 1": [[0, 2, "cold start", "w"], [2, 2, "req A", "g"], [4, 2, "req C", "g"], [6, 2, "req E", "g"]],
        "Env 2": [[2, 2, "cold start", "w"], [4, 2, "req B", "g"], [6, 2, "req D", "g"], [8, 2, "req F", "g"]],
        "Env 3 (provisioned)": [[0, 1, "ready", "i"], [3, 2, "req X", "g"], [7, 2, "req Y", "g"]],
        "Over limit": [[9, 2, "429 throttled", "b"]],
      },
      [[0, "The first request lands on a new environment and pays the cold start."], [2, "A burst needs a second environment — another cold start."], [4, "Reused environments answer immediately: no init."], [9, "With reserved concurrency of 3, a fourth simultaneous request is throttled."]],
    ),
  },
];
