import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- agentic-ai`.
   The "model" in the examples is a scripted stand-in so that results are deterministic. */

const AGENT = `
import ast
import operator

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}

def safe_eval(expr):
    """Arithmetic only: never pass model-written text to eval()."""
    def walk(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            return OPS[type(node.op)](walk(node.left), walk(node.right))
        raise ValueError("not allowed")
    return walk(ast.parse(expr, mode="eval").body)

TOOLS = {
    "calculator": lambda expr: str(safe_eval(expr)),
    "lookup_price": lambda item: {"pen": "2", "notebook": "5"}.get(item, "unknown"),
}

def scripted_model(messages):
    """A stand-in for an LLM: decides the next step from the conversation so far."""
    last = messages[-1]
    if last["role"] == "user":
        return {"tool": "lookup_price", "args": {"item": "pen"}}
    if last["role"] == "tool" and last["name"] == "lookup_price":
        return {"tool": "calculator", "args": {"expr": f"3 * {last['content']}"}}
    if last["role"] == "tool" and last["name"] == "calculator":
        return {"final": f"Three pens cost {last['content']} EUR."}

def run_agent(question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for step in range(max_steps):
        action = scripted_model(messages)
        if "final" in action:
            return action["final"], step, messages
        result = TOOLS[action["tool"]](**action["args"])
        messages.append({"role": "tool", "name": action["tool"], "content": result})
    return "stopped: step limit", max_steps, messages`;

export const core: ConceptDef[] = [
  {
    t: "What an AI agent is",
    lv: 1,
    s: `A chatbot answers; an {{agent}} acts. An agent is a program in which a language model chooses the next action in a loop — call a tool, read the result, decide again — until it judges the goal reached or a limit stops it. The three ingredients: a {{model}} that decides, {{tools}} that act on the world (search, code, databases, APIs, files, a browser) and a {{goal with a stopping rule}}. Because the model, not the programmer, picks the sequence of steps, agents can handle open-ended tasks ("find why the build fails and fix it") that no fixed script anticipates — and can also go wrong in ways a script never would.`,
    r: `Agents trade predictability for flexibility: use them only where the flexibility is worth the extra cost and risk.`,
    i: `What makes a system an agent rather than a chatbot or a fixed pipeline?`,
    c: py`${AGENT}
answer, steps, messages = run_agent("How much do 3 pens cost?")
print(answer, "| steps:", steps)
for m in messages:
    print(m["role"], "->", m.get("name", ""), m["content"])`,
    v: rowflow("An agent loop.", ["Goal", "Model decides", "Tool call", "Observation", "Done?", "Final answer"], [
      "The user's request.",
      "Choose the next action given everything so far.",
      "Run a search, a calculation, an API call.",
      "The result is added to the context.",
      "If not, loop; if yes or out of budget, stop.",
      "Report back to the user.",
    ]),
  },
  {
    t: "Workflows versus agents",
    lv: 1,
    s: `Not every LLM application needs an agent. In a {{workflow}} the code fixes the path — "classify, then retrieve, then draft, then check" — and the model fills in each step: predictable, cheap, testable. In an {{agent}} the model decides the path at run time: flexible, but slower, costlier and harder to test. Start with the simplest thing that works: a single prompt, then a chain of prompts, then routing and parallel calls, and only then an autonomous agent for problems whose steps cannot be predicted. Many real "agents" are workflows with one or two decision points.`,
    r: `If you can draw the flowchart in advance, build the flowchart.`,
    i: `Why prefer a workflow when the steps are known in advance?`,
    c: py`
def workflow(ticket):
    category = "billing" if "invoice" in ticket else "other"
    steps = ["classify", "retrieve policy", "draft reply", "check tone"]
    return category, steps

print(workflow("My invoice is wrong"))
paths = {"workflow": 4, "agent (typical)": 7, "agent (worst case)": 25}
print(paths)`,
    v: compare("Workflow versus agent.", ["Workflow", "Agent"], [
      ["Who picks the steps", "your code", "the model, at run time"],
      ["Predictability", "high", "lower"],
      ["Cost and latency", "fixed and small", "variable, often larger"],
      ["Testing", "unit-test each step", "evaluate whole trajectories"],
      ["Best for", "known process", "open-ended tasks"],
    ]),
  },
  {
    t: "Levels of autonomy",
    lv: 1,
    s: `Autonomy is a dial, not a switch. Level 0: the model only suggests; a person acts. Level 1: the model drafts, the person approves each action. Level 2: the agent acts alone on low-risk steps and asks for approval on risky ones (sending money, deleting data, e-mailing customers). Level 3: the agent works for long stretches and reports at checkpoints. Level 4: fully autonomous within strict limits. Choose the level from the cost of a mistake and the reliability you have measured, and raise it gradually as evidence accumulates. Reversible, low-impact actions can be automated first.`,
    r: `Design the approval step so reviewers see exactly what will happen, not only the model's description of it.`,
    i: `Which actions should still need human approval at a medium autonomy level?`,
    c: py`
actions = {"search the web": "low", "read a file": "low", "write a file": "medium", "send an e-mail": "high", "transfer money": "high"}
needs_approval = [a for a, risk in actions.items() if risk == "high"]
print(needs_approval)`,
    v: compare("The autonomy dial.", ["Human role", "Example"], [
      ["Level 0 — suggest", "does every action", "autocomplete, drafted replies"],
      ["Level 1 — approve each step", "clicks 'allow'", "coding assistant asks before edits"],
      ["Level 2 — approve risky steps", "reviews exceptions", "agent runs tests, asks before deploying"],
      ["Level 3 — checkpoints", "reviews results", "research agent reports findings"],
      ["Level 4 — autonomous", "sets limits, audits", "narrow, low-risk back-office tasks"],
    ]),
  },
  {
    t: "Parts of an agent",
    lv: 1,
    s: `A practical agent has six parts. The {{model}} reasons and chooses actions. {{Instructions}} (the system prompt) define role, rules and the stopping condition. {{Tools}} carry out actions and return observations. {{Memory}} keeps what matters beyond the context window. A {{planner or control loop}} (often just a while-loop with a step limit) drives the cycle. {{Guardrails and evaluation}} constrain and measure it. The model supplies judgement; everything else — tools, validation, limits, logging — is ordinary software, and it is where most reliability comes from.`,
    r: `Most agent bugs live in the tool descriptions, the loop limits and the data returned to the model — not in the model weights.`,
    i: `List the parts of an agent and say which are ordinary software.`,
    c: py`
parts = {
    "model": "reasoning and choice of action",
    "instructions": "role, rules, stop condition",
    "tools": "act and observe",
    "memory": "state beyond the context window",
    "control loop": "while not done and steps < limit",
    "guardrails": "limits, validation, approvals, logging",
}
for k, v in parts.items():
    print(f"{k:13s} {v}")`,
    v: compare("The parts of an agent.", ["Role"], [
      ["Model", "decides what to do next"],
      ["Instructions", "role, rules, when to stop"],
      ["Tools", "act on the world and return observations"],
      ["Memory", "remembers beyond the context window"],
      ["Control loop", "runs steps within limits"],
      ["Guardrails", "constrain, validate, log and evaluate"],
    ]),
  },
  {
    t: "Why errors compound over many steps",
    lv: 1,
    s: `If each step succeeds with probability p and a task needs n steps, the chance of finishing without any mistake is pⁿ. With p = 0.95 and 10 steps: 0.95¹⁰ = 0.599; with 20 steps 0.358. Even p = 0.99 gives only 0.818 over 20 steps. Long agent runs therefore fail far more often than their per-step accuracy suggests. Remedies: fewer, larger steps; verification after risky steps; retries and self-correction; checkpoints that allow resuming; and tools that do the exact work (calculators, parsers, tests) instead of free-form reasoning.`,
    r: `Measure end-to-end success on whole tasks, never only per-step accuracy.`,
    i: `Compute the success probability of 10 steps at p = 0.95 and of 20 steps at p = 0.99.`,
    c: py`
for p in (0.99, 0.95, 0.9):
    print(p, [round(p ** n, 3) for n in (5, 10, 20)])`,
    v: plot("Probability of finishing n steps without an error.", {
      x: [1, 30], y: [0, 1.05], labels: ["steps n", "p^n"],
      params: [par("p", "per-step success p", 0.8, 1, 0.01, 0.95)],
      readout: ["p = {p}: 10 steps → {pow(p,10):3}; 20 steps → {pow(p,20):3}"],
      steps: [["p = 0.95: 60% after 10 steps.", { p: 0.95 }], ["p = 0.99: still only 82% after 20.", { p: 0.99 }]],
    }, [curve("pow(p,x)", { c: "accent" })]),
  },
  {
    t: "The cost of looping: tokens grow every step",
    lv: 2,
    s: `Each loop iteration sends the whole history again, so the input grows by the size of the previous action and observation. With a 1,000-token system prompt and 500 new tokens per step, step t reads 1,000 + 500·t tokens and the total input over n steps is n·1,000 + 500·n(n−1)/2: 10,000 for n = 5, 32,500 for n = 10 and 115,000 for n = 20 — quadratic growth. Costs are a mix of quadratic input and linear output, plus latency per step. Keep observations short (summarise or truncate tool output), cache the stable prefix, drop stale history and cap the number of steps.`,
    r: `Budget tokens and steps per task and abort cleanly when the budget is spent.`,
    i: `Total input tokens over 10 steps with a 1,000-token prompt and 500 new tokens per step?`,
    c: py`
s, d = 1000, 500
def total(n):
    return sum(s + d * t for t in range(n))

print([total(n) for n in (5, 10, 20)])
print(total(10) / 10, "average input tokens per step at n = 10")`,
    v: plot("Total input tokens against the number of steps (1,000-token prompt).", {
      x: [1, 30], y: [0, 260000], labels: ["steps n", "total input tokens"],
      params: [par("d", "new tokens per step", 100, 1000, 100, 500)],
      readout: ["10 steps → {10*1000+d*45} tokens; 20 steps → {20*1000+d*190} tokens"],
      steps: [["500 tokens per step: 32,500 at n = 10.", { d: 500 }], ["Short observations (100 tokens): far cheaper.", { d: 100 }]],
    }, [curve("x*1000+d*x*(x-1)/2", { c: "accent" })]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
