import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- building-with-claude`.
   No network call is made: requests are built as dictionaries and responses are scripted.
   Facts about the Claude API, Claude Code and GitHub Copilot were checked against the official
   documentation on 2026-10-16; products change quickly, so confirm details in the docs. */

export const api: ConceptDef[] = [
  {
    t: "The Messages API: one request, one response",
    lv: 1,
    s: `Everything starts with one HTTP call: {{POST /v1/messages}} with headers x-api-key and anthropic-version: 2023-06-01. The body needs three things: the {{model}} (for example claude-sonnet-5-5), {{max_tokens}} (the cap on generated tokens) and {{messages}}, a list of turns with a role (user or assistant) and content. The system prompt is a separate top-level {{system}} field — there is no "system" role inside messages. The response contains a list of {{content blocks}} (text, tool_use, …), a {{stop_reason}} (end_turn, max_tokens, tool_use, stop_sequence …) and a {{usage}} object with the token counts you are billed for.`,
    r: `The API is stateless: each request must carry the whole conversation you want the model to see.`,
    i: `Which three fields must every Messages API request contain, and where does the system prompt go?`,
    c: py`
import json

request = {
    "model": "claude-sonnet-5-5",
    "max_tokens": 1024,
    "system": "You are a concise assistant for ACME support.",
    "messages": [{"role": "user", "content": "How do I reset my password?"}],
}
response = {
    "content": [{"type": "text", "text": "Open Settings > Security and choose Reset password."}],
    "stop_reason": "end_turn",
    "usage": {"input_tokens": 31, "output_tokens": 14},
}
print(json.dumps(request)[:90] + "...")
print(response["stop_reason"], response["usage"])`,
    v: rowflow("One Messages API call.", ["Your app builds the request", "POST /v1/messages", "Claude generates", "Response with content blocks", "Check stop_reason", "Read usage"], [
      "model, max_tokens, messages (and optionally system, tools).",
      "Headers carry the API key and API version.",
      "Tokens are produced until a stop condition.",
      "Text and tool_use blocks.",
      "end_turn, max_tokens, tool_use …",
      "input_tokens and output_tokens drive the bill.",
    ]),
  },
  {
    t: "Choosing a model: capability, speed and price",
    lv: 1,
    s: `Current Claude models share a 1M-token context window and up to 128K output tokens; they differ in intelligence, speed and price (per million tokens, from the pricing page on 2026-10-16): {{Fable 5.1}} $10 input / $50 output — demanding reasoning and long-horizon agentic work; {{Opus 5.5}} $4 / $20 — long-running agentic coding and knowledge work, the suggested starting point; {{Sonnet 5.5}} $2 / $10 — the best mix of speed and intelligence; {{Haiku 5.5}} from $0.10 / $0.50 — high-volume, latency-sensitive classification, extraction and routing. Pick by evaluating on your own task: start with a strong model to find out what is possible, then try cheaper ones.`,
    r: `Model IDs are pinned snapshots: new capabilities arrive as new IDs, so plan a migration path and re-run your evaluations.`,
    i: `Which model would you try first for high-volume classification and which for demanding long-horizon agent work?`,
    c: py`
prices = {  # USD per million tokens (input, output) as listed on 2026-10-16
    "claude-fable-5-1": (10.0, 50.0),
    "claude-opus-5-5": (4.0, 20.0),
    "claude-sonnet-5-5": (2.0, 10.0),
    "claude-haiku-5-5": (0.10, 0.50),
}
def cost(model, tin, tout):
    pin, pout = prices[model]
    return tin / 1e6 * pin + tout / 1e6 * pout

for m in prices:
    print(f"{m:18s} {cost(m, 2000, 500):.5f} per request (2,000 in / 500 out)")`,
    v: bars("Cost of one request (2,000 input + 500 output tokens), in thousandths of a dollar.", [["Fable 5.1", "45"], ["Opus 5.5", "18"], ["Sonnet 5.5", "9"], ["Haiku 5.5", "0.45"]], {
      max: 50,
    }),
  },
  {
    t: "Estimating cost and budgeting a workload",
    lv: 1,
    s: `Cost = input tokens × input price + output tokens × output price. With Sonnet 5.5 ($2 / $10 per million) a request of 2,000 input and 500 output tokens costs 2,000/10⁶ × 2 + 500/10⁶ × 10 = $0.004 + $0.005 = $0.009; 100,000 such requests cost $900. The same load on Haiku 5.5 would cost about $45, on Opus 5.5 $1,800. Output tokens are five times dearer than input here, so asking for shorter answers often saves more than shortening the prompt. Track the {{usage}} object of every response, aggregate cost per feature and per user, and set spending limits so a bug cannot run up a bill.`,
    r: `Estimate per successful task, including retries and agent loops, not just per request.`,
    i: `Compute the cost of 100,000 requests of 2,000 input and 500 output tokens on Sonnet 5.5.`,
    c: py`
pin, pout = 2.0, 10.0
per_request = 2000 / 1e6 * pin + 500 / 1e6 * pout
print(round(per_request, 4), round(per_request * 100000, 2))
for out in (100, 500, 1000):
    print(out, round(2000 / 1e6 * pin + out / 1e6 * pout, 4))`,
    v: plot("Cost of one Sonnet 5.5 request against the number of output tokens (2,000 input tokens).", {
      x: [0, 2000], y: [0, 0.025], labels: ["output tokens", "cost (USD)"],
      params: [par("i", "input tokens", 500, 20000, 500, 2000)],
      readout: ["{i} in + 500 out = {i/1000000*2+500/1000000*10:4} USD"],
      steps: [["2,000 in, 500 out: $0.009.", { i: 2000 }], ["A long 20,000-token prompt: $0.045.", { i: 20000 }]],
    }, [curve("i/1000000*2+x/1000000*10", { c: "accent" })]),
  },
  {
    t: "System prompts, roles and multi-turn conversations",
    lv: 1,
    s: `A conversation is a list of alternating {{user}} and {{assistant}} messages; the application appends each new turn and re-sends the whole list — Claude keeps no memory between calls. The {{system}} prompt holds the standing instructions: role, tone, rules, output format, what to do when unsure. Cost grows with the conversation: with a 500-token system prompt and 200 new tokens per turn, turn 10 sends 500 + 9 × 200 = 2,300 input tokens. Control it by summarising or dropping old turns, caching the stable prefix (next concepts) and keeping the system prompt specific rather than long.`,
    r: `Put stable content first (system prompt, reference material) and the changing question last: that also makes caching work.`,
    i: `How many input tokens does turn 10 send with a 500-token system prompt and 200 tokens added per turn?`,
    c: py`
messages = []
def turn(user_text, assistant_text):
    messages.append({"role": "user", "content": user_text})
    messages.append({"role": "assistant", "content": assistant_text})

for i in range(3):
    turn(f"question {i}", f"answer {i}")
print(len(messages), [m["role"] for m in messages])
system, per_turn = 500, 200
print([system + per_turn * t for t in (0, 4, 9)])`,
    v: plot("Input tokens of each request as the conversation grows (500-token system prompt).", {
      x: [1, 30], y: [0, 7000], labels: ["turn", "input tokens"],
      params: [par("p", "tokens added per turn", 50, 400, 50, 200)],
      readout: ["turn 10: {500+p*9} input tokens"],
      steps: [["200 per turn: 2,300 at turn 10.", { p: 200 }]],
    }, [curve("500+p*(x-1)", { c: "accent" })]),
  },
  {
    t: "Streaming: show tokens as they arrive",
    lv: 2,
    s: `A long answer can take many seconds. With {{streaming}} (stream: true) the API sends the response as server-sent events while it is generated, so the user sees the first words almost at once. The event sequence is, in simplified form: message_start → content_block_start → a series of content_block_delta events carrying text pieces → content_block_stop → message_delta (stop_reason and final usage) → message_stop. Your client concatenates the text deltas. Perceived latency becomes the {{time to first token}}, not the total time: a 500-token answer at 50 tokens/s takes 10 s in total but starts after well under a second. Handle partial JSON carefully when streaming tool inputs, and be ready for mid-stream errors.`,
    r: `Always stream user-facing answers longer than a sentence or two; keep non-streaming calls for back-end jobs.`,
    i: `Why does streaming improve perceived latency without changing total time?`,
    c: py`
events = [
    {"type": "message_start"},
    {"type": "content_block_start", "index": 0},
    {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Open "}},
    {"type": "content_block_delta", "index": 0, "delta": {"type": "text_delta", "text": "Settings."}},
    {"type": "content_block_stop", "index": 0},
    {"type": "message_delta", "delta": {"stop_reason": "end_turn"}, "usage": {"output_tokens": 4}},
    {"type": "message_stop"},
]
text = "".join(e["delta"]["text"] for e in events if e["type"] == "content_block_delta")
print(repr(text))
ttft, tps, n = 0.6, 50, 500
print(ttft + n / tps, "s total;", ttft, "s until the first word")`,
    v: rowflow("A streamed response.", ["message_start", "content_block_start", "content_block_delta × n", "content_block_stop", "message_delta", "message_stop"], [
      "The message begins.",
      "A text block opens.",
      "Text pieces arrive; append them.",
      "The block is complete.",
      "stop_reason and final usage.",
      "The stream ends.",
    ]),
  },
  {
    t: "Tool use: the request, the call and the result",
    lv: 2,
    s: `You describe tools in the request ({{tools}}: name, description, an {{input_schema}} in JSON Schema). When Claude decides a tool is needed the response has stop_reason "tool_use" and one or more {{tool_use}} blocks containing an id, the tool name and the input arguments. {{Your code executes the tool}} and replies with a user message whose content has a {{tool_result}} block carrying the same tool_use_id. Claude then continues — possibly calling another tool. Client tools (your functions, plus Anthropic-schema tools such as bash and the text editor) run in your application; {{server tools}} (web search, web fetch, code execution) run on Anthropic's side and return results directly. Tool descriptions count as input tokens.`,
    r: `Return errors as tool_result content (is_error) so the model can recover instead of failing the whole request.`,
    i: `After a response with stop_reason "tool_use", what must the next request contain?`,
    c: py`
import json

tools = [{"name": "get_weather", "description": "Get the current weather for a city.",
          "input_schema": {"type": "object", "properties": {"city": {"type": "string"}}, "required": ["city"]}}]
messages = [{"role": "user", "content": "Weather in Vilnius?"}]
assistant = [{"type": "tool_use", "id": "toolu_01", "name": "get_weather", "input": {"city": "Vilnius"}}]
registry = {"get_weather": lambda city: f"4 C, cloudy in {city}"}
block = assistant[0]
result = registry[block["name"]](**block["input"])
messages += [{"role": "assistant", "content": assistant},
             {"role": "user", "content": [{"type": "tool_result", "tool_use_id": block["id"], "content": result}]}]
print(json.dumps(messages[-1]))
print(len(messages), "messages in the second request")`,
    v: rowflow("The tool-use round trip.", ["Request with tools", "stop_reason: tool_use", "Run the tool in your code", "Send tool_result", "Final text answer"], [
      "tools: name, description, input_schema.",
      "The response holds a tool_use block with id and input.",
      "Your function does the work.",
      "A user message with tool_use_id and content.",
      "Claude answers using the result (stop_reason end_turn).",
    ]),
  },
  {
    t: "Controlling tools: tool_choice, parallel calls, strict schemas",
    lv: 2,
    s: `{{tool_choice}} steers tool use: {"type": "auto"} (default — Claude decides), "any" (must use some tool), "tool" with a name (must use that one) or none. With {"type": "auto", "disable_parallel_tool_use": true} Claude makes at most one call per turn; otherwise it may return several tool_use blocks at once — run independent ones concurrently and return all results in one user message, each with its own tool_use_id. Add {{strict: true}} to a tool definition to guarantee the call matches your schema. Each request that includes tools also carries a small automatic tool-use system prompt (about 286 tokens on the current Opus 5.5, Sonnet 5.5 and Haiku 5.5 models), plus the tokens of your tool descriptions.`,
    r: `Few, well-described tools beat many overlapping ones; the tool list is input you pay for on every call.`,
    i: `When would you set disable_parallel_tool_use, and what must you return for parallel calls?`,
    c: py`
choice_auto = {"type": "auto"}
choice_single = {"type": "auto", "disable_parallel_tool_use": True}
choice_force = {"type": "tool", "name": "get_weather"}
print(choice_auto, choice_single, choice_force, sep="\n")
calls = [{"id": "t1", "name": "get_weather"}, {"id": "t2", "name": "get_time"}]
results = [{"type": "tool_result", "tool_use_id": c["id"], "content": "ok"} for c in calls]
print([r["tool_use_id"] for r in results])`,
    v: compare("tool_choice options.", ["Behaviour"], [
      ["auto (default)", "Claude decides whether to call a tool"],
      ["any", "must call one of the tools"],
      ["tool + name", "must call that specific tool"],
      ["none", "no tool calls"],
      ["disable_parallel_tool_use", "at most one call per turn"],
    ]),
  },
  {
    t: "Prompt caching: pay once for a stable prefix",
    lv: 2,
    s: `When many requests share a long prefix (system prompt, documents, tool definitions), mark it with {{cache_control: {"type": "ephemeral"}}}. The first request {{writes}} the cache at a premium — 1.25× the base input price for the default 5-minute lifetime, 2× for a 1-hour lifetime — later requests {{read}} it at a fraction: 0.1× of base input price (0.05× on Opus 5.5 and Sonnet 5.5, 0.025× on Fable 5.1). Prompts below the minimum length (512 tokens on the current models) are simply not cached. The response usage shows cache_creation_input_tokens, cache_read_input_tokens and input_tokens (the uncached rest). Example on Sonnet 5.5 ($2): a 10,000-token prefix used 20 times costs $0.40 uncached and $0.044 cached — about 9× cheaper.`,
    r: `Each use refreshes the lifetime for free; put the changing part (the user question) after the cached prefix.`,
    i: `Compute the cost of a 10,000-token prefix sent 20 times on Sonnet 5.5 with and without caching.`,
    c: py`
base, tokens, n = 2.0, 10000, 20
uncached = n * tokens / 1e6 * base
cached = tokens / 1e6 * base * 1.25 + (n - 1) * tokens / 1e6 * base * 0.05
print(round(uncached, 3), round(cached, 4), round(uncached / cached, 1))
one_hour = tokens / 1e6 * base * 2 + (n - 1) * tokens / 1e6 * base * 0.05
print(round(one_hour, 4))
print("break-even after", 1, "read:", round(1.25 + 0.05, 2), "<", 2.0)`,
    v: plot("Cumulative cost of a 10,000-token prefix on Sonnet 5.5: uncached versus cached (5-minute cache).", {
      x: [1, 30], y: [0, 0.65], labels: ["number of requests", "cost (USD)"],
    }, [curve("x*10000/1000000*2", { c: "bad", label: "no cache" }), curve("10000/1000000*2*1.25+(x-1)*10000/1000000*2*0.05", { c: "good", label: "cached" })]),
  },
  {
    t: "Batch processing: half price for asynchronous work",
    lv: 1,
    s: `If nothing needs an answer right now — classifying a backlog, summarising documents, running an evaluation set — use the {{Message Batches API}}: you submit many Messages requests together, they are processed asynchronously (most batches finish in under an hour) and you retrieve the results later. {{Batch requests cost 50% less}} than standard calls. 100,000 requests of 2,000 input and 500 output tokens on Sonnet 5.5 cost $900 normally and $450 as a batch. Batching combines with prompt caching for shared prefixes. Use it for offline, retry-tolerant work; keep the synchronous API for interactive features.`,
    r: `Design batch jobs so that each request has an id of your own: you match results to inputs by that id.`,
    i: `Compute the standard and the batch price of 100,000 requests at 0.009 each.`,
    c: py`
per_request = 2000 / 1e6 * 2.0 + 500 / 1e6 * 10.0
print(round(per_request * 100000, 2), round(per_request * 100000 * 0.5, 2))
batch = [{"custom_id": f"doc-{i}", "params": {"model": "claude-haiku-5-5", "max_tokens": 200,
          "messages": [{"role": "user", "content": f"Classify document {i}"}]}} for i in range(3)]
print([b["custom_id"] for b in batch])`,
    v: bars("Cost of 100,000 requests (Sonnet 5.5, 2,000 in / 500 out).", [["synchronous", "900"], ["batch (−50%)", "450"]], {
      max: 950,
    }),
  },
  {
    t: "Thinking and effort: how hard the model works",
    lv: 2,
    s: `Current Claude models can reason before answering. {{Adaptive thinking}} lets the model decide how much to think, steered by the {{effort}} parameter (low, medium, high, with higher levels on some models). Defaults on the API: Fable 5.1 and Sonnet 5.5 use high effort, Opus 5.5 and Haiku 5.5 use medium; you can set it explicitly. More thinking means more output tokens (billed), more latency and usually better answers on hard problems. Use low effort for simple extraction and routing, higher effort for multi-step reasoning, code and planning, and measure the accuracy-versus-cost curve on your own tasks. The older manual "extended thinking" budget is deprecated or not accepted on newer models.`,
    r: `Tune effort before switching to a bigger model: it is the cheapest quality dial.`,
    i: `Why can raising the effort level raise the bill even though the price per token is unchanged?`,
    c: py`
runs = {"low": (400, 0.62), "medium": (900, 0.78), "high": (2200, 0.86)}
for effort, (out_tokens, accuracy) in runs.items():
    cost = 2000 / 1e6 * 2 + out_tokens / 1e6 * 10
    print(f"{effort:6s} accuracy {accuracy:.2f}  cost {cost:.4f}  cost per correct {cost / accuracy:.4f}")`,
    v: compare("Effort levels in practice (illustrative numbers).", ["Typical use", "Trade-off"], [
      ["low", "extraction, classification, routing", "fastest and cheapest"],
      ["medium", "everyday chat, summaries, simple code", "balanced"],
      ["high", "multi-step reasoning, hard code, planning", "slower, more output tokens, higher accuracy"],
    ]),
  },
  {
    t: "Errors, rate limits and reliability",
    lv: 1,
    s: `A production client expects failures. Authentication errors (401) need a fix, not a retry; invalid requests (400) are bugs; rate limits (429) and overload or server errors (5xx, 529) are transient — retry with {{exponential back-off plus jitter}} (1, 2, 4, 8 … seconds, capped) and a maximum attempt count; honour any Retry-After hint. Set client-side timeouts, make retries {{idempotent}} (a repeated request must not repeat a side effect), and keep a fallback (a cheaper model, a queued job, a clear message). Log the request id returned by the API for support. Keep the API key in a secret store, never in source code or a browser.`,
    r: `Rate limits are a normal operating condition: queue work and spread bursts rather than failing users.`,
    i: `Which errors should be retried and which must not?`,
    c: py`
import random

retryable = {429, 500, 502, 503, 529}
def should_retry(status):
    return status in retryable

random.seed(1)
delays = [round(min(2 ** k, 30) * (0.5 + random.random() / 2), 2) for k in range(6)]
print([should_retry(s) for s in (401, 400, 429, 529)], delays)`,
    v: compare("Error handling.", ["Retry?", "Action"], [
      ["401 / 403 authentication", "no", "fix the key or permissions"],
      ["400 invalid request", "no", "fix the request (bug)"],
      ["429 rate limited", "yes, with back-off", "slow down, queue, honour Retry-After"],
      ["5xx / overloaded", "yes, with back-off", "retry, then fall back"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
