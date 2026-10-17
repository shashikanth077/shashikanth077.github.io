# -*- coding: utf-8 -*-
# ==========================================================================
# Workflow patterns as graphs [langchain-langgraph-rag / LangGraph: stateful
# graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# LangGraph's documentation shows the standard patterns, each a small graph.
# Prompt chaining: each model call processes the previous output (draft →
# check → polish). Parallelization: independent calls at once, or the same
# call several times for confidence. Routing: classify the input, then send it
# to a specialised flow (pricing, refunds, support). Orchestrator–worker:
# plan, delegate with Send, synthesise. Evaluator–optimizer: generate,
# evaluate, and loop until the criteria are met, with an optional human in the
# loop. And finally the agent, where the model chooses the steps in a tool
# loop. Pick the least autonomous pattern that solves the problem: chaining
# and routing are cheap and testable, agents are flexible and costly.
#
# WHERE YOU USE IT
# Most production systems are workflows with one agent-like step, not
# free-roaming agents.
#
# RUN IT:  python 11_lg-10.py
#

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

def classify(s):
    return {"route": "refund" if "refund" in s["text"] else "support"}
def route(s):
    return s["route"]
g = StateGraph()
g.add_node("classify", classify).add_node("refund", lambda s: {"answer": "refund flow"}).add_node("support", lambda s: {"answer": "support flow"})
g.add_edge(START, "classify").add_conditional_edges("classify", route).add_edge("refund", END).add_edge("support", END)
app = g.compile()
print(app.invoke({"text": "I want a refund"})["answer"], "|", app.invoke({"text": "my app crashes"})["answer"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# refund flow | support flow
