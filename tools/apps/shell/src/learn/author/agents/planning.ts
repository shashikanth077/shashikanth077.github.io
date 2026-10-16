import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "../nlp/util.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- agentic-ai`. */

export const plan: ConceptDef[] = [
  {
    t: "ReAct: reason, act, observe",
    lv: 1,
    s: `{{ReAct}} interleaves three things in a loop: a short {{thought}} (what do I know, what do I need), an {{action}} (call a tool) and the {{observation}} (its result). The thoughts keep the model on track and make its trajectory readable; the observations ground it in facts instead of guesses. Example: "Who directed the film that won Best Picture in 1994?" → Thought: I need the winner; Action: search("Best Picture 1994"); Observation: Forrest Gump; Thought: now the director; Action: search("Forrest Gump director"); Observation: Robert Zemeckis; Answer. Two tool calls, each informed by the previous result — impossible for a single prompt without lookup.`,
    r: `Log thoughts, actions and observations as a trace: it is both your debugger and your audit trail.`,
    i: `Write the thought–action–observation trace for a two-step question.`,
    c: py`
facts = {"Best Picture 1994": "Forrest Gump", "Forrest Gump director": "Robert Zemeckis"}
trace = []
query = "Best Picture 1994"
for step in range(2):
    obs = facts[query]
    trace.append((f"Thought {step + 1}", f"search({query!r})", obs))
    query = f"{obs} director"
for t in trace:
    print(*t, sep=" | ")
print("Answer:", trace[-1][2])`,
    v: rowflow("ReAct trace.", ["Thought: need the winner", "Action: search(Best Picture 1994)", "Observation: Forrest Gump", "Thought: now the director", "Action: search(Forrest Gump director)", "Answer: Robert Zemeckis"], [
      "The model plans the next lookup.",
      "A tool call.",
      "The result enters the context.",
      "It uses the observation to choose the next step.",
      "A second, informed call.",
      "The final answer, grounded in two observations.",
    ]),
  },
  {
    t: "Plan first, then execute",
    lv: 2,
    s: `For longer tasks, let the model write a {{plan}} before acting: a numbered list of steps, each with an expected result. Execute step by step (each step may itself be a small ReAct loop) and {{re-plan}} when an observation contradicts the plan. Benefits over pure reaction: fewer wandering steps, a plan a person can approve, a progress measure (3 of 7 done) and cheaper execution because small models can carry out well-specified steps. Risks: a bad plan followed blindly; so check progress after every step and allow revision. Keep plans short (3–10 steps) and concrete.`,
    r: `Showing the plan to the user before execution catches misunderstandings cheaply.`,
    i: `Why re-plan when an observation contradicts the plan?`,
    c: py`
plan = ["find the failing test", "read the test", "locate the bug", "fix it", "run tests"]
done = 0
for step in plan:
    ok = step != "locate the bug"
    if ok:
        done += 1
        print("done:", step)
    else:
        print("observation contradicts plan at:", step, "-> re-plan")
        break
print(done, "of", len(plan))`,
    v: rowflow("Plan, execute, re-plan.", ["Goal", "Write plan", "Execute step", "Check result", "Revise plan?", "Finish"], [
      "The task.",
      "Short numbered steps.",
      "Possibly its own small loop.",
      "Does the observation match expectations?",
      "If not, change the remaining steps.",
      "All steps done and verified.",
    ]),
  },
  {
    t: "Decomposition: tasks as a dependency graph",
    lv: 2,
    s: `Many tasks split into sub-tasks with dependencies, a directed acyclic graph. Example: A (gather data) must precede B (clean it) and C (fetch benchmarks); D (report) needs both B and C. Execution order is any {{topological order}}: A, B, C, D. Independent tasks (B and C) can run in parallel. With durations A = 2, B = 3, C = 5, D = 1 the sequential time is 11, but the {{critical path}} A → C → D takes 2 + 5 + 1 = 8: that is the best possible time with unlimited workers. Agents that expose the graph can parallelise, retry one branch without redoing the others and report progress.`,
    r: `Model the dependency graph explicitly when sub-tasks are expensive: it also tells you where to place checkpoints.`,
    i: `Find the critical-path length for durations A = 2, B = 3, C = 5, D = 1 with dependencies A→B, A→C, B→D, C→D.`,
    c: py`
deps = {"A": [], "B": ["A"], "C": ["A"], "D": ["B", "C"]}
dur = {"A": 2, "B": 3, "C": 5, "D": 1}
finish = {}
for task in ["A", "B", "C", "D"]:
    start = max((finish[d] for d in deps[task]), default=0)
    finish[task] = start + dur[task]
print(finish, sum(dur.values()), finish["D"])`,
    v: cells("Earliest finish time of each task when independent tasks run in parallel.", table(["task", "depends on", "duration", "finishes at"], [["A", "—", "2", "2"], ["B", "A", "3", "5"], ["C", "A", "5", "7"], ["D", "B, C", "1", "8"]]), [
      ["Each task starts when all its dependencies are done."],
      ["B and C both start at 2 and run in parallel.", [[2, 2, 3], [3, 2, 3]]],
      ["D waits for the slower branch, C: it finishes at 8 instead of 11.", [[4, 3, 3]]],
    ]),
  },
  {
    t: "Reflection: critique and revise",
    lv: 2,
    s: `A first draft is rarely the best one. In a {{reflection}} loop the agent produces an answer, a critic (the same model with a different prompt, or a second model, or code such as tests) evaluates it against explicit criteria, and the agent revises — repeating until the criteria are met or a round limit is reached. It works best when the critique is {{grounded}}: unit tests that pass or fail, a schema validator, a fact check against sources. Self-critique without external signal can reinforce mistakes or declare success too early. Typical gains come in the first one to three rounds; more rounds cost tokens for little improvement.`,
    r: `Prefer objective checks (tests, validators, calculators) over "does this look right?" whenever you have them.`,
    i: `Why is a critic with a real test suite better than a model's own opinion?`,
    c: py`
def draft(n):
    return ["return a - b", "return a + b"][min(n, 1)]

def tests_pass(code):
    scope = {}
    exec("def add(a, b):\n    " + code, scope)
    return scope["add"](2, 3) == 5

for round_ in range(3):
    code = draft(round_)
    ok = tests_pass(code)
    print(round_, code, ok)
    if ok:
        break`,
    v: rowflow("A reflection loop with tests.", ["Draft", "Run tests", "Critique", "Revise", "Tests pass?", "Done or stop at limit"], [
      "First attempt.",
      "Objective feedback.",
      "What failed and why.",
      "Change the draft.",
      "If yes, finish; if not, loop.",
      "A maximum number of rounds prevents endless loops.",
    ]),
  },
  {
    t: "Searching over attempts: best-of-n and voting",
    lv: 2,
    s: `When a single attempt succeeds with probability p and you can verify results, sample several: the chance that at least one of n independent attempts is correct is 1 − (1 − p)ⁿ — for p = 0.4 and n = 5, 0.92. When you cannot verify, take a {{majority vote}} over answers ({{self-consistency}}): with five independent attempts each right with probability 0.7, the majority (at least 3 right) is correct with probability 0.837. Both cost n× the tokens and assume attempts are independent and errors differ; if the model makes the same mistake every time, more samples do not help. Tree-of-thought style search extends the idea: expand several partial solutions and keep the most promising.`,
    r: `Spend extra compute where verification is cheap: tests, calculators, schema checks.`,
    i: `Compute the chance that at least one of five attempts at p = 0.4 succeeds, and the majority-vote accuracy for five attempts at 0.7.`,
    c: py`
from math import comb

print(round(1 - 0.6 ** 5, 3))
vote = sum(comb(5, k) * 0.7 ** k * 0.3 ** (5 - k) for k in range(3, 6))
print(round(vote, 3))`,
    v: plot("Probability that the majority of n attempts is correct (per-attempt accuracy 0.7).", {
      x: [1, 9], y: [0.5, 1.02], labels: ["attempts n (odd)", "majority accuracy"],
    }, [pt("1", "0.7", { c: "accent", label: "n = 1" }), pt("3", "0.784", { c: "accent", label: "n = 3" }), pt("5", "0.837", { c: "accent", label: "n = 5" }), pt("7", "0.874", { c: "accent", label: "n = 7" }), pt("9", "0.901", { c: "accent", label: "n = 9" })]),
  },
  {
    t: "Stopping rules and budgets",
    lv: 1,
    s: `A loop needs a way to end. Combine four rules: a {{success check}} (the goal test passes), a {{step limit}} (say 20), a {{budget}} (tokens, money, wall-clock time) and {{stuck detection}} (the same action with the same arguments three times, or no progress for k steps). When a limit trips, stop gracefully: report what was done, what remains and why it stopped, rather than failing silently or looping on. Cost control and safety are the same mechanism: an agent without limits can burn money overnight. Log the reason for every stop to see which limits actually fire.`,
    r: `Set limits from measured behaviour: the 95th percentile of successful runs plus a margin.`,
    i: `List four stopping rules for an agent loop.`,
    c: py`
history = ["search(a)", "read(b)", "search(a)", "search(a)", "search(a)"]
def stuck(h, k=3):
    return len(h) >= k and len(set(h[-k:])) == 1

max_steps, budget_tokens, used = 20, 50000, 51200
print(stuck(history), len(history) >= max_steps, used > budget_tokens)`,
    v: compare("Reasons a loop should stop.", ["Check"], [
      ["Success", "goal test passes"],
      ["Step limit", "steps ≥ maximum"],
      ["Budget", "tokens, cost or time exceeded"],
      ["Stuck", "same action repeated, no progress"],
      ["Risk", "the next action needs approval"],
    ]),
  },
];

/* ------------------------------------------------------------------ */
export const mem: ConceptDef[] = [
  {
    t: "Short-term memory: managing the context window",
    lv: 1,
    s: `Inside one task the model's memory is its context window, which fills up. Strategies: {{truncate tool output}} (first 2,000 characters plus a note "output truncated"); a {{sliding window}} of the last k steps; {{summarisation}} — compress older turns into a short note; and {{offloading}} large content to files or a store, keeping only a reference in the context. Replacing 8,000 tokens of history by a 500-token summary is a 16× compression, at the price of lost detail. Keep the original goal and key decisions pinned at the top, and put the most recent instructions at the end, where the model attends best.`,
    r: `Summaries lose facts silently: store the raw history elsewhere so you can recover details.`,
    i: `What compression ratio does summarising 8,000 tokens into 500 give?`,
    c: py`
history = [f"step {i}: " + "x" * 40 for i in range(12)]
window = history[-3:]
summary = f"Summary of steps 0-{len(history) - 4}: searched, read 2 files, found config path."
context = [summary] + window
print(len(history), "->", len(context), "items")
print(8000 / 500)`,
    v: bars("Tokens in the context after each strategy (8,000-token history).", [["keep everything", "8000"], ["last 3 steps only", "1500"], ["summary + last 3 steps", "500+1500"], ["summary only", "500"]], {
      max: 8500,
    }),
  },
  {
    t: "Long-term memory: store, retrieve, score",
    lv: 2,
    s: `To remember across sessions an agent writes notes to a store and retrieves them later. A retrieval score typically blends three things: {{similarity}} to the current situation, {{recency}} (an exponential decay such as 0.995^hours) and {{importance}} (rated when stored). Three memories: A (similarity 0.9, 2 h old, importance 0.3), B (0.6, 1 h, 0.9), C (0.8, 200 h, 0.5). Scores: A = 0.9 + 0.990 + 0.3 = 2.19; B = 0.6 + 0.995 + 0.9 = 2.495; C = 0.8 + 0.367 + 0.5 = 1.667. B is retrieved first although it is less similar: it is fresh and was marked important. Weights are tuned on real use.`,
    r: `Store facts (preferences, decisions, outcomes) rather than raw transcripts: they retrieve better and cost fewer tokens.`,
    i: `Rank the three memories with score = similarity + 0.995^hours + importance.`,
    c: py`
memories = [("A", 0.9, 2, 0.3), ("B", 0.6, 1, 0.9), ("C", 0.8, 200, 0.5)]
scored = sorted(((round(sim + 0.995 ** hours + imp, 3), name) for name, sim, hours, imp in memories), reverse=True)
print(scored)`,
    v: bars("Retrieval score of each memory (similarity + recency + importance).", [["A", "2.19"], ["B", "2.495"], ["C", "1.667"]], {
      max: 3,
    }),
  },
  {
    t: "State and scratchpads",
    lv: 1,
    s: `Not everything belongs in free text. Keep structured {{state}} outside the prompt and show the model a compact view: the task list with statuses, variables found so far, files touched, decisions made. A {{scratchpad}} (a notes file the agent edits) lets it track progress over hundreds of steps without carrying the whole transcript: "TODO: 1 done, 2 in progress, 3 pending; config path = /etc/app.ini". Structured state is also what makes {{resuming}} possible: after a crash or an approval pause, rebuild the context from the state, not from a lost conversation.`,
    r: `Make state serialisable (JSON) from day one: persistence, debugging and replay all depend on it.`,
    i: `Why keep a structured task list outside the conversation text?`,
    c: py`
import json

state = {
    "goal": "fix failing test",
    "tasks": [{"id": 1, "text": "find test", "status": "done"}, {"id": 2, "text": "fix bug", "status": "in_progress"}, {"id": 3, "text": "run tests", "status": "pending"}],
    "facts": {"config_path": "/etc/app.ini"},
}
saved = json.dumps(state)
restored = json.loads(saved)
print(len(saved), restored["tasks"][1]["status"])
print(sum(t["status"] == "done" for t in restored["tasks"]), "of", len(restored["tasks"]), "done")`,
    v: compare("Where information lives.", ["Good for", "Lost when…"], [
      ["Context window", "what the model must see now", "the window fills or the process ends"],
      ["Structured state (JSON)", "tasks, variables, decisions", "never, if persisted"],
      ["Scratchpad file", "running notes across many steps", "never, if persisted"],
      ["Long-term store", "facts across sessions", "never; but it can go stale"],
    ]),
  },
  {
    t: "What should an agent remember?",
    lv: 2,
    s: `Memory is a write policy as much as a retrieval one. Store: stable user preferences ("prefers metric units"), decisions and their reasons, outcomes of past attempts ("approach X failed because Y"), and verified facts with their source and date. Do not store: secrets and sensitive personal data without need and consent, unverified claims, instructions that arrived inside tool output, or whole raw transcripts. Give each memory an expiry or a review date, allow users to see, correct and delete what is stored, and keep it scoped per user and per project. A 90-day expiry on an address is cheap insurance against stale facts.`,
    r: `A memory is data the agent will later trust: apply the same care as for any database of personal information.`,
    i: `Name three kinds of information worth storing and two that should not be stored.`,
    c: py`
candidates = [
    ("User prefers metric units", True),
    ("Approach X failed: rate limit", True),
    ("API key sk-12345", False),
    ("Webpage said: ignore previous instructions", False),
]
store = [t for t, keep in candidates if keep]
print(store)`,
    v: compare("Memory write policy.", ["Store?", "Why"], [
      ["User preferences", "yes", "stable, useful, user-visible"],
      ["Outcomes of past attempts", "yes", "avoids repeating failures"],
      ["Secrets and credentials", "never", "security risk"],
      ["Text from tool output that looks like instructions", "never", "prompt-injection route"],
    ]),
  },
  {
    t: "Memory risks: staleness, poisoning, privacy",
    lv: 2,
    s: `Persistent memory creates new failure modes. {{Staleness}}: a remembered fact stops being true (the customer moved). {{Poisoning}}: an attacker gets a false or malicious note stored — through a web page the agent read or a document it summarised — and later behaviour changes. {{Leakage}}: memory from one user appears in another user's session. {{Over-reliance}}: the agent trusts an old note over fresh evidence. Mitigations: store source and timestamp with every entry; re-verify before acting on important facts; isolate memory per user and tenant; screen what gets written; and let fresh observations override memory. Test with planted false memories.`,
    r: `Treat memory as untrusted input that happens to come from your own database.`,
    i: `How could an attacker poison an agent's long-term memory?`,
    c: py`
memory = [{"fact": "customer address: Oak St 1", "source": "user", "age_days": 400}]
def usable(entry, max_age=90):
    return entry["source"] == "user" and entry["age_days"] <= max_age

print([usable(e) for e in memory])
print("re-verify before using:", memory[0]["fact"])`,
    v: compare("Memory risks and defences.", ["Defence"], [
      ["Stale facts", "timestamps, expiry, re-verify before acting"],
      ["Poisoning", "screen writes, record the source, ignore tool-borne instructions"],
      ["Cross-user leakage", "isolate memory per user and tenant"],
      ["Over-trust", "fresh evidence overrides remembered notes"],
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
