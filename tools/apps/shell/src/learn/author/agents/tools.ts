import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- agentic-ai`. */

export const tools: ConceptDef[] = [
  {
    t: "Tool calling: the model asks, your code acts",
    lv: 1,
    s: `A model cannot run code or browse the web by itself; it can only produce text. {{Tool calling}} gives it a way to ask: you describe each tool (name, purpose, parameters as a JSON schema); when the model decides a tool is needed it returns a structured request such as {"tool": "get_weather", "args": {"city": "Vilnius"}} instead of prose. Your program executes the function, and sends the result back as a message; the model continues with that observation. The model never touches your systems directly — your code is the gatekeeper, and everything the model "does" passes through functions you wrote and can check.`,
    r: `Tool results go back into the model's context as text: size, format and trustworthiness of that text matter.`,
    i: `Who actually executes a tool call, and what does the model receive afterwards?`,
    c: py`
import json

registry = {"get_weather": lambda city: {"Vilnius": "4 C, cloudy"}.get(city, "unknown city")}
model_output = '{"tool": "get_weather", "args": {"city": "Vilnius"}}'
request = json.loads(model_output)
result = registry[request["tool"]](**request["args"])
print(request["tool"], "->", result)`,
    v: rowflow("One tool call.", ["Model emits a request", "Your code validates it", "Function runs", "Result as a message", "Model continues"], [
      "A JSON tool name and arguments.",
      "Check the tool exists and the arguments fit the schema.",
      "Your function calls the API or database.",
      "The observation is appended to the context.",
      "It reads the result and decides the next step.",
    ]),
  },
  {
    t: "Designing tools the model can use",
    lv: 2,
    s: `Tool descriptions are prompts. A good tool has a clear {{name}} (verb + object: search_orders), a description that says when to use it and when not to, {{typed parameters}} with examples and enums for fixed choices, and a compact, informative result. Prefer a few well-designed tools to many overlapping ones; make a tool do one job; return only what the model needs (ten fields, not a 50 KB JSON blob); and put hints in error messages ("customer_id must be a 6-digit string, got 'Anna'"). Test by reading the description as a stranger would: if you cannot tell which tool to pick, neither can the model.`,
    r: `Most tool-use failures are caused by ambiguous descriptions, overlapping tools and bloated results.`,
    i: `Name three properties of a well-designed tool.`,
    c: py`
schema = {
    "name": "search_orders",
    "description": "Find a customer's orders by customer id. Use before answering any question about delivery status.",
    "parameters": {
        "type": "object",
        "properties": {
            "customer_id": {"type": "string", "description": "6-digit id, e.g. '482913'"},
            "status": {"type": "string", "enum": ["open", "shipped", "returned"]},
        },
        "required": ["customer_id"],
    },
}
print(schema["name"], list(schema["parameters"]["properties"]), schema["parameters"]["required"])`,
    v: compare("Weak versus strong tool design.", ["Weak", "Strong"], [
      ["Name", "'data' or 'tool1'", "'search_orders'"],
      ["Description", "'gets stuff'", "when to use it and what it returns"],
      ["Parameters", "free text", "typed, enums, examples"],
      ["Result", "entire raw record", "only the fields the model needs"],
      ["Errors", "'failed'", "what was wrong and how to fix it"],
    ]),
  },
  {
    t: "Validate arguments, return errors as observations",
    lv: 2,
    s: `Models make mistakes in arguments: wrong types, missing fields, invented ids. Validate every call before running it, and when it is invalid {{return the error as the tool result}} rather than crashing: the model can read it and correct itself on the next step. Keep the loop safe: limit the number of consecutive failures, never run arguments through eval or shell strings, and treat identifiers as untrusted until checked against your data. A call with {"customer_id": "Anna"} should produce "error: customer_id must be 6 digits" — and the agent then asks the user or searches by name.`,
    r: `Good error messages are cheap training signals at run time: they turn most first-try mistakes into second-try successes.`,
    i: `What should a tool return when the arguments are invalid?`,
    c: py`
import re

def search_orders(customer_id):
    if not re.fullmatch(r"\d{6}", str(customer_id)):
        return {"error": f"customer_id must be 6 digits, got {customer_id!r}"}
    return {"orders": ["A-100", "A-101"]}

print(search_orders("Anna"))
print(search_orders("482913"))`,
    v: rowflow("Self-correction through errors.", ["Bad arguments", "Validation fails", "Error text returned", "Model reads it", "Corrected call"], [
      "customer_id = 'Anna'.",
      "The check says it must be 6 digits.",
      "'customer_id must be 6 digits, got Anna'.",
      "It decides to ask for the id or look it up.",
      "The second call succeeds.",
    ]),
  },
  {
    t: "Retries, timeouts and back-off",
    lv: 2,
    s: `Real tools fail: networks drop, services rate-limit, queries time out. Give every call a {{timeout}}, retry transient errors (timeouts, 429, 5xx) with {{exponential back-off plus jitter}} — waits of 1, 2, 4, 8 … seconds capped at 30 — and never retry blindly on errors that will repeat (invalid input, forbidden). If one attempt succeeds with probability p = 0.7, the expected number of attempts is 1/p = 1.43 and three attempts succeed with probability 1 − 0.3³ = 0.973 (two: 0.91). After the last attempt, return a clear failure to the model so it can choose another route or ask for help.`,
    r: `Retries multiply cost and delay: put a maximum on attempts and on total time per task.`,
    i: `Probability that three attempts at p = 0.7 each succeed at least once?`,
    c: py`
import random

p = 0.7
print(round(1 / p, 2), round(1 - (1 - p) ** 3, 3), round(1 - (1 - p) ** 2, 3))
random.seed(0)
waits = [round(min(2 ** k, 30) * (0.5 + random.random() / 2), 2) for k in range(6)]
print(waits)`,
    v: plot("Chance that at least one of n attempts succeeds.", {
      x: [1, 8], y: [0, 1.05], labels: ["attempts n", "1 − (1 − p)^n"],
      params: [par("p", "per-attempt success p", 0.2, 0.95, 0.05, 0.7)],
      readout: ["three attempts: {1-pow(1-p,3):3}; expected attempts 1/p = {1/p:2}"],
      steps: [["p = 0.7: 97% with three attempts.", { p: 0.7 }], ["p = 0.4: needs more tries.", { p: 0.4 }]],
    }, [curve("1-pow(1-p,x)", { c: "accent" })]),
  },
  {
    t: "Parallel tool calls and dependencies",
    lv: 2,
    s: `When calls do not depend on each other, run them together: the model can request several tools in one turn (look up three customers; search two sources) and your code executes them concurrently. Latency becomes the slowest call, not the sum: calls of 2 s, 3 s and 1 s take 3 s in parallel instead of 6 s. Calls that need an earlier result (fetch the id, then fetch the order) must stay sequential. Return every result with the id of its request so the model can match them, and keep a cap on concurrency to respect rate limits.`,
    r: `Identify independent sub-tasks early: parallelism is the cheapest latency win in an agent.`,
    i: `How long do tool calls of 2 s, 3 s and 1 s take in parallel and in sequence?`,
    c: py`
from concurrent.futures import ThreadPoolExecutor
import time

def slow(name_delay):
    name, delay = name_delay
    time.sleep(delay / 100)
    return name

jobs = [("a", 2), ("b", 3), ("c", 1)]
with ThreadPoolExecutor(max_workers=3) as pool:
    results = list(pool.map(slow, jobs))
print(results, max(d for _, d in jobs), sum(d for _, d in jobs))`,
    v: bars("Time for three independent calls (2 s, 3 s, 1 s).", [["sequential", "6"], ["parallel", "3"]], {
      max: 7,
    }),
  },
  {
    t: "Code execution as a tool",
    lv: 2,
    s: `Letting an agent write and run code is powerful: exact arithmetic, data analysis, file conversion, tests. It is also the riskiest tool. Run model-written code only in a {{sandbox}}: an isolated container or virtual machine with no access to secrets, a read-only or scratch file system, no or restricted network, CPU, memory and time limits, and automatic clean-up. Capture stdout, stderr and any files as the observation, truncated to a sensible size. Never pass model output to your own interpreter's eval, to a shell with your credentials or to a production database. Treat the sandbox boundary as the security perimeter.`,
    r: `A coding agent's safety comes mostly from what the environment allows, not from the model's good intentions.`,
    i: `List four restrictions a code-execution sandbox should enforce.`,
    c: py`
limits = {"timeout_s": 10, "memory_mb": 512, "network": False, "writable": "/tmp/scratch only", "secrets": "none mounted"}
code = "print(sum(range(10)))"
output = "45\n"
print(limits)
print(repr(output[:2000]))`,
    v: compare("What a sandbox limits.", ["Why"], [
      ["Network", "prevents data exfiltration and calls to internal services"],
      ["File system", "prevents reading secrets and damaging real files"],
      ["CPU, memory, time", "stops infinite loops and resource exhaustion"],
      ["Credentials", "none available to the code"],
      ["Output size", "keeps the observation small"],
    ]),
  },
  {
    t: "Model Context Protocol (MCP)",
    lv: 2,
    s: `Every agent used to need custom glue code for every tool. The {{Model Context Protocol}} is an open standard that lets an application (the {{client}}, such as an agent or IDE) talk to {{servers}} that expose capabilities in a uniform way, over JSON-RPC (local process or HTTP). A server can offer {{tools}} (functions to call), {{resources}} (readable data such as files and database rows) and {{prompts}} (reusable templates). The client discovers them with tools/list and invokes them with tools/call; a new server (GitHub, a database, a calendar) works in any compatible client without new code. Treat third-party servers like any dependency: they run with your permissions and their text enters the model's context.`,
    r: `Audit the servers you connect, grant the narrowest scopes, and prefer confirmation prompts for tools with side effects.`,
    i: `What three kinds of capability can an MCP server expose?`,
    c: py`
import json

request = {"jsonrpc": "2.0", "id": 1, "method": "tools/call", "params": {"name": "get_weather", "arguments": {"city": "Vilnius"}}}
response = {"jsonrpc": "2.0", "id": 1, "result": {"content": [{"type": "text", "text": "4 C, cloudy"}]}}
print(json.dumps(request)[:70] + "...")
print(response["result"]["content"][0]["text"])`,
    v: compare("Three things an MCP server can offer.", ["What it is", "Example"], [
      ["Tools", "functions the model can call", "create_issue, run_query"],
      ["Resources", "data the client can read", "a file, a database row"],
      ["Prompts", "reusable prompt templates", "'summarise this pull request'"],
    ]),
  },
  {
    t: "Choosing among many tools",
    lv: 2,
    s: `With 5–10 well-separated tools a model chooses well; with 100 the descriptions alone fill the context and accuracy drops. Options: {{route}} first (a cheap classifier or the model picks a category, then only that category's tools are shown); {{retrieve tools}} by embedding the request and the tool descriptions and exposing the top 5–8; {{group}} related operations into fewer tools with an "action" parameter; and use {{sub-agents}} specialised for a domain. If 80 tools of 150 tokens each are listed, that is 12,000 tokens of descriptions on every step — retrieving the top 6 costs 900.`,
    r: `Measure tool-selection accuracy on a labelled set of requests: it is the first thing to degrade as tools multiply.`,
    i: `How many tokens do 80 tool descriptions of 150 tokens cost on each step, versus exposing only 6?`,
    c: py`
import numpy as np

n_tools, tokens_each = 80, 150
print(n_tools * tokens_each, 6 * tokens_each)
tools = {"search_orders": [0.9, 0.1], "refund": [0.8, 0.3], "weather": [0.1, 0.9], "translate": [0.2, 0.8]}
q = np.array([0.85, 0.2])
cos = lambda a, b: float(np.dot(a, b) / np.linalg.norm(a) / np.linalg.norm(b))
ranked = sorted(tools, key=lambda t: -cos(q, np.array(tools[t])))
print(ranked[:2])`,
    v: bars("Tokens of tool descriptions shown on every step (150 tokens each).", [["all 80 tools", "80*150"], ["top 6 retrieved", "6*150"]], {
      max: 13000,
    }),
  },
  {
    t: "Side effects and idempotency",
    lv: 2,
    s: `Reading is safe to repeat; writing is not. If a retry sends the same e-mail twice or charges a card twice, the agent has caused damage. Make write tools {{idempotent}}: attach an idempotency key (a unique id per intended action) so that repeating the call with the same key has the same effect as doing it once. Separate {{read}} tools (free to call) from {{write}} tools (checked, logged, sometimes approved); prefer reversible actions (create a draft, not send); and record what was done so a restarted agent does not repeat it. Imagine the agent crashes after step 7 of 10: can you resume without redoing steps 1–7?`,
    r: `Idempotency keys turn "at least once" delivery into "exactly once" effects.`,
    i: `Why must a retried write tool be idempotent?`,
    c: py`
done = {}

def charge(amount, key):
    if key in done:
        return done[key] + " (replayed)"
    done[key] = f"charged {amount}"
    return done[key]

print(charge(25, "order-77"))
print(charge(25, "order-77"))
print(len(done), "charge recorded")`,
    v: compare("Read versus write tools.", ["Read tools", "Write tools"], [
      ["Repeat safely?", "yes", "only with idempotency keys"],
      ["Approval", "usually none", "by risk level"],
      ["Logging", "optional", "always, with arguments and result"],
      ["Prefer", "—", "drafts and reversible steps"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
