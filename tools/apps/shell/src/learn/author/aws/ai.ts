import { bars, compare, flow, layers, par, seq } from "../../visuals/kit.js";
import type { ConceptDef } from "../build.js";
import { arch, svc } from "./kit.js";

/* AI on AWS: Bedrock, RAG with Knowledge Bases, vector stores, Guardrails, agents, SageMaker AI, AI services. */

export const ai: ConceptDef[] = [
  {
    t: "The AWS AI stack: three layers",
    lv: 1,
    s: `AWS offers AI at three levels of effort. {{Ready-made AI services}} solve one task through a simple API with no model work: {{Rekognition}} (images/video), {{Textract}} (documents), {{Transcribe}} (speech to text), {{Polly}} (text to speech), {{Comprehend}} (entities, sentiment, PII), {{Translate}}. {{Amazon Bedrock}} gives serverless access to foundation models from Amazon (Nova), Anthropic (Claude), OpenAI, Mistral, Meta, DeepSeek and others, plus building blocks: Knowledge Bases for RAG, Guardrails, agents, evaluation, batch inference and model customisation. {{Amazon SageMaker AI}} is for training, tuning and hosting {{your own}} models. Most application teams start with Bedrock and AI services and reach for SageMaker AI only when they truly need a custom model.`,
    r: `ShopNest: Textract for supplier invoices, Rekognition to moderate uploaded photos, Bedrock (Claude or Nova) + a Knowledge Base for the shopping assistant.`,
    i: `When would you use a pre-built AI service, Bedrock, or SageMaker AI? Give one example of each.`,
    v: layers(
      "Choose the highest layer that solves the problem: less ML work, faster delivery.",
      ["AI services|One task, one API: Rekognition, Textract, Transcribe, Polly, Comprehend, Translate|g", "Amazon Bedrock|Foundation models + RAG, Guardrails, agents (AgentCore), evals, batch|i", "SageMaker AI|Train, fine-tune and host your own models; notebooks, pipelines, endpoints|w", "Infrastructure|GPU and AI-chip instances (P, G, Inferentia, Trainium) for full control"],
      "less → more ML work",
    ),
  },
  {
    t: "Amazon Bedrock: calling a model from Node.js",
    lv: 1,
    s: `Bedrock models are called through the {{bedrock-runtime}} endpoint. The {{Converse API}} gives one request shape for every chat model: {{modelId}}, a list of {{messages}} (role + content blocks), an optional {{system}} prompt, and {{inferenceConfig}} ({{maxTokens}}, {{temperature}}, {{topP}}). The response returns {{output.message}}, a {{stopReason}} ({{end_turn}}, {{max_tokens}}, {{tool_use}}…) and {{usage}} with input and output token counts — the basis of your bill. Access is controlled by IAM ({{bedrock:InvokeModel}} on the model or inference-profile ARN), so the API's task role needs no API key. Bedrock also exposes OpenAI-compatible (Chat Completions, Responses) and Anthropic Messages endpoints for some models, but Converse keeps code portable across providers.`,
    r: `Put the model id in configuration (Parameter Store), log {{usage}} per request, and set {{maxTokens}} on every call so one prompt cannot run up the bill.`,
    i: `How does an app on ECS authenticate to Bedrock? What does the Converse API give you over InvokeModel?`,
    c: `import { BedrockRuntimeClient, ConverseCommand } from "@aws-sdk/client-bedrock-runtime";

const bedrock = new BedrockRuntimeClient({ region: "eu-west-1" });

export async function describeProduct(product) {
  const res = await bedrock.send(new ConverseCommand({
    modelId: process.env.MODEL_ID,     // a model or inference-profile id from the Bedrock console
    system: [{ text: "You write short, factual product descriptions. No invented specs." }],
    messages: [{ role: "user", content: [{ text: \`Describe: \${JSON.stringify(product)}\` }] }],
    inferenceConfig: { maxTokens: 300, temperature: 0.3 },
  }));
  const { inputTokens, outputTokens } = res.usage;
  console.log({ stop: res.stopReason, inputTokens, outputTokens });
  return res.output.message.content[0].text;
}`,
    v: seq(
      "The API's role is allowed to invoke one model; Converse sends messages and returns text plus token usage.",
      ["Node API (task role)", "IAM", "Bedrock runtime", "Model"],
      [
        [0, 2, "Converse(modelId, system, messages, maxTokens 300)", "Signed with the task role's temporary credentials."],
        [2, 1, "bedrock:InvokeModel on this model?", "IAM evaluates the role's policy."],
        [2, 3, "prompt", "Bedrock runs the model; your data is not used to train the provider's models."],
        [3, 2, "tokens", "", "r"],
        [2, 0, "output.message + stopReason + usage {in, out}", "Log the usage: it is exactly what you pay for.", "r"],
      ],
    ),
  },
  {
    t: "Choosing a model, and what tokens cost",
    lv: 1,
    s: `Bedrock charges {{on-demand}} per {{input}} and {{output token}}, at different rates per model; output tokens usually cost several times more. Bigger models reason better and cost more; small fast models are fine for classification, extraction and short answers. {{Cross-Region inference profiles}} (Geo or Global) route requests across Regions for higher throughput. To cut cost: send fewer tokens (tight prompts, retrieve only the top chunks), choose the smallest model that passes your evaluation set, use {{prompt caching}} for long repeated prefixes on supported models, {{batch inference}} for offline jobs (lower price), and cap {{maxTokens}}. Drag the sliders: the prices are adjustable examples — look up your model's current price.`,
    r: `Build a small evaluation set of real questions first; then try two or three models on it and pick on quality, latency and cost together.`,
    i: `Estimate the monthly cost of an assistant with 5,000 questions a day, 2,000 input and 300 output tokens each. What are three ways to cut it?`,
    v: bars(
      "Cost = requests × (input tokens × input price + output tokens × output price): RAG context is usually the biggest lever.",
      [["input tokens (USD / month)", "cin"], ["output tokens (USD / month)", "cout"], ["total (USD / month)", "cin+cout"]],
      {
        max: 1200,
        params: [par("q", "questions per day", 500, 20000, 500, 5000), par("ti", "input tokens per question", 200, 8000, 100, 2000), par("to", "output tokens per answer", 50, 1500, 50, 300), par("pi", "example input price (USD / 1M)", 0.1, 5, 0.1, 1), par("po", "example output price (USD / 1M)", 0.4, 25, 0.2, 5)],
        defs: [["cin", "30*q*ti*pi/1000000"], ["cout", "30*q*to*po/1000000"]],
        readout: ["{q} questions/day × 30 days = {30*q} requests", "input {round(cin)} USD + output {round(cout)} USD = {round(cin+cout)} USD / month"],
        steps: [["Baseline: 2,000-token prompts, 300-token answers → about 525 USD a month.", { q: 5000, ti: 2000, to: 300, pi: 1, po: 5 }], ["Retrieve fewer, tighter chunks (800 input tokens): about 345 USD.", { ti: 800 }], ["A smaller model at a fifth of the price: about 69 USD.", { pi: 0.2, po: 1 }]],
      },
    ),
  },
  {
    t: "Streaming answers to the React app",
    lv: 2,
    s: `A model writing 300 tokens can take several seconds; users should see words appear immediately. {{ConverseStream}} returns an event stream: {{messageStart}}, many {{contentBlockDelta}} events with text fragments, {{messageStop}} with the stop reason, and {{metadata}} with token usage. The Node API forwards fragments to the browser as {{Server-Sent Events}} (or a streamed HTTP response); React appends them to the message as they arrive. Lambda Web Functions and containers stream naturally; Lambda event functions need response streaming enabled. Handle client disconnects (stop reading so you stop paying) and set a timeout.`,
    r: `Stream to the user, but log the full answer and usage when the stream ends for evaluation and cost tracking.`,
    i: `How would you stream a Bedrock response from a Node API to a React UI? What changes for cost and error handling?`,
    c: `// Express route: stream a Bedrock answer as Server-Sent Events
import { BedrockRuntimeClient, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
const bedrock = new BedrockRuntimeClient({});

app.post("/api/assistant", requireUser, async (req, res) => {
  res.set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache" });
  const out = await bedrock.send(new ConverseStreamCommand({
    modelId: process.env.MODEL_ID,
    messages: [{ role: "user", content: [{ text: req.body.question }] }],
    inferenceConfig: { maxTokens: 500 },
  }));
  for await (const ev of out.stream) {
    if (req.destroyed) break;                                       // user left: stop paying
    if (ev.contentBlockDelta?.delta?.text) res.write(\`data: \${JSON.stringify(ev.contentBlockDelta.delta.text)}\\n\\n\`);
    if (ev.metadata) console.log("usage", ev.metadata.usage);
  }
  res.end();
});`,
    v: seq(
      "Fragments flow from the model to the browser as they are generated; usage arrives at the end.",
      ["React", "Node API", "Bedrock"],
      [
        [0, 1, "POST /api/assistant (EventSource / fetch stream)", "The user asks a question."],
        [1, 2, "ConverseStream", ""],
        [2, 1, "contentBlockDelta 'The'", "The first tokens arrive within a fraction of a second.", "r"],
        [1, 0, "data: \"The\"", "React renders immediately."],
        [2, 1, "… deltas … messageStop · metadata(usage)", "Stop reason and token counts arrive last.", "r"],
        [1, 0, "stream ends", "The API logs the full answer and its usage."],
      ],
    ),
  },
  {
    t: "Knowledge Bases: managed RAG",
    lv: 1,
    s: `A model does not know your catalogue, shipping policy or return rules. {{Retrieval-augmented generation}} fixes that: find the relevant passages, put them in the prompt, and ask the model to answer only from them, with citations. {{Amazon Bedrock Knowledge Bases}} runs the whole pipeline: it {{ingests}} documents from S3 (and other connectors), {{chunks}} them, creates {{embeddings}} with a model such as Titan Text Embeddings V2, stores vectors in a vector store, and at query time {{Retrieve}} returns the best chunks or {{RetrieveAndGenerate}} returns a grounded answer with source citations. You choose chunking, the embedding model, metadata filters and the vector store; you {{sync}} when documents change.`,
    r: `Attach metadata (category, language, audience) to documents and filter by it at query time; never retrieve content the user is not allowed to see.`,
    i: `Walk through what happens at ingestion and at query time in a Bedrock Knowledge Base. How do you keep it up to date?`,
    c: `import { BedrockAgentRuntimeClient, RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";
const kb = new BedrockAgentRuntimeClient({});

const res = await kb.send(new RetrieveAndGenerateCommand({
  input: { text: "Can I return shoes I wore once?" },
  retrieveAndGenerateConfiguration: {
    type: "KNOWLEDGE_BASE",
    knowledgeBaseConfiguration: {
      knowledgeBaseId: process.env.KB_ID,
      modelArn: process.env.MODEL_ARN,
      retrievalConfiguration: { vectorSearchConfiguration: { numberOfResults: 4 } },
    },
  },
}));
console.log(res.output.text);
for (const c of res.citations ?? [])
  for (const ref of c.retrievedReferences) console.log("source:", ref.location?.s3Location?.uri);`,
    v: arch(
      "Ingest once (chunk → embed → store); at question time retrieve the closest chunks and let the model answer from them with citations.",
      [5, 2],
      [
        svc("s3", 0, 0, "Policies, product manuals and FAQs as PDF, HTML and Markdown.", { label: "Docs bucket", sub: "source files" }),
        svc("kb", 1, 0, "Chunks each document (fixed, semantic or hierarchical) and calls the embedding model."),
        svc("vec", 2, 0, "Holds one vector per chunk plus text and metadata."),
        svc("react", 0, 1, "The shopper types a question in the assistant panel."),
        svc("ecs", 1, 1, "The API calls RetrieveAndGenerate with the question and a metadata filter.", { label: "Node API", sub: "assistant route" }),
        svc("bedrock", 3, 1, "The generation model receives the question plus the retrieved chunks and answers with citations."),
      ],
      [["s3", "kb", "sync"], ["kb", "vec", "embeddings"], "react>ecs", ["ecs", "kb", "RetrieveAndGenerate"], ["kb", "bedrock", "question + chunks"]],
      {
        "Ingestion (sync)": [
          ["s3", "kb", "A sync job reads new and changed documents from the bucket."],
          ["kb", "kb", "Each document is split into chunks of a few hundred tokens."],
          ["kb", "vec", "Each chunk is embedded and stored with its text and metadata."],
        ],
        "A shopper asks": [
          ["react", "ecs", "'Can I return shoes I wore once?'"],
          ["ecs", "kb", "RetrieveAndGenerate: embed the question, find the 4 nearest chunks."],
          ["kb", "vec", "Vector search returns the returns-policy chunks."],
          ["kb", "bedrock", "The model answers only from those chunks…"],
          ["bedrock", "ecs", "…with citations pointing to {{returns-policy.pdf}}, which React shows as sources."],
        ],
      },
    ),
  },
  {
    t: "Vector stores on AWS",
    lv: 2,
    s: `Knowledge Bases (and your own RAG code) need somewhere to keep embeddings. {{Amazon OpenSearch Serverless}} is the quick-create default with fast k-NN search and hybrid keyword + vector search. {{Aurora PostgreSQL with pgvector}} keeps vectors next to relational data and supports SQL filters and HNSW indexes — natural if you already run Postgres. {{Amazon S3 Vectors}} stores vector indexes in S3 vector buckets at much lower cost, with sub-second queries, best for large, infrequently queried collections. Knowledge Bases also connect to Neptune Analytics (GraphRAG), OpenSearch managed clusters, and third-party stores (Pinecone, Redis Enterprise Cloud, MongoDB Atlas). The choice rests on latency needs, query volume, filtering and what your team already operates.`,
    r: `ShopNest starts with S3 Vectors for a small, cheap catalogue assistant and would move to OpenSearch Serverless if it needs hybrid search at high query rates.`,
    i: `Compare OpenSearch Serverless, Aurora pgvector and S3 Vectors as a RAG vector store.`,
    v: compare(
      "Fast and feature-rich, close to your SQL, or cheapest at scale — pick by query rate, filters and what you already run.",
      ["OpenSearch Serverless", "Aurora PostgreSQL pgvector", "S3 Vectors"],
      [
        ["Strength", "Low latency, hybrid search", "Vectors + SQL + joins", "Lowest storage cost, huge scale"],
        ["Query latency", "Milliseconds", "Milliseconds (HNSW)", "Sub-second"],
        ["Best for", "High-traffic search", "Apps already on Postgres", "Large, infrequently queried sets"],
        ["Operations", "Serverless (capacity units)", "A database to run", "Serverless, no capacity"],
      ],
    ),
  },
  {
    t: "Guardrails for safe answers",
    lv: 2,
    s: `{{Amazon Bedrock Guardrails}} apply your safety rules to both the user's input and the model's output, independently of which model you use. A guardrail can combine {{content filters}} (hate, insults, sexual, violence, misconduct, and {{prompt attacks}} such as jailbreaks and injection), {{denied topics}} described in plain language ("investment advice"), {{word filters}}, {{sensitive information filters}} that block or mask PII such as emails and card numbers, and {{contextual grounding checks}} that flag answers not supported by the retrieved sources. Attach it with {{guardrailConfig}} in Converse, inside Knowledge Bases and agents, or call {{ApplyGuardrail}} on any text. When it intervenes you return a configured safe message.`,
    r: `ShopNest's assistant guardrail: deny topics outside shopping, mask emails and phone numbers, block prompt attacks, and require grounding against retrieved policy text.`,
    i: `How do you stop a shopping assistant from giving medical advice or leaking customer emails? Where does the guardrail run?`,
    c: `const res = await bedrock.send(new ConverseCommand({
  modelId: process.env.MODEL_ID,
  messages,
  guardrailConfig: {
    guardrailIdentifier: process.env.GUARDRAIL_ID,
    guardrailVersion: "3",
    trace: "enabled",                 // see which policy fired, for tuning
  },
}));
if (res.stopReason === "guardrail_intervened") {
  // the output already contains the guardrail's configured blocked message
}`,
    v: flow(
      "The guardrail checks the question before the model sees it and the answer before the user does.",
      "row",
      ["User input|question", "Input guardrail|topics · attacks · PII|w", "Model|generates", "Output guardrail|filters · grounding|w", "Answer|safe|g"],
      [[0, 1], [1, 2, "pass"], [2, 3], [3, 4, "pass"]],
      [0, 1, 2, 3],
      ["A question arrives — possibly with an injection attempt or someone's card number.", "Input checks: prompt-attack filter, denied topics, PII masking. A blocked input never reaches the model (and costs no model tokens).", "The model answers from the retrieved context.", "Output checks: content filters, PII masking, and grounding against the sources before anything is shown."],
    ),
  },
  {
    t: "Tool use and agents: Bedrock agents and AgentCore",
    lv: 2,
    s: `With {{tool use}} you describe functions in {{toolConfig}} (name, description, JSON schema); the model replies with {{stopReason: tool_use}} and the arguments; your code runs the function ({{getOrderStatus(981)}}) and sends the result back, looping until the model answers. That loop is an {{agent}}. Bedrock offers managed {{Agents}} (action groups backed by Lambda or OpenAPI, plus Knowledge Bases), and {{Amazon Bedrock AgentCore}} for agents built with any framework (LangGraph, Strands Agents, CrewAI, the OpenAI Agents SDK…) and any model: {{Runtime}} (isolated, serverless sessions), {{Memory}}, {{Gateway}} (turns APIs and Lambda functions into MCP tools), {{Identity}}, {{Code Interpreter}}, {{Browser}}, {{Observability}}, {{Policy}} (deterministic rules on every tool call) and {{Evaluations}}. Tools must enforce permissions themselves — the agent acts with the user's rights, not more.`,
    r: `Expose read-only tools first (order status, product search); require explicit user confirmation for actions with side effects (cancel order, refund).`,
    i: `Explain the tool-use loop. What does AgentCore Gateway do, and why must tools check permissions themselves?`,
    v: arch(
      "The model decides which tool to call; your code (or AgentCore) runs it with the user's permissions and feeds the result back.",
      [5, 3],
      [
        svc("react", 0, 1, "Shopper: 'Where is my order 981, and can I change the address?'"),
        svc("agentcore", 1, 1, "AgentCore Runtime hosts the agent loop in an isolated session; Memory keeps the conversation."),
        svc("bedrock", 2, 0, "The model plans: call {{get_order_status(981)}}, then answer."),
        svc("apigw", 3, 1, "AgentCore Gateway exposes ShopNest's order API and Lambda functions as MCP tools; Policy checks every call.", { label: "Gateway (MCP)", sub: "tools + policy" }),
        svc("ecs", 4, 0, "{{GET /orders/981}} with the user's identity — returns only the user's own orders.", { label: "Orders API", sub: "read-only tool" }),
        svc("lambda", 4, 2, "{{change_address}} has side effects: the agent must ask the user to confirm first.", { label: "change_address", sub: "needs confirm" }),
      ],
      ["react>agentcore", "agentcore>bedrock", "agentcore>apigw", "apigw>ecs", "apigw>lambda"],
      {
        "Answer with a tool": [
          ["react", "agentcore", "The question arrives with the user's token."],
          ["agentcore", "bedrock", "The model replies {{tool_use → get_order_status(981)}}."],
          ["agentcore", "apigw", "The runtime calls the tool through the gateway; policy allows read-only calls."],
          ["apigw", "ecs", "The orders API checks the user owns order 981 and returns 'shipped, arriving Friday'."],
          ["agentcore", "bedrock", "The tool result goes back; the model writes the final answer."],
          ["apigw", "lambda", "Changing the address would need the user's explicit confirmation first.", "bad"],
        ],
      },
    ),
  },
  {
    t: "SageMaker AI: your own models",
    lv: 3,
    s: `When no foundation model or AI service fits — a demand-forecasting model trained on your sales history, a fraud model on your transactions, a fine-tuned open-weights model you must host yourself — {{Amazon SageMaker AI}} covers the ML lifecycle: notebooks and {{SageMaker Studio}} for exploration, managed {{training jobs}} on CPU/GPU fleets reading data from S3, hyperparameter tuning, a {{model registry}}, {{Pipelines}} for repeatable training, and hosting as {{real-time}}, {{serverless}}, {{asynchronous}} endpoints or {{batch transform}}. You pay for the instances while they run, so stop notebooks and use serverless or batch endpoints for spiky or offline work. Monitor deployed models for data drift.`,
    r: `ShopNest trains a weekly demand forecast as a SageMaker pipeline and scores all products with batch transform overnight — no always-on endpoint needed.`,
    i: `Real-time vs serverless vs asynchronous vs batch inference on SageMaker AI — when would you use each?`,
    v: flow(
      "Data in S3 → training job → registered model → the cheapest hosting option that meets the latency need.",
      "row",
      ["S3 data|sales history", "Training job|GPU/CPU fleet|i", "Model registry|approved v12", "Endpoint or batch|real-time · serverless · async · batch|g"],
      [[0, 1], [1, 2], [2, 3]],
      [0, 1, 2],
      ["A SageMaker Pipeline starts a training job that reads the latest sales history from S3.", "The trained model and its metrics are registered; a person or a rule approves it.", "Deploy to the cheapest fit: batch transform overnight for forecasts, a real-time endpoint only if the shop needs answers in milliseconds."],
    ),
  },
  {
    t: "Ready-made AI services",
    lv: 1,
    s: `Many "AI features" need no prompt engineering or training at all. {{Amazon Rekognition}} labels images, detects text and faces, and {{moderates}} unsafe content ({{DetectModerationLabels}}). {{Amazon Textract}} extracts text, forms, tables and, with {{AnalyzeExpense}}, invoice and receipt fields (vendor, total, line items). {{Amazon Transcribe}} turns audio into text with timestamps and speaker labels; {{Amazon Polly}} speaks text. {{Amazon Comprehend}} finds entities, key phrases, sentiment and PII; {{Amazon Translate}} translates. They are pay-per-use, IAM-controlled and called with the same SDK as everything else, and they make a good first step before trying a general model.`,
    r: `ShopNest calls {{DetectModerationLabels}} from the upload Lambda and rejects photos above a confidence threshold; supplier invoices go through {{AnalyzeExpense}}.`,
    i: `How would you automatically reject inappropriate product photos uploaded by sellers?`,
    c: `import { RekognitionClient, DetectModerationLabelsCommand } from "@aws-sdk/client-rekognition";
const rek = new RekognitionClient({});

export async function isSafe(bucket, key) {
  const { ModerationLabels } = await rek.send(new DetectModerationLabelsCommand({
    Image: { S3Object: { Bucket: bucket, Name: key } },
    MinConfidence: 80,
  }));
  return ModerationLabels.length === 0;     // anything found at ≥ 80 % → send to review
}`,
    v: compare(
      "One API call per task: pick the service whose job matches yours before reaching for a general model.",
      ["Input", "Output", "ShopNest use"],
      [
        ["Rekognition", "Image / video", "Labels, text, faces, unsafe content", "Moderate seller photos"],
        ["Textract", "Scan / PDF", "Text, forms, tables, invoice fields", "Read supplier invoices"],
        ["Transcribe", "Audio", "Text with timestamps, speakers", "Support-call notes"],
        ["Polly", "Text", "Natural speech audio", "Voice order updates"],
        ["Comprehend", "Text", "Entities, sentiment, PII", "Review sentiment"],
        ["Translate", "Text", "Text in another language", "Catalogue in 5 languages"],
      ],
    ),
  },
  {
    t: "Production AI on AWS: security, evaluation, cost",
    lv: 2,
    s: `Shipping an AI feature adds checks to the usual production list. {{Security}}: least-privilege IAM on specific model ARNs, VPC endpoints (PrivateLink) for Bedrock, prompt-injection defences (Guardrails, never letting retrieved text act as instructions), tools that enforce the user's permissions. {{Quality}}: an evaluation set of real questions scored on every prompt or model change (Bedrock evaluations or your own harness), and user feedback captured. {{Observability}}: log prompts, retrieved sources, answers, latency and token usage (model invocation logging to S3/CloudWatch, with PII care). {{Cost}}: per-feature dashboards, maxTokens limits, rate limits per user, caching and batch where possible. {{Fallbacks}}: timeouts, retries on throttling, and a sensible non-AI path.`,
    r: `Treat prompts and model ids as versioned configuration, roll them out like code (canary), and keep the evaluation suite in CI.`,
    i: `What would you check before launching an LLM feature to all users? How do you know a prompt change made things better, not worse?`,
    v: layers(
      "An AI feature is production-ready when it is secured, measured, observable, budgeted and has a fallback.",
      ["Security|Scoped IAM, PrivateLink, Guardrails, tools enforce user permissions|b", "Evaluation|Golden question set in CI; compare before every change|i", "Observability|Invocation logs, sources, latency, tokens per request", "Cost control|maxTokens, per-user rate limits, caching, batch, budgets|w", "Fallback|Timeouts, retries with backoff, a non-AI path|g"],
    ),
  },
];

