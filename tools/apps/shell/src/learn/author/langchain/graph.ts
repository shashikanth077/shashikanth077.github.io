import { P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline } from "../../visuals/kit.js";
import { py, type ConceptDef } from "../build.js";
import { table } from "../ml/data.js";
import { rowflow } from "./lib.js";

/* Every code example is plain Python and is RUN by `npm run outputs -- langchain-langgraph-rag`.
   LangGraph is not installed here: GRAPH below is a ~70-line stand-in that mirrors its model —
   state with reducers, nodes, edges, conditional edges, super-steps, checkpointers with
   thread_id, interrupt() and Command(resume=...). Real API names (StateGraph, START, END,
   add_node, add_edge, add_conditional_edges, compile, invoke, InMemorySaver, interrupt, Command,
   Send, recursion_limit) were checked against the LangGraph documentation on 2026-10-16. */

const GRAPH = `
START, END = "__start__", "__end__"


class Interrupt(Exception):
    def __init__(self, value):
        self.value = value


_resume = {"has": False, "value": None}


def interrupt(value):
    if _resume["has"]:
        _resume["has"] = False
        return _resume["value"]
    raise Interrupt(value)


class Command:
    def __init__(self, resume=None, update=None, goto=None):
        self.resume, self.update, self.goto = resume, update, goto


def add_list(old, new):
    return (old or []) + (new if isinstance(new, list) else [new])


class StateGraph:
    def __init__(self, reducers=None):
        self.reducers = reducers or {}
        self.nodes, self.edges, self.cond = {}, {}, {}

    def add_node(self, name, fn):
        self.nodes[name] = fn
        return self

    def add_edge(self, a, b):
        self.edges.setdefault(a, []).append(b)
        return self

    def add_conditional_edges(self, a, router):
        self.cond[a] = router
        return self

    def compile(self, checkpointer=None):
        return Compiled(self, checkpointer)


class Compiled:
    def __init__(self, g, checkpointer):
        self.g, self.cp = g, checkpointer

    def _merge(self, state, update):
        for k, v in (update or {}).items():
            state[k] = self.g.reducers[k](state.get(k), v) if k in self.g.reducers else v
        return state

    def invoke(self, inputs, config=None, recursion_limit=25):
        thread = (config or {}).get("configurable", {}).get("thread_id")
        saved = self.cp.load(thread) if (self.cp and thread) else None
        if isinstance(inputs, Command) and saved:
            state, active = dict(saved["state"]), list(saved["next"])
            _resume.update(has=True, value=inputs.resume)
        elif saved and saved.get("done"):
            state, active = dict(saved["state"]), list(self.g.edges.get(START, []))
            state = self._merge(state, inputs)
        else:
            state, active = self._merge({}, inputs), list(self.g.edges.get(START, []))
        steps = 0
        while active:
            steps += 1
            if steps > recursion_limit:
                raise RuntimeError("GraphRecursionError")
            snapshot, updates, next_nodes = dict(state), [], []
            for name in active:
                try:
                    out = self.g.nodes[name](snapshot)
                except Interrupt as e:
                    if self.cp and thread:
                        self.cp.save(thread, {"state": state, "next": active, "done": False})
                    return {**state, "__interrupt__": e.value}
                if isinstance(out, Command):
                    updates.append(out.update)
                    next_nodes += [out.goto] if out.goto else []
                else:
                    updates.append(out)
            for u in updates:
                state = self._merge(state, u)
            for name in active:
                if name in self.g.cond:
                    r = self.g.cond[name](state)
                    next_nodes += r if isinstance(r, list) else [r]
                else:
                    next_nodes += self.g.edges.get(name, [])
            active = [n for n in dict.fromkeys(next_nodes) if n != END]
            if self.cp and thread:
                self.cp.save(thread, {"state": state, "next": active, "done": not active})
        return state


class InMemorySaver:
    def __init__(self):
        self.store, self.history = {}, {}

    def load(self, thread):
        return self.store.get(thread)

    def save(self, thread, snap):
        self.store[thread] = snap
        self.history.setdefault(thread, []).append({"state": dict(snap["state"]), "next": list(snap["next"])})
`;

export const lg: ConceptDef[] = [
  {
    t: "Why LangGraph: agents as stateful graphs",
    lv: 1,
    s: `{{LangGraph}} is "a low-level orchestration framework and runtime for building, managing, and deploying long-running, stateful agents". You describe the program as a {{graph}}: a shared {{state}}, {{nodes}} (functions that read the state and return updates) and {{edges}} (which node runs next, fixed or chosen at run time). Three benefits follow from running it as a graph with saved state: {{durable execution}} (survive failures and resume where you left off), {{human-in-the-loop}} (pause, inspect and edit state, then continue) and {{memory}} (short-term per conversation, long-term across sessions). Install: pip install -U langgraph. Use it when a plain loop stops being enough: several steps with branching, approvals, retries, parallel work or hours-long tasks.`,
    r: `A graph makes the control flow explicit: you can draw it, test each node and evaluate each path.`,
    i: `What three things does running an agent as a LangGraph graph give you?`,
    c: py`${GRAPH}
graph = StateGraph({"messages": add_list})
graph.add_node("mock_llm", lambda state: {"messages": "hello world"})
graph.add_edge(START, "mock_llm")
graph.add_edge("mock_llm", END)
app = graph.compile()
print(app.invoke({"messages": "hi!"}))`,
    v: rowflow("The shape of every LangGraph program.", ["State schema", "Nodes (functions)", "Edges (routes)", "compile()", "invoke() / stream()", "Final state"], [
      "What the graph remembers: messages, counters, results.",
      "Each reads the state and returns an update.",
      "START → node → … → END, fixed or conditional.",
      "Produces a runnable graph.",
      "Runs super-step by super-step.",
      "The merged state, checkpointed if you ask.",
    ]),
  },
  {
    t: "State and reducers",
    lv: 1,
    s: `The {{state}} is a shared schema — usually a TypedDict (a dataclass for defaults, a Pydantic model for validation). Nodes do not modify it directly: they return a partial update, and LangGraph merges it key by key. Without a reducer an update {{replaces}} the value; with a {{reducer}} — a function of (current, update) attached with Annotated, such as operator.add — updates are combined. {{add_messages}} is the reducer for message lists: it appends new messages and updates existing ones by id; MessagesState is a prebuilt state with a messages key using it. Reducers are what make parallel nodes safe: two nodes writing the same key are merged, not overwritten. Design the state small and explicit: it is also what gets checkpointed.`,
    r: `If a key is written by more than one node in the same step it needs a reducer; otherwise the result depends on order.`,
    i: `What is the difference between a key with a reducer and one without?`,
    c: py`${GRAPH}
g = StateGraph({"log": add_list})
g.add_node("a", lambda s: {"log": "step a", "answer": "first"})
g.add_node("b", lambda s: {"log": "step b", "answer": "second"})
g.add_edge(START, "a").add_edge("a", "b").add_edge("b", END)
print(g.compile().invoke({"log": ["start"]}))`,
    v: compare("Updating a state key.", ["Without reducer", "With reducer (add)"], [
      ["Node returns", "{'answer': 'second'}", "{'log': 'step b'}"],
      ["Result", "replaces the old value", "combined with the old value"],
      ["Typical keys", "latest result, flags", "message lists, logs, collected results"],
      ["Parallel writers", "order-dependent", "all updates kept"],
    ]),
  },
  {
    t: "Nodes, edges and super-steps",
    lv: 1,
    s: `A {{node}} is a function (sync or async) that takes the state and returns an update. A {{normal edge}} (add_edge(a, b)) always goes from a to b; special nodes {{START}} and {{END}} mark entry and exit. Execution proceeds in discrete {{super-steps}}: all nodes that are active at the same time run in one step against the same snapshot of the state, their updates are merged, and the edges decide which nodes are active next. The graph stops when no node has pending work. Two nodes both reached from START run in parallel in step 1 and a node with two incoming edges runs once both have finished — the fan-out/fan-in pattern. You must call compile() before invoke().`,
    r: `Think in super-steps: nodes in the same step cannot see each other's updates until the step ends.`,
    i: `Which nodes run in parallel, and when does a node with two incoming edges run?`,
    c: py`${GRAPH}
g = StateGraph({"log": add_list})
for name in "abc":
    g.add_node(name, lambda s, n=name: {"log": f"{n} saw {sorted(s['log'])}"})
g.add_edge(START, "a").add_edge(START, "b").add_edge("a", "c").add_edge("b", "c").add_edge("c", END)
result = g.compile().invoke({"log": []})
for line in result["log"]:
    print(line)`,
    v: cells("Super-steps of the fan-out / fan-in graph.", table(["super-step", "nodes that run", "see in the state"], [["1", "a, b (in parallel)", "nothing yet"], ["2", "c", "both updates"], ["end", "—", "merged state"]]), [
      ["Nodes with an edge from START run together."],
      ["a and b run in step 1 on the same snapshot.", [[1, 1, 1]]],
      ["c waits for both and runs in step 2.", [[2, 1, 2]]],
    ]),
  },
  {
    t: "Conditional edges: routing at run time",
    lv: 1,
    s: `A {{conditional edge}} (add_conditional_edges(node, routing_function)) lets the graph choose the next step from the state: the routing function returns the name of the next node (or several, or END). It is how loops, branches and stopping rules are expressed — "if the model asked for a tool go to the tool node, otherwise finish", "if the grade is poor rewrite the query, otherwise generate". A {{Command}} returned from a node can combine a state update and the next node (update=…, goto=…) in one value; avoid mixing Command routing and static edges on the same node, because the static edges still run. Keep routing functions tiny and pure: they are the decision logic you will test most.`,
    r: `Write the routing function as a plain function of the state so it can be unit-tested without a model.`,
    i: `What does a conditional edge's routing function return?`,
    c: py`${GRAPH}
def route(state):
    return "retry" if state["score"] < 0.7 and state["tries"] < 3 else END

g = StateGraph()
g.add_node("grade", lambda s: {"score": 0.4 + 0.2 * s.get("tries", 0), "tries": s.get("tries", 0) + 1})
g.add_node("retry", lambda s: {})
g.add_edge(START, "grade").add_conditional_edges("grade", route).add_edge("retry", "grade")
print(g.compile().invoke({}))`,
    v: rowflow("A retry loop built with a conditional edge.", ["grade", "route(state)", "retry", "grade again", "END"], [
      "Compute a score.",
      "Poor score and tries left → retry; otherwise END.",
      "Improve (rewrite the query, change settings).",
      "The loop returns to the grade node.",
      "Stop when good enough or out of tries.",
    ]),
  },
  {
    t: "The tool-calling agent as a graph",
    lv: 2,
    s: `LangGraph's documentation builds an agent in three pieces. {{llm_call}} (a node): call the model with the messages — a model with tools attached via bind_tools — and return its AI message. {{tool_node}} (a node): for each tool call in the last message run the tool and return ToolMessages. {{should_continue}} (a conditional edge from llm_call): if the last message has tool_calls go to tool_node, otherwise END. Plus one normal edge tool_node → llm_call closes the loop. The same loop as create_agent, but now every step is yours to change: add a node that checks the output, a second tool node for risky tools with an approval interrupt, or a route to a cheaper model for simple steps.`,
    r: `Start with create_agent; build the graph yourself when you need to insert steps into the loop.`,
    i: `Name the two nodes and the routing function of the basic agent graph.`,
    c: py`${GRAPH}
tools = {"add": lambda a, b: a + b}

def llm_call(state):
    last = state["messages"][-1]
    if last["role"] == "user":
        return {"messages": [{"role": "ai", "tool_calls": [{"id": "c1", "name": "add", "args": {"a": 2, "b": 3}}]}]}
    return {"messages": [{"role": "ai", "content": f"The answer is {last['content']}.", "tool_calls": []}]}

def tool_node(state):
    out = []
    for call in state["messages"][-1]["tool_calls"]:
        out.append({"role": "tool", "tool_call_id": call["id"], "content": str(tools[call["name"]](**call["args"]))})
    return {"messages": out}

def should_continue(state):
    return "tool_node" if state["messages"][-1]["tool_calls"] else END

g = StateGraph({"messages": add_list})
g.add_node("llm_call", llm_call).add_node("tool_node", tool_node)
g.add_edge(START, "llm_call").add_conditional_edges("llm_call", should_continue).add_edge("tool_node", "llm_call")
final = g.compile().invoke({"messages": [{"role": "user", "content": "2 + 3?"}]})
print([m["role"] for m in final["messages"]], final["messages"][-1]["content"])`,
    v: rowflow("The agent graph.", ["START", "llm_call", "should_continue?", "tool_node", "back to llm_call", "END"], [
      "The user's message enters the state.",
      "Model with tools returns an AI message.",
      "tool_calls present → tool_node, else END.",
      "Run each tool, return ToolMessages.",
      "The loop: the model sees the results.",
      "A final answer without tool calls.",
    ]),
  },
  {
    t: "Parallelism, recursion limits and runaway loops",
    lv: 2,
    s: `Nodes that share a super-step run in parallel, which is the cheapest way to cut latency for independent work (three searches at once). Loops are limited by the {{recursion_limit}}: a top-level config key (not inside configurable) capping the number of super-steps; exceeding it raises {{GraphRecursionError}}. The documentation states the default is 1000 starting with version 1.0.6 — a runaway agent can burn many model calls before it trips, so set a limit that matches the task (for example 25) and also bound the loop in your own routing function (a step counter in the state). Inside a node, RemainingSteps lets you route gracefully — wrap up and answer — before the limit is hit rather than failing. Always combine step limits with token and time budgets.`,
    r: `A limit that stops the run with an error is a safety net; a graceful "I ran out of steps, here is what I have" is the product.`,
    i: `Where is recursion_limit set and what happens when it is exceeded?`,
    c: py`${GRAPH}
g = StateGraph()
g.add_node("loop", lambda s: {"n": s.get("n", 0) + 1})
g.add_edge(START, "loop").add_edge("loop", "loop")
app = g.compile()
try:
    app.invoke({}, recursion_limit=5)
except RuntimeError as e:
    print("stopped:", e)
g2 = StateGraph()
g2.add_node("loop", lambda s: {"n": s.get("n", 0) + 1})
g2.add_edge(START, "loop").add_conditional_edges("loop", lambda s: END if s["n"] >= 4 else "loop")
print(g2.compile().invoke({}, recursion_limit=5))`,
    v: compare("Two ways to stop a loop.", ["Behaviour"], [
      ["recursion_limit (config, top level)", "raises GraphRecursionError after N super-steps"],
      ["step counter in the state + conditional edge", "ends normally with a partial or graceful result"],
      ["RemainingSteps in a node", "route to a wrap-up node before the limit"],
    ]),
  },
  {
    t: "Send: dynamic fan-out and orchestrator–worker",
    lv: 2,
    s: `Sometimes the number of parallel branches is known only at run time — an orchestrator splits a report into however many sections the topic needs. LangGraph's {{Send}} API handles this: a routing function returns a list of Send(node, state) objects, one per sub-task, each with its own input state; the workers run in parallel and their outputs are merged into the shared state by a reducer (typically a list that accumulates results); a final node synthesises them. This is the {{orchestrator–worker}} pattern from the agentic track as a graph: orchestrator (plan) → workers (Send, parallel) → synthesizer. Remember the costs: each worker has its own model call and context, so a plan of 10 sections means at least 10 calls.`,
    r: `Give workers a compact brief, not the whole state; and cap the number of workers the orchestrator may create.`,
    i: `What does a routing function return to start a variable number of workers, and how are their results combined?`,
    c: py`
def orchestrator(topic):
    return [f"{topic}: background", f"{topic}: risks", f"{topic}: costs"]

def worker(subtask):
    return f"notes on '{subtask}'"

class Send:
    def __init__(self, node, state):
        self.node, self.state = node, state

plan = orchestrator("vector databases")
sends = [Send("worker", {"subtask": s}) for s in plan]
results = [worker(s.state["subtask"]) for s in sends]
print(len(sends), "workers")
print(results)
print("synthesised:", " | ".join(r.split("'")[1] for r in results))`,
    v: rowflow("Orchestrator–worker with Send.", ["Orchestrator plans", "Send × n", "Workers in parallel", "Results merged (reducer)", "Synthesizer", "Report"], [
      "A list of sub-tasks decided at run time.",
      "One Send(node, state) per sub-task.",
      "Each worker runs with its own input state.",
      "A list reducer collects the outputs.",
      "Combines the notes into one answer.",
      "Final result.",
    ]),
  },
  {
    t: "Checkpointers and threads: persistence",
    lv: 2,
    s: `Compile a graph with a {{checkpointer}} and LangGraph saves the state after every super-step as a checkpoint, keyed by a {{thread_id}} you pass in config={"configurable": {"thread_id": "…"}}. That gives conversation continuity (a second invoke on the same thread continues from the saved state), human-in-the-loop, {{time travel}} (replay or fork from an earlier checkpoint) and fault tolerance (resume after a crash). Implementations: InMemorySaver (RAM, lost on restart), SqliteSaver (local file, development) and PostgresSaver / AsyncPostgresSaver (production). Different thread ids are independent conversations. Checkpoints accumulate: plan pruning or retention, keep thread ids under 255 characters for PostgresSaver, and remember that checkpoints store your state — treat them as data with privacy obligations.`,
    r: `Use a durable checkpointer in production; an in-memory one loses every conversation on restart.`,
    i: `What identifies a conversation to a checkpointer, and which saver would you use in production?`,
    c: py`${GRAPH}
cp = InMemorySaver()
g = StateGraph({"messages": add_list})
g.add_node("reply", lambda s: {"messages": f"I have seen {len(s['messages'])} message(s)"})
g.add_edge(START, "reply").add_edge("reply", END)
app = g.compile(checkpointer=cp)
t1, t2 = {"configurable": {"thread_id": "thread-1"}}, {"configurable": {"thread_id": "thread-2"}}
print(app.invoke({"messages": "Hi, my name is Bob."}, t1)["messages"])
print(app.invoke({"messages": "What is my name?"}, t1)["messages"])
print(app.invoke({"messages": "Hello"}, t2)["messages"])
print(len(cp.history["thread-1"]), "checkpoints saved for thread-1")`,
    v: compare("Checkpointer options.", ["Where state lives", "Use"], [
      ["InMemorySaver", "process memory (lost on restart)", "tests, demos"],
      ["SqliteSaver", "a local file", "development, small tools"],
      ["PostgresSaver / AsyncPostgresSaver", "a PostgreSQL database", "production"],
    ]),
  },
  {
    t: "Interrupts: human-in-the-loop",
    lv: 2,
    s: `Inside a node, {{interrupt(value)}} pauses the graph: the state is saved by the checkpointer and the value (any JSON-serialisable payload, for example "Approve this refund of 120?") is returned to the caller under __interrupt__. The graph waits — for seconds or days. To continue, invoke again with {{Command(resume=answer)}} on the {{same thread_id}}; the resume value becomes the return value of the interrupt() call. A checkpointer and a thread id are required. One rule matters: on resume {{the runtime restarts the whole node from its beginning}}, so any code before interrupt() runs again — keep side effects there idempotent or move them after the interrupt, and never wrap interrupt() in a bare try/except, which would swallow the pause. Typical uses: approve a tool call, edit a draft, supply missing information.`,
    r: `Put the approval before the side effect, and show the reviewer the exact action — not only the model's description of it.`,
    i: `What does Command(resume=...) return to the node and why must code before interrupt() be idempotent?`,
    c: py`${GRAPH}
effects = []
def approve_refund(state):
    effects.append("node started")
    decision = interrupt(f"Approve refund of {state['amount']}?")
    return {"approved": decision}

g = StateGraph()
g.add_node("approve", approve_refund)
g.add_node("pay", lambda s: {"result": "refund paid" if s["approved"] else "refund refused"})
g.add_edge(START, "approve").add_edge("approve", "pay").add_edge("pay", END)
app = g.compile(checkpointer=InMemorySaver())
cfg = {"configurable": {"thread_id": "refund-42"}}
first = app.invoke({"amount": 120}, cfg)
print(first["__interrupt__"])
final = app.invoke(Command(resume=True), cfg)
print(final["result"], "| node ran", len(effects), "times (restarts from its start on resume)")`,
    v: rowflow("Pause and resume.", ["Node calls interrupt()", "State saved", "Caller sees __interrupt__", "Human decides", "Command(resume=answer)", "Node restarts; interrupt() returns the answer"], [
      "The graph stops at this point.",
      "The checkpointer stores the state under the thread id.",
      "Payload: the question for the human.",
      "Minutes or days later.",
      "Same thread id.",
      "Code before interrupt() runs again: keep it idempotent.",
    ]),
  },
  {
    t: "Memory: checkpointer versus store",
    lv: 2,
    s: `Two kinds of memory. {{Short-term}} memory is the thread's state, persisted by the checkpointer: the conversation so far, scoped to one {{thread_id}}. {{Long-term}} memory is persisted by a {{Store}} (InMemoryStore in the documentation's example; database-backed stores in production): application-defined key–value data outside the graph state — user preferences, facts, shared knowledge — readable and writable from nodes and available {{across threads}}. Compile with both: builder.compile(checkpointer=checkpointer, store=store). Namespace store items (for example by user id) so one user's memory never reaches another's, give items a source and a date, and keep subgraph data that must cross graph boundaries in the store, because subgraphs have their own checkpoint namespace.`,
    r: `Treat the store like a user database: consent, deletion, expiry and per-user isolation.`,
    i: `Compare what a checkpointer and a store persist and their scopes.`,
    c: py`
class InMemoryStore:
    def __init__(self):
        self.data = {}
    def put(self, namespace, key, value):
        self.data[(namespace, key)] = value
    def get(self, namespace, key):
        return self.data.get((namespace, key))

store = InMemoryStore()
store.put(("users", "bob"), "preferences", {"units": "metric"})
store.put(("users", "anna"), "preferences", {"units": "imperial"})
print(store.get(("users", "bob"), "preferences"))
print(store.get(("users", "anna"), "preferences"))
print(store.get(("users", "carl"), "preferences"))`,
    v: compare("Checkpointer versus store.", ["Checkpointer", "Store"], [
      ["Persists", "graph state snapshots", "application-defined key–value data"],
      ["Scope", "one thread", "across threads"],
      ["Typical content", "the conversation, pending work", "preferences, facts, shared knowledge"],
      ["Passed to", "compile(checkpointer=…)", "compile(store=…)"],
    ]),
  },
  {
    t: "Workflow patterns as graphs",
    lv: 2,
    s: `LangGraph's documentation shows the standard patterns, each a small graph. {{Prompt chaining}}: each model call processes the previous output (draft → check → polish). {{Parallelization}}: independent calls at once, or the same call several times for confidence. {{Routing}}: classify the input, then send it to a specialised flow (pricing, refunds, support). {{Orchestrator–worker}}: plan, delegate with Send, synthesise. {{Evaluator–optimizer}}: generate, evaluate, and loop until the criteria are met, with an optional human in the loop. And finally the {{agent}}, where the model chooses the steps in a tool loop. Pick the least autonomous pattern that solves the problem: chaining and routing are cheap and testable, agents are flexible and costly.`,
    r: `Most production systems are workflows with one agent-like step, not free-roaming agents.`,
    i: `Which pattern fits: classify a ticket then use the right team's flow; improve a draft until it passes a rubric?`,
    c: py`${GRAPH}
def classify(s):
    return {"route": "refund" if "refund" in s["text"] else "support"}
def route(s):
    return s["route"]
g = StateGraph()
g.add_node("classify", classify).add_node("refund", lambda s: {"answer": "refund flow"}).add_node("support", lambda s: {"answer": "support flow"})
g.add_edge(START, "classify").add_conditional_edges("classify", route).add_edge("refund", END).add_edge("support", END)
app = g.compile()
print(app.invoke({"text": "I want a refund"})["answer"], "|", app.invoke({"text": "my app crashes"})["answer"])`,
    v: compare("Workflow patterns.", ["Shape", "Use"], [
      ["Prompt chaining", "call → call → call", "well-defined, verifiable steps"],
      ["Parallelization", "fan-out → merge", "independent sub-tasks, voting"],
      ["Routing", "classify → one of several flows", "different handling per input type"],
      ["Orchestrator–worker", "plan → Send workers → synthesise", "variable sub-tasks"],
      ["Evaluator–optimizer", "generate ⇄ evaluate loop", "quality bars, refinement"],
      ["Agent", "model chooses tools in a loop", "open-ended problems"],
    ]),
  },
  {
    t: "Multi-agent graphs: supervisor and sub-graphs",
    lv: 2,
    s: `Multi-agent systems fit graphs naturally. A {{supervisor}} node decides which specialist runs next (researcher, coder, reviewer) and returns a Command(goto=…, update=…); specialists are nodes — or whole {{sub-graphs}} with their own state and tools — that report back to the supervisor, which decides when to finish. Benefits: separate prompts, tools and context per role, explicit control flow, per-agent checkpoints. Costs: each hop is a model call, and information passed between agents is easy to lose: define what each specialist receives and returns. Note that sub-graphs manage their own checkpoint namespace, so the parent does not see their intermediate state immediately; use the store for data that must cross boundaries.`,
    r: `Start with one agent plus tools; split into a supervisor and specialists only when roles need different tools, prompts or permissions.`,
    i: `What does a supervisor node return to hand control to a specialist?`,
    c: py`${GRAPH}
def supervisor(state):
    done = state.get("done", [])
    for role in ("researcher", "writer"):
        if role not in done:
            return Command(goto=role, update={})
    return Command(goto=END, update={})

def specialist(role):
    return lambda s: {"done": s.get("done", []) + [role], "log": [f"{role} finished"]}

g = StateGraph({"log": add_list})
g.add_node("supervisor", supervisor)
for role in ("researcher", "writer"):
    g.add_node(role, specialist(role)).add_edge(role, "supervisor")
g.add_edge(START, "supervisor")
print(g.compile().invoke({"log": []}))`,
    v: rowflow("Supervisor pattern.", ["Supervisor", "Researcher", "Supervisor", "Writer", "Supervisor", "END"], [
      "Decides who works next.",
      "Gathers material, reports back.",
      "Checks what is done.",
      "Drafts the result.",
      "Sees everything is done.",
      "Return the final state.",
    ]),
  },
];

export const prod: ConceptDef[] = [
  {
    t: "Testing graphs with fake models",
    lv: 2,
    s: `Because a graph is made of functions, most of it can be tested without calling a model. Replace the chat model with a scripted fake that returns fixed AI messages (with or without tool_calls), then assert on the final state and on the path taken: given a tool call, does the graph reach tool_node and then END? Given a poor retrieval grade, does it retry at most twice? Test nodes as plain functions (state in, update out), routing functions on handcrafted states, reducers on their own, and interrupts by invoking, checking __interrupt__ and resuming. Keep a small set of end-to-end evaluations with a real model separately, because mocks cannot tell you whether the model behaves well.`,
    r: `Fast deterministic tests on every commit, real-model evaluations on a schedule: they catch different bugs.`,
    i: `How would you test that a routing function sends tool calls to the tool node?`,
    c: py`${GRAPH}
def should_continue(state):
    return "tool_node" if state["messages"][-1].get("tool_calls") else END

assert should_continue({"messages": [{"tool_calls": [{"id": "1"}]}]}) == "tool_node"
assert should_continue({"messages": [{"tool_calls": []}]}) == END
assert add_list([1], 2) == [1, 2] and add_list(None, [3]) == [3]
print("routing and reducer tests passed")`,
    v: compare("What to test and how.", ["Method"], [
      ["Nodes", "plain function tests: state in, update out"],
      ["Routing functions", "handcrafted states, assert the next node"],
      ["Reducers", "unit tests on (old, new)"],
      ["Interrupts", "invoke, assert __interrupt__, resume, assert result"],
      ["Model quality", "evaluation set with a real model, run on a schedule"],
    ]),
  },
  {
    t: "Tracing and observability",
    lv: 1,
    s: `An agent run is a tree: graph → node → model call → tool call. {{Tracing}} records every step with inputs, outputs, latency, tokens and cost, so you can see why an answer was wrong — which chunks were retrieved, what the model was told, which tool failed. LangChain's ecosystem offers LangSmith for tracing and evaluation, and any OpenTelemetry-compatible tool can do the same job; the principle is independent of the product. Practices: assign a run id per request and per thread, log prompt and tool versions, sample failures and expensive runs for review, track cost per solved task, success rate and p95 latency, mask personal data in traces, and keep the ability to replay a trace against a new prompt or model.`,
    r: `Turn tracing on from the first prototype: it is the cheapest debugging tool you will have.`,
    i: `What should a trace of a RAG run let you see?`,
    c: py`
trace = [
    {"step": "rewrite_query", "input": "how fast do I get my money back", "output": "refund days"},
    {"step": "retrieve", "k": 2, "hits": [("refunds.md", 0.81), ("shipping.md", 0.22)]},
    {"step": "llm", "tokens_in": 640, "tokens_out": 48, "latency_ms": 920},
]
for t in trace:
    print(t["step"], {k: v for k, v in t.items() if k != "step"})
cost = 640 / 1e6 * 3 + 48 / 1e6 * 15
print(round(cost, 5))`,
    v: rowflow("Reading a trace.", ["Question", "Rewritten query", "Retrieved chunks + scores", "Prompt sent", "Model output", "Cost and latency"], [
      "What the user asked.",
      "Was the rewrite sensible?",
      "Were the right chunks found?",
      "Exactly what the model saw.",
      "Was it faithful to the sources?",
      "Tokens, money, time.",
    ]),
  },
  {
    t: "Deploying and operating graph agents",
    lv: 2,
    s: `Operating long-running agents adds concerns beyond a script. {{Durability}}: use a database-backed checkpointer so a restart resumes runs. {{Idempotency}}: resumed nodes restart from their beginning, so side effects must tolerate repeats (idempotency keys). {{Concurrency}}: one thread id per conversation; avoid two simultaneous runs on the same thread. {{Timeouts, retries and budgets}}: per tool and per run, with a recursion limit and token budget. {{Versioning}}: a checkpoint written by one graph version may not match a changed state schema — plan migrations or finish old runs first. {{Security}}: tools run with your permissions; sandbox code execution, scope credentials, keep untrusted text out of instructions. {{Cost}}: monitor tokens per task and alert on spikes. Roll out gradually and keep a human fallback.`,
    r: `Test the crash path on purpose: kill the process mid-run and confirm it resumes without repeating effects.`,
    i: `Why can changing the state schema break resumed runs?`,
    c: py`
old_checkpoint = {"state": {"messages": ["hi"], "retries": 1}}
new_schema_keys = {"messages", "retries", "approved"}
missing = new_schema_keys - set(old_checkpoint["state"])
print("keys missing in old checkpoints:", sorted(missing))
runs = [("r1", "paused for approval 3 days"), ("r2", "crashed at step 7")]
print([r for r, _ in runs], "must resume with the schema that wrote them")`,
    v: compare("Operating checklist.", ["Why"], [
      ["Database-backed checkpointer", "runs survive restarts"],
      ["Idempotent side effects", "resumed nodes restart from their beginning"],
      ["Limits and budgets", "bound cost and runaway loops"],
      ["Schema versioning", "old checkpoints must still load"],
      ["Sandboxed, least-privilege tools", "limit what a mistake or injection can do"],
    ]),
  },
  {
    t: "Choosing: raw loop, LangChain agent or LangGraph",
    lv: 1,
    s: `A practical ladder. {{One call or a fixed chain}}: provider SDK or LCEL — keep it simple. {{A tool-using agent with standard behaviour}}: create_agent, with middleware for limits, summarisation and approvals. {{Custom control flow, branching, parallel work, approvals, long-running tasks}}: LangGraph. {{Retrieval}}: start with 2-step RAG on a vector store you already operate (pgvector is often enough), add query rewriting, grading, a reranker or an agentic search tool when evaluation shows a gap. At every rung: write the evaluation set first, trace everything, pin framework versions, keep prompts and tools outside the framework, and add autonomy only as measured reliability earns it.`,
    r: `The best framework is the smallest one that gives you the control and the persistence you actually need.`,
    i: `Give the right tool for: a nightly summariser, a customer-support agent with refunds that need approval, a document Q&A over a million chunks.`,
    c: py`
ladder = [
    ("single call / fixed chain", "provider SDK or LCEL"),
    ("tool-using agent, standard loop", "create_agent + middleware"),
    ("branching, approvals, long-running", "LangGraph with a durable checkpointer"),
    ("document Q&A", "2-step RAG on pgvector (or your store); add rewrite/grade/rerank when evaluation says so"),
]
for need, tool in ladder:
    print(f"{need:36s} -> {tool}")`,
    v: rowflow("Climbing the ladder.", ["Provider SDK / chain", "create_agent", "LangGraph", "+ vector store, rewrite, rerank", "Evaluate and trace"], [
      "One call or a fixed pipeline.",
      "Standard tool loop with middleware.",
      "Custom flow, persistence, approvals.",
      "Retrieval that earns its complexity.",
      "At every rung: evaluation set, tracing, pinned versions.",
    ]),
  },
];

void [P, bars, cells, compare, curve, hline, par, plot, pt, seg, vline, table, rowflow];
