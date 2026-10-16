import { py, type DrillDef, type QuestionDef } from "../build.js";

export const questions: QuestionDef[] = [
  /* core */
  ["core", 1, "What makes a system an agent rather than a chatbot or a fixed pipeline?", "A model chooses the next action (a tool call) in a loop, reading observations, until a goal or limit is reached."],
  ["core", 1, "Workflow or agent: when to choose which?", "A workflow when the steps are known in advance (cheaper, predictable, testable); an agent when the path cannot be predicted and flexibility is worth the cost and risk."],
  ["core", 1, "Describe the levels of autonomy.", "From suggest-only, through approve-each-step and approve-risky-steps, to checkpoint reporting and fully autonomous within strict limits; choose by cost of mistakes and measured reliability."],
  ["core", 1, "List the parts of an agent.", "Model, instructions, tools, memory, control loop with limits, guardrails and evaluation."],
  ["core", 1, "Success probability of 10 steps at p = 0.95 and of 20 steps at p = 0.99?", "0.95¹⁰ = 0.599; 0.99²⁰ = 0.818."],
  ["core", 2, "Total input tokens over 10 steps with a 1,000-token prompt and 500 new tokens per step?", "10·1000 + 500·(0 + … + 9) = 32,500; quadratic growth."],
  /* tools */
  ["tools", 1, "Who runs a tool call and what does the model receive back?", "Your code validates and executes it; the model receives the result as a message (observation)."],
  ["tools", 2, "Three properties of a well-designed tool?", "Clear name and description of when to use it, typed parameters with enums and examples, compact informative results and errors."],
  ["tools", 2, "What should a tool return for invalid arguments?", "A clear error message as the tool result so the model can correct itself, never a crash or an eval of the arguments."],
  ["tools", 2, "Chance that three attempts at p = 0.7 succeed at least once; expected attempts?", "1 − 0.3³ = 0.973; 1/p = 1.43."],
  ["tools", 2, "Time for calls of 2 s, 3 s and 1 s in parallel and in sequence?", "3 s versus 6 s."],
  ["tools", 2, "Four restrictions for a code-execution sandbox?", "No or limited network, restricted file system, CPU/memory/time limits, no credentials."],
  ["tools", 2, "What three capabilities can an MCP server expose?", "Tools, resources and prompts, discovered and invoked through JSON-RPC (tools/list, tools/call)."],
  ["tools", 2, "Tokens for 80 tool descriptions of 150 tokens versus the top 6?", "12,000 versus 900 per step; retrieve or route tools."],
  ["tools", 2, "Why must write tools be idempotent?", "Retries must not repeat side effects such as double charges; an idempotency key makes repeats harmless."],
  /* planning */
  ["plan", 1, "Describe ReAct.", "Interleave thought, action (tool call) and observation, each step informed by the previous result."],
  ["plan", 2, "Why plan first and re-plan?", "A plan reduces wandering, can be approved and measures progress; re-plan when an observation contradicts it."],
  ["plan", 2, "Critical path for A=2, B=3, C=5, D=1 with A→B, A→C, B→D, C→D?", "A → C → D = 8 (versus 11 sequentially)."],
  ["plan", 2, "Why is reflection with tests better than self-opinion?", "Objective external feedback avoids reinforcing mistakes and declaring success too early."],
  ["plan", 2, "Chance that at least one of 5 attempts at p = 0.4 succeeds; majority of 5 at 0.7?", "1 − 0.6⁵ = 0.92; majority 0.837."],
  ["plan", 1, "Four rules to stop an agent loop?", "Success check, step limit, budget (tokens/money/time), stuck detection."],
  /* memory */
  ["mem", 1, "Strategies to manage the context window?", "Truncate tool output, sliding window, summarise old turns, offload large content, pin goals."],
  ["mem", 2, "Rank memories A (0.9 sim, 2 h, 0.3 imp), B (0.6, 1 h, 0.9), C (0.8, 200 h, 0.5) with score = sim + 0.995^h + imp.", "B 2.495, A 2.19, C 1.667."],
  ["mem", 1, "Why keep structured state outside the conversation?", "Compact, persistable, resumable after crashes or approvals, and easy to inspect."],
  ["mem", 2, "What should not be stored in long-term memory?", "Secrets, unverified claims, instructions from tool output, and unnecessary personal data."],
  ["mem", 2, "Name three memory risks.", "Staleness, poisoning, cross-user leakage (and over-trust of old notes)."],
  /* multi-agent */
  ["multi", 1, "Name three multi-agent patterns and a reason not to use them.", "Orchestrator–worker, pipeline, router, debate; coordination costs tokens, time and compounds errors."],
  ["multi", 2, "Channels for ten fully connected agents versus via one orchestrator?", "45 versus 10."],
  ["multi", 2, "Amdahl speed-up for f = 0.8 with 4 workers and its limit?", "2.5×; limit 5×."],
  ["multi", 2, "Input tokens when six agents each read 10,000 tokens?", "60,000, six times the single-agent background cost."],
  ["multi", 2, "Why can voting among same-model agents fail?", "Their errors are correlated; use diverse prompts, tools or models."],
  /* evaluation */
  ["evalu", 1, "Success rate and 95% interval for 41 of 50 tasks?", "82% ± about 11 points."],
  ["evalu", 2, "pass^5 and pass@5 for p = 0.8?", "0.328 and 0.9997 — reliability needs pass^k."],
  ["evalu", 2, "Why evaluate trajectories?", "Correct answers can come from unsafe, wasteful or lucky routes; check tools, arguments, steps and violations."],
  ["evalu", 1, "Cost per solved task: 0.40 per run at 80% success versus 0.15 at 50%?", "0.50 versus 0.30 (before the cost of clean-up)."],
  ["evalu", 2, "Why must agent benchmark environments be resettable?", "Every run must start from the same state for fair, repeatable comparison."],
  ["evalu", 1, "Fields to log per step?", "Run id, step, prompt and model version, tool and arguments, result, tokens, latency, cost, outcome."],
  /* safety */
  ["safe", 1, "Four sources of harm in an agent system?", "Misunderstood goal, injected instructions, tools that do more than intended, over-literal pursuit of the goal."],
  ["safe", 1, "Which permissions for an agent that answers questions about orders?", "Read-only, scoped to one view or customer, short-lived credentials, allow-listed tools."],
  ["safe", 2, "Expected loss: 2% chance of a wrong 500 refund; 1 in 1,000 of a 100,000 mistake?", "10 and 100; compare with the cost of a review to decide on approval."],
  ["safe", 2, "What is the lethal trifecta?", "Private data + untrusted content + a way to send data out; remove at least one."],
  ["safe", 2, "Controls for irreversible actions?", "Approval, dry run, soft delete or backup, rollback plan, sandbox copy."],
  ["safe", 2, "What does a circuit breaker do?", "After repeated failures it pauses calls to a tool for a cool-down, then probes and resumes."],
  ["safe", 1, "Three audit log fields and one pre-launch practice?", "Action, arguments, user/agent version, approval and outcome; red-teaming with attacks kept as regression tests."],
  /* build */
  ["build", 1, "What does the control loop do on every iteration?", "Send history and tools, read the reply, validate and run tool calls, append observations, stop on a final answer or limit."],
  ["build", 2, "Why model an agent as a graph?", "Explicit control flow, per-node prompts and tools, natural approval and checkpoint points, a known set of paths to test."],
  ["build", 2, "Steps saved by resuming from a checkpoint after a crash at step 14 of 20?", "14 (no repeated work or repeated side effects)."],
  ["build", 2, "Why prefer an API to screen control?", "Faster, more reliable and safer than clicking through a UI."],
  ["build", 2, "Why do coding agents work well?", "Tests give an objective critic, branches give a resettable sandbox and verification is cheap."],
  ["build", 1, "Order of complexity from prompt to multi-agent?", "Single prompt, chain/workflow, routing and parallel calls, single agent with tools, multiple agents."],
];

export const drills: DrillDef[] = [
  {
    t: "Compounding errors",
    q: "What does this print?",
    code: py`
print(round(0.95 ** 10, 3), round(0.99 ** 20, 3))`,
    opts: [["0.599 0.818", true, "Per-step success multiplies over the steps."], ["0.95 0.99", false, "Probabilities multiply over steps."], ["0.5 0.8", false, "Compute the powers exactly."]],
    path: ["0.95¹⁰ = 0.599.", "0.99²⁰ = 0.818."],
    why: "Each step must succeed for the task to succeed.",
    watch: "Measure end-to-end success, not per-step accuracy.",
    remember: "P(success) = pⁿ.",
  },
  {
    t: "Context growth",
    q: "What does this print?",
    code: py`
s, d = 1000, 500
print(sum(s + d * t for t in range(10)))`,
    opts: [["32500", true, "10·1000 + 500·45."], ["10000", false, "History grows every step."], ["15000", false, "The growth is quadratic in n."]],
    path: ["10 × 1000 = 10,000.", "500 × (0 + 1 + … + 9) = 22,500.", "Sum = 32,500."],
    why: "Every step re-sends the whole history.",
    watch: "Truncate observations to flatten the curve.",
    remember: "total = n·s + d·n(n − 1)/2.",
  },
  {
    t: "Retry success",
    q: "What does this print?",
    code: py`
p = 0.7
print(round(1 - (1 - p) ** 3, 3), round(1 / p, 2))`,
    opts: [["0.973 1.43", true, "Three tries almost always succeed once."], ["0.343 1.43", false, "That is the chance all three succeed."], ["0.973 0.7", false, "Expected attempts is 1/p."]],
    path: ["Fail all three: 0.3³ = 0.027.", "Success at least once: 0.973.", "Expected attempts = 1/0.7."],
    why: "Independent attempts fail only if all fail.",
    watch: "Retry only transient errors.",
    remember: "1 − (1 − p)ⁿ.",
  },
  {
    t: "Critical path",
    q: "What does this print?",
    code: py`
deps = {"A": [], "B": ["A"], "C": ["A"], "D": ["B", "C"]}
dur = {"A": 2, "B": 3, "C": 5, "D": 1}
fin = {}
for t in "ABCD":
    fin[t] = max((fin[d] for d in deps[t]), default=0) + dur[t]
print(fin["D"], sum(dur.values()))`,
    opts: [["8 11", true, "The slower branch C sets the finish time."], ["11 11", false, "B and C run in parallel."], ["6 11", false, "D must wait for C (7) before its 1."]],
    path: ["A finishes at 2.", "B at 5, C at 7.", "D starts at 7 and finishes at 8."],
    why: "Parallel branches overlap; the longest path decides.",
    watch: "Dependencies, not just durations.",
    remember: "finish = max(parent finish) + duration.",
  },
  {
    t: "Amdahl's law",
    q: "What does this print?",
    code: py`
f, k = 0.8, 4
print(round(1 / ((1 - f) + f / k), 2), round(1 / (1 - f), 1))`,
    opts: [["2.5 5.0", true, "The serial 20% limits the gain."], ["4.0 5.0", false, "Only 80% parallelises."], ["3.2 4.0", false, "Apply the formula exactly."]],
    path: ["(1 − 0.8) + 0.8/4 = 0.4.", "1/0.4 = 2.5.", "Limit: 1/0.2 = 5."],
    why: "The serial part becomes the bottleneck.",
    watch: "More workers cost more tokens too.",
    remember: "S = 1/((1 − f) + f/k).",
  },
  {
    t: "pass^k versus pass@k",
    q: "What does this print?",
    code: py`
p = 0.8
print(round(p ** 5, 3), round(1 - (1 - p) ** 5, 4))`,
    opts: [["0.328 0.9997", true, "Always-succeeds is much harder than succeeds-once."], ["0.9997 0.328", false, "These are swapped."], ["0.8 0.8", false, "Both depend on the number of runs."]],
    path: ["pass^5 = 0.8⁵ = 0.328.", "pass@5 = 1 − 0.2⁵ = 0.99968."],
    why: "Users need reliability on every run.",
    watch: "pass@k flatters unreliable agents.",
    remember: "pass^k = pᵏ.",
  },
  {
    t: "Expected loss",
    q: "What does this print?",
    code: py`
print(0.02 * 500, 0.001 * 100000)`,
    opts: [["10.0 100.0", true, "Probability times cost."], ["500 100000", false, "Weight by the error probability."], ["0.02 0.001", false, "Multiply by the cost of the mistake."]],
    path: ["0.02 × 500 = 10.", "0.001 × 100,000 = 100."],
    why: "Approval is worthwhile when expected loss exceeds review cost.",
    watch: "Rare but huge errors dominate.",
    remember: "loss = P(error) × cost.",
  },
  {
    t: "Majority vote",
    q: "What does this print?",
    code: py`
from math import comb
print(round(sum(comb(5, k) * 0.7 ** k * 0.3 ** (5 - k) for k in range(3, 6)), 3))`,
    opts: [["0.837", true, "At least 3 of 5 correct."], ["0.7", false, "Voting improves on a single attempt."], ["0.5", false, "The attempts are better than chance."]],
    path: ["P(3) = 0.3087, P(4) = 0.3601, P(5) = 0.1681.", "Sum = 0.837."],
    why: "The majority is right when at least 3 of 5 are.",
    watch: "Assumes independent errors.",
    remember: "Binomial tail.",
  },
  {
    t: "Communication channels",
    q: "What does this print?",
    code: py`
n = 10
print(n * (n - 1) // 2, n)`,
    opts: [["45 10", true, "Fully connected versus via an orchestrator."], ["100 10", false, "n(n − 1)/2 counts each pair once."], ["10 45", false, "These are swapped."]],
    path: ["10 × 9 / 2 = 45.", "One link per worker to the orchestrator = 10."],
    why: "Pairwise links grow quadratically.",
    watch: "Mediators reduce chatter.",
    remember: "n(n − 1)/2.",
  },
  {
    t: "Cost per solved task",
    q: "What does this print?",
    code: py`
print(round(0.40 / 0.8, 2), round(0.15 / 0.5, 2))`,
    opts: [["0.5 0.3", true, "Cost per run divided by success rate."], ["0.32 0.075", false, "Divide by the success rate, not multiply."], ["0.4 0.15", false, "Failed runs are paid for too."]],
    path: ["0.40/0.8 = 0.50.", "0.15/0.5 = 0.30."],
    why: "Failures are part of the price of successes.",
    watch: "Add the cost of clean-up for failures.",
    remember: "cost / success rate.",
  },
  {
    t: "Memory retrieval score",
    q: "What does this print?",
    code: py`
mem = {"A": (0.9, 2, 0.3), "B": (0.6, 1, 0.9), "C": (0.8, 200, 0.5)}
score = {k: round(s + 0.995 ** h + i, 3) for k, (s, h, i) in mem.items()}
print(score, max(score, key=score.get))`,
    opts: [["{'A': 2.19, 'B': 2.495, 'C': 1.667} B", true, "Recency and importance outweigh similarity here."], ["{'A': 2.19, 'B': 2.495, 'C': 1.667} A", false, "B has the highest score."], ["{'A': 0.9, 'B': 0.6, 'C': 0.8} A", false, "Add recency and importance."]],
    path: ["A: 0.9 + 0.990 + 0.3 = 2.19.", "B: 0.6 + 0.995 + 0.9 = 2.495.", "C: 0.8 + 0.367 + 0.5 = 1.667."],
    why: "Retrieval blends similarity, recency and importance.",
    watch: "Tune the weights on real tasks.",
    remember: "sim + decay^hours + importance.",
  },
  {
    t: "Tool-description tokens",
    q: "What does this print?",
    code: py`
print(80 * 150, 6 * 150)`,
    opts: [["12000 900", true, "All descriptions versus only the retrieved six."], ["230 156", false, "Multiply tools by tokens each."], ["80 6", false, "Each description costs 150 tokens."]],
    path: ["80 × 150 = 12,000.", "6 × 150 = 900."],
    why: "Every step re-sends the tool list.",
    watch: "Accuracy also falls as tools multiply.",
    remember: "Retrieve or route tools.",
  },
];

export const codeLab: [string, string, string][] = [
  ["A minimal agent loop", "Run a scripted model through a tool loop with a step limit.", py`
TOOLS = {"double": lambda x: x * 2}

def scripted(history):
    if history[-1]["role"] == "user":
        return {"tool": "double", "args": {"x": 21}}
    return {"final": f"Answer: {history[-1]['content']}"}

def run(max_steps=3):
    history = [{"role": "user", "content": "double 21"}]
    for step in range(max_steps):
        reply = scripted(history)
        if "final" in reply:
            return reply["final"], step
        history.append({"role": "tool", "content": TOOLS[reply["tool"]](**reply["args"])})
    return "limit", max_steps

print(run())`],
  ["Retry with back-off", "Retry a flaky tool with exponential back-off.", py`
import random

random.seed(3)
def flaky():
    if random.random() < 0.6:
        raise TimeoutError("slow")
    return "ok"

delays, result = [], None
for attempt in range(5):
    try:
        result = flaky()
        break
    except TimeoutError:
        delays.append(2 ** attempt)
print(result, delays)`],
  ["Topological order and critical path", "Order tasks by dependencies and find the finish time.", py`
deps = {"fetch": [], "clean": ["fetch"], "bench": ["fetch"], "report": ["clean", "bench"]}
dur = {"fetch": 2, "clean": 3, "bench": 5, "report": 1}
order, seen = [], set()
def visit(t):
    if t in seen:
        return
    seen.add(t)
    for d in deps[t]:
        visit(d)
    order.append(t)
for t in deps:
    visit(t)
fin = {}
for t in order:
    fin[t] = max((fin[d] for d in deps[t]), default=0) + dur[t]
print(order, fin["report"])`],
  ["Stuck detection", "Detect a repeated action in the history.", py`
history = ["search(x)", "read(a)", "search(x)", "search(x)", "search(x)"]
def stuck(h, k=3):
    return len(h) >= k and len(set(h[-k:])) == 1

print([stuck(history[:i]) for i in range(1, len(history) + 1)])`],
  ["Memory store with scoring", "Retrieve the best memory for a query.", py`
import numpy as np

mem = [("likes metric units", np.array([0.9, 0.1]), 3, 0.8), ("address: Oak St", np.array([0.2, 0.9]), 300, 0.4), ("asked about refunds", np.array([0.7, 0.4]), 5, 0.6)]
q = np.array([0.8, 0.3])
cos = lambda a, b: float(a @ b / np.linalg.norm(a) / np.linalg.norm(b))
scored = sorted(((round(cos(q, v) + 0.995 ** h + imp, 2), t) for t, v, h, imp in mem), reverse=True)
print(scored[0])`],
  ["Approval policy", "Decide which actions need a human using expected loss.", py`
actions = {"search": (0.05, 0), "draft": (0.05, 5), "refund": (0.02, 500), "wire": (0.001, 100000)}
review_cost = 0.5
for name, (p, loss) in actions.items():
    print(name, round(p * loss, 2), "ask" if p * loss > review_cost else "auto")`],
  ["Idempotent charges", "Make a write tool safe to retry.", py`
ledger = {}

def charge(amount, key):
    ledger.setdefault(key, amount)
    return ledger[key]

for _ in range(3):
    charge(25, "order-77")
print(ledger, sum(ledger.values()))`],
  ["Trace and cost summary", "Summarise a trace of tool calls.", py`
trace = [{"tool": "search", "tokens_in": 1200, "tokens_out": 80, "ms": 640}, {"tool": "read", "tokens_in": 2600, "tokens_out": 60, "ms": 410}, {"tool": "answer", "tokens_in": 3000, "tokens_out": 220, "ms": 1800}]
cost = sum(t["tokens_in"] / 1e6 * 3 + t["tokens_out"] / 1e6 * 15 for t in trace)
print(len(trace), round(cost, 4), sum(t["ms"] for t in trace), "ms")`],
];

export const glance: [string, string][] = [
  ["Loop", "observe → decide → act (tool) → observe · stop on success, step limit, budget, stuck"],
  ["Compounding", "P(success) = pⁿ · retries 1 − (1 − p)ⁿ · expected attempts 1/p · back-off 1, 2, 4, 8 … + jitter"],
  ["Cost", "context total = n·s + d·n(n − 1)/2 · tool list tokens = tools × tokens each · cost per solved task = cost / success rate"],
  ["Planning", "DAG finish = max(parent finish) + duration · critical path · Amdahl 1/((1 − f) + f/k)"],
  ["Search / voting", "best-of-n 1 − (1 − p)ⁿ · majority = binomial tail · self-consistency"],
  ["Memory", "score = similarity + decay^hours + importance · summary ratio = tokens / summary tokens"],
  ["Multi-agent", "channels n(n − 1)/2 vs n · tokens ≈ agents × context · errors correlate"],
  ["Evaluation", "success ± 1.96√(p(1 − p)/n) · pass^k = pᵏ · pass@k = 1 − (1 − p)ᵏ · trajectory metrics"],
  ["Safety", "least privilege · expected loss = P(error) × cost · trifecta: data + untrusted input + exfiltration · dry run, backup, circuit breaker"],
  ["Build", "raw loop → workflow → agent → multi-agent · graph of nodes · checkpoints + idempotency · traces"],
];

export const lists: [string, string[]][] = [
  ["Habits for reliable agents", ["Write the success checker and an evaluation set first", "Keep the tool set small, narrow and well described", "Validate every tool call and return errors as observations", "Set step, token and time budgets on every run", "Log a full trace with a run id from day one", "Raise autonomy only as measured reliability earns it"]],
  ["When an agent misbehaves", ["Read the whole trace, step by step", "Check what the tool results actually contained", "Look for ambiguous tool descriptions and overlapping tools", "Check whether context was truncated or stale", "Look for injected text in tool output", "Reproduce in the sandbox before changing the prompt"]],
  ["Explaining your answer in an exam", ["State the pattern (workflow, ReAct, orchestrator–worker …)", "Write the formula, substitute, compute, interpret", "Name the failure mode and its mitigation", "Say what you would measure to know it works"]],
];

export const materials: [string, [string, string][]][] = [
  ["Guides and documentation", [["Anthropic: Building effective agents", "https://www.anthropic.com/engineering/building-effective-agents"], ["Model Context Protocol", "https://modelcontextprotocol.io/"], ["Anthropic documentation: tool use", "https://docs.claude.com/"]]],
  ["Papers", [["ReAct: Synergizing Reasoning and Acting", "https://arxiv.org/abs/2210.03629"], ["Reflexion: Language Agents with Verbal Reinforcement Learning", "https://arxiv.org/abs/2303.11366"], ["Self-Consistency Improves Chain of Thought Reasoning", "https://arxiv.org/abs/2203.11171"]]],
];
