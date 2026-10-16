import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- agentic-ai`. */

export const multi: ConceptDef[] = [
  {
    t: "Multi-agent patterns",
    lv: 1,
    s: `Several agents can share one task. {{Orchestrator–worker}}: a lead agent splits the work, hands pieces to worker agents and merges their results — the most common and robust pattern. {{Pipeline}}: agents in sequence (researcher → writer → reviewer). {{Router}}: a small agent sends each request to a specialist. {{Debate or critic}}: agents propose and challenge each other's answers. Reasons to split: separate contexts keep each agent focused, different tools and permissions per role, parallel work, and specialised prompts. Reasons not to: coordination costs tokens and time, errors can multiply between agents, and a single agent with good tools is often enough.`,
    r: `Add agents only when one agent's context, tool set or speed is the proven bottleneck.`,
    i: `Name three multi-agent patterns and one reason not to use several agents.`,
    c: py`
def worker(subtask):
    return f"result of {subtask}"

def orchestrator(task):
    subtasks = [f"{task} / part {i}" for i in (1, 2, 3)]
    results = [worker(s) for s in subtasks]
    return " + ".join(results)

print(orchestrator("market research"))`,
    v: compare("Common multi-agent patterns.", ["Idea", "Good for"], [
      ["Orchestrator–worker", "lead splits, workers act, lead merges", "research, large code changes"],
      ["Pipeline", "each agent hands over to the next", "draft → review → publish"],
      ["Router", "a front agent picks a specialist", "support with several domains"],
      ["Debate / critic", "agents challenge each other", "reasoning and verification"],
    ]),
  },
  {
    t: "Handoffs and communication",
    lv: 2,
    s: `Agents must pass work without losing meaning. A good {{handoff}} states the goal in one sentence, supplies the context the next agent needs (not the whole transcript), says what output format to return, and names constraints and the deadline. Messages should be structured (fields, not free-form chat) and sizeable work should travel by reference (a file or record id) rather than being pasted. Shared state — a task board or a document — gives every agent the same view; a mediator avoids many-to-many chatter: n agents talking to each other need n(n−1)/2 channels (45 for ten agents), but a single orchestrator needs n.`,
    r: `Most multi-agent failures are communication failures: ambiguity in the brief, missing context or unstructured results.`,
    i: `How many communication channels do ten fully connected agents need versus ten workers around one orchestrator?`,
    c: py`
n = 10
print(n * (n - 1) // 2, n)
handoff = {
    "goal": "Summarise the 5 latest incident reports",
    "context": ["reports/2025-06/"],
    "return_format": {"summary": "str", "risks": "list[str]"},
    "deadline_s": 120,
}
print(handoff["goal"], "|", handoff["return_format"])`,
    v: plot("Communication channels against the number of agents.", {
      x: [2, 20], y: [0, 200], labels: ["agents n", "channels"],
    }, [curve("x*(x-1)/2", { c: "bad", label: "fully connected" }), curve("x", { c: "good", label: "via one orchestrator" })]),
  },
  {
    t: "Parallel agents and the speed-up limit",
    lv: 2,
    s: `Splitting a task across workers shortens it only for the parallel part. {{Amdahl's law}}: speed-up = 1 / ((1 − f) + f/k) where f is the parallelisable fraction and k the number of workers. If 80% of a task parallelises: 4 workers give 1/(0.2 + 0.2) = 2.5×; 16 workers give 4×; even unlimited workers cap at 1/0.2 = 5×. The serial part — planning, merging, reviewing — becomes the bottleneck. Parallelism also multiplies cost: four workers each reading the same 10,000-token background use 40,000 input tokens instead of 10,000. Decide by value of time against value of tokens.`,
    r: `Parallelise the independent, expensive sub-tasks and keep the cheap serial steps simple.`,
    i: `Compute the speed-up for f = 0.8 with 4 workers and the limit with unlimited workers.`,
    c: py`
def speedup(f, k):
    return 1 / ((1 - f) + f / k)

print([round(speedup(0.8, k), 2) for k in (1, 2, 4, 16, 1000)], 1 / (1 - 0.8))`,
    v: plot("Speed-up against the number of workers when 80% of the work is parallel.", {
      x: [1, 32], y: [0, 5.5], labels: ["workers k", "speed-up"],
      params: [par("f", "parallel fraction f", 0.5, 0.99, 0.01, 0.8)],
      readout: ["4 workers → {1/((1-f)+f/4):2}×; limit {1/(1-f):2}×"],
      steps: [["80% parallel: 2.5× with 4 workers.", { f: 0.8 }], ["95% parallel: 3.5× with 4 workers.", { f: 0.95 }]],
    }, [curve("1/((1-f)+f/x)", { c: "accent" }), hline("1/(1-f)", { c: "muted", dash: true })]),
  },
  {
    t: "The token cost of multi-agent systems",
    lv: 2,
    s: `Every agent has its own context, so shared background is paid for repeatedly. A research task with a lead and five workers, each reading 10,000 tokens of instructions and background and producing 2,000 tokens, reads 6 × 10,000 = 60,000 input tokens and writes 12,000 — often several times the cost of a single agent doing the same work sequentially, in exchange for speed and focus. Control it: pass compact briefs instead of full context, cache the shared prefix, use small models for simple workers, limit the number of workers and rounds, and measure cost per solved task rather than per call.`,
    r: `Multi-agent systems are worth their cost on valuable, parallelisable tasks; they are wasteful on small ones.`,
    i: `How many input tokens do six agents use if each reads 10,000 tokens?`,
    c: py`
agents, context, out = 6, 10000, 2000
print(agents * context, agents * out)
shared_cached = context + (agents - 1) * 0.1 * context
print(shared_cached, "token-equivalents with a cached 10,000-token prefix at 10% price")`,
    v: bars("Input tokens for one task as the number of agents grows (10,000-token context each).", [["1 agent", "10000"], ["3 agents", "30000"], ["6 agents", "60000"], ["10 agents", "100000"]], {
      max: 105000,
    }),
  },
  {
    t: "Consensus and conflict between agents",
    lv: 2,
    s: `Agents can disagree. Resolution options: {{majority vote}} among peers (works for discrete answers; five independent agents at 0.7 accuracy give 0.837), a {{judge}} agent or a person for important cases, {{evidence-based}} resolution (each agent must cite sources, and sourced claims win) and {{authority}} by role (the security reviewer can veto). Beware of correlated errors: agents built from the same model and prompt often make the same mistake, so voting helps less than the independence maths suggests; diversity — different prompts, tools or models — restores some of it. Also beware of agreeable agents that simply echo each other.`,
    r: `Estimate how correlated your agents' errors are before counting on a vote.`,
    i: `Why can voting among agents from the same model fail?`,
    c: py`
from collections import Counter

votes = ["A", "A", "B", "A", "B"]
print(Counter(votes).most_common(1)[0])
def majority(p, n):
    from math import comb
    return sum(comb(n, k) * p ** k * (1 - p) ** (n - k) for k in range(n // 2 + 1, n + 1))
print(round(majority(0.7, 5), 3), round(majority(0.7, 9), 3))`,
    v: compare("Resolving disagreement.", ["Strength", "Weakness"], [
      ["Majority vote", "simple, parallel", "needs independent errors"],
      ["Judge agent", "can weigh arguments", "judge bias and cost"],
      ["Evidence required", "grounded claims win", "needs good sources"],
      ["Human decides", "highest trust", "slow, costly"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const evalu: ConceptDef[] = [
  {
    t: "Measuring agents: task success first",
    lv: 1,
    s: `The question is simple: how often does the agent complete the task correctly? Build a set of 50–200 realistic tasks, each with a way to check the outcome automatically (the file contains X, the test passes, the database row exists, the answer matches a rubric) and run the agent on all of them. Report the {{success rate}} with its uncertainty: 41 of 50 is 82%, with a 95% interval of about ±11 points (71–93%). Also report cost, steps and time per task. A demo that works three times proves nothing: variation between runs is large, so evaluate many tasks and, where it matters, several runs per task.`,
    r: `Write the checker before the agent: if you cannot tell whether a task succeeded, you cannot improve anything.`,
    i: `Compute the success rate and its 95% interval for 41 successes in 50 tasks.`,
    c: py`
import numpy as np

n, s = 50, 41
p = s / n
half = 1.96 * np.sqrt(p * (1 - p) / n)
print(round(p, 2), round(float(half), 3), (round(float(p - half), 2), round(float(p + half), 2)))`,
    v: plot("Half-width of the 95% interval of a success rate against the number of tasks.", {
      x: [10, 400], y: [0, 0.3], labels: ["tasks", "± half-width"],
      params: [par("p", "success rate", 0.5, 0.95, 0.05, 0.8)],
      readout: ["50 tasks: ± {1.96*sqrt(p*(1-p)/50):3}; 200 tasks: ± {1.96*sqrt(p*(1-p)/200):3}"],
      steps: [["82% on 50 tasks: about ±11 points.", { p: 0.82 }]],
    }, [curve("1.96*sqrt(p*(1-p)/x)", { c: "accent" })]),
  },
  {
    t: "Reliability: pass^k, not just pass@k",
    lv: 2,
    s: `Users need the agent to succeed every time, not once in several tries. If a task succeeds with probability p per run, the chance of succeeding on all k runs is {{pass^k = pᵏ}}: p = 0.8 gives 0.328 over five runs and 0.168 over eight; p = 0.9 gives 0.430 over eight. Compare pass@k (at least one success in k tries) = 1 − (1 − p)ᵏ, which looks flattering. For a customer-facing agent report pass^k for the k that matches real use (the same task repeated over days, a thousand customers). Closing the gap needs lower variance: validation, constrained tools, retries, checkpoints, and human review of the uncertain cases.`,
    r: `Run each evaluation task several times: a task that passes 3 of 5 runs is not "solved".`,
    i: `Compute pass^5 and pass@5 for p = 0.8.`,
    c: py`
p = 0.8
print(round(p ** 5, 3), round(p ** 8, 3), round(1 - (1 - p) ** 5, 4))
print(round(0.9 ** 8, 3))`,
    v: plot("pass^k (success on every one of k runs) and pass@k (at least one) for the chosen p.", {
      x: [1, 10], y: [0, 1.05], labels: ["runs k", "probability"],
      params: [par("p", "per-run success p", 0.5, 0.99, 0.01, 0.8)],
      readout: ["k = 5: pass^k = {pow(p,5):3}, pass@k = {1-pow(1-p,5):4}"],
      steps: [["p = 0.8: 33% to succeed five times in a row.", { p: 0.8 }], ["p = 0.95: 77%.", { p: 0.95 }]],
    }, [curve("pow(p,x)", { c: "bad", label: "pass^k" }), curve("1-pow(1-p,x)", { c: "good", label: "pass@k" })]),
  },
  {
    t: "Evaluating the trajectory, not only the outcome",
    lv: 2,
    s: `Two runs can both reach the right answer — one in 4 efficient steps, the other in 19 after a dangerous detour. Inspect the {{trajectory}}: which tools were called, with what arguments, in what order; were any forbidden or risky actions attempted; were redundant calls made; did the agent recover from errors. Useful trajectory metrics: steps and tokens per task, tool-call error rate, share of calls that were unnecessary, number of approvals requested, and policy violations. Compare to a reference trajectory where there is one, or review a sample by hand. Examples of failures to catalogue: wrong tool, wrong argument, loop, premature stop, ignoring an observation.`,
    r: `Read twenty failed traces end to end before changing any prompt: patterns appear fast.`,
    i: `Why is a correct final answer not enough to call a run good?`,
    c: py`
runs = {
    "run A": ["search", "read", "answer"],
    "run B": ["search", "search", "search", "delete_file", "read", "answer"],
}
forbidden = {"delete_file"}
for name, calls in runs.items():
    print(name, len(calls), "calls,", "violations:", [c for c in calls if c in forbidden])`,
    v: compare("Outcome versus trajectory evaluation.", ["Outcome only", "Trajectory too"], [
      ["Question", "was the result right?", "how was it reached?"],
      ["Catches", "wrong answers", "unsafe or wasteful routes, lucky guesses"],
      ["Metrics", "success rate", "steps, tool errors, violations, cost"],
      ["Cost to evaluate", "low", "higher: traces and rules or review"],
    ]),
  },
  {
    t: "Cost, latency and the value of a solved task",
    lv: 1,
    s: `Judge an agent economically: {{cost per solved task}} = total cost of all runs ÷ number of successes. An agent costing 0.40 per run that succeeds 80% of the time costs 0.50 per solved task; a cheaper agent at 0.15 per run with 50% success costs 0.30 — but if each failure needs 10 minutes of human clean-up the picture changes. Add latency (a 5-minute agent may be fine for a report, not for a chat reply) and the cost of mistakes. Compare with the baseline it replaces (a person, a script). A cheaper model that succeeds less often is not automatically cheaper once retries and fixes are counted.`,
    r: `Plot success rate against cost for several model and prompt choices and pick a point on the frontier.`,
    i: `Compute cost per solved task for 0.40 per run at 80% success and 0.15 per run at 50%.`,
    c: py`
for cost, rate in ((0.40, 0.8), (0.15, 0.5)):
    print(cost, rate, round(cost / rate, 2))
cleanup_minutes, hourly = 10, 30
print(round(0.15 / 0.5 + (1 - 0.5) / 0.5 * cleanup_minutes / 60 * hourly, 2))`,
    v: bars("Cost per solved task for the chosen success rate (0.40 per run).", [["model cost per success", "0.4/r"]], {
      max: 2.2,
      params: [par("r", "success rate", 0.2, 1, 0.05, 0.8)],
      readout: ["0.40 / {r} = {0.4/r:3} per solved task"],
      steps: [["80% success: 0.50.", { r: 0.8 }], ["40% success: 1.00.", { r: 0.4 }]],
    }),
  },
  {
    t: "Benchmarks and sandboxes for agents",
    lv: 2,
    s: `Agent benchmarks give a reproducible environment, tasks and an automatic checker: software-engineering tasks scored by tests, web-navigation tasks in a simulated site, customer-service simulations with scripted users and policy checks, command-line tasks verified by file state. They are useful for comparing models and prompts, but remember: public tasks may have leaked into training data; scores depend heavily on the scaffold (tools, prompts, step limits); success rates change with the number of attempts allowed; and they rarely match your domain. Build a small private benchmark from your real tasks inside a sandbox that can be reset between runs, and rerun it on every model, prompt or tool change.`,
    r: `Always state the scaffold, step limit, attempts and model version next to a benchmark score.`,
    i: `Why must an agent benchmark environment be resettable?`,
    c: py`
import copy

initial_state = {"files": {"a.txt": "old"}, "db_rows": 3}
state = copy.deepcopy(initial_state)
state["files"]["a.txt"] = "new"
state["db_rows"] += 1
print(state != initial_state)
state = copy.deepcopy(initial_state)
print(state == initial_state)`,
    v: compare("What a good agent benchmark includes.", ["Why"], [
      ["Resettable environment", "every run starts from the same state"],
      ["Automatic checker", "objective, scalable scoring"],
      ["Realistic tasks", "predicts behaviour on your work"],
      ["Fixed scaffold and limits", "comparable results"],
      ["Held-out tasks", "protects against contamination"],
    ]),
  },
  {
    t: "Observability: traces, logs and monitoring",
    lv: 1,
    s: `You cannot fix what you cannot see. Record for every run a {{trace}}: the task, each step with the prompt version, model, tool call and arguments, result (truncated), tokens, latency and cost, plus the final outcome. Index traces by run id; sample failures and expensive runs for review; keep a dashboard of success rate, cost, steps, tool error rate and p95 latency; alert on spikes (a loop burning tokens, a tool failing 30% of the time). Mask personal data in logs, set retention, and keep the ability to replay a trace against a new prompt or model — the best regression test you will ever have.`,
    r: `Add trace ids from the first prototype: retrofitting observability into a running agent is painful.`,
    i: `List the fields you would store for every step of an agent run.`,
    c: py`
trace_step = {"run_id": "r-17", "step": 3, "model": "m-1", "prompt_version": "v12", "tool": "search_orders", "args": {"customer_id": "482913"}, "result": "2 orders", "tokens_in": 3400, "tokens_out": 120, "latency_ms": 910, "cost": 0.0112}
print(sorted(trace_step))
print(round(trace_step["tokens_in"] / 1e6 * 3 + trace_step["tokens_out"] / 1e6 * 15, 4))`,
    v: rowflow("From trace to improvement.", ["Run the agent", "Record the trace", "Dashboards and alerts", "Review failures", "Fix prompt, tool or limit", "Replay and re-evaluate"], [
      "Every run gets a run id.",
      "Steps, tools, tokens, latency, cost, outcome.",
      "Success rate, cost, errors, p95 latency.",
      "Sample failed and expensive runs.",
      "The smallest change that explains the failure.",
      "Check the fix and look for regressions.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
