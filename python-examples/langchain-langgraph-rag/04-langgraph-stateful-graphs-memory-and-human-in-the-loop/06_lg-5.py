# -*- coding: utf-8 -*-
# ==========================================================================
# Parallelism, recursion limits and runaway loops [langchain-langgraph-rag /
# LangGraph: stateful graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# Nodes that share a super-step run in parallel, which is the cheapest way to
# cut latency for independent work (three searches at once). Loops are limited
# by the recursion_limit: a top-level config key (not inside configurable)
# capping the number of super-steps; exceeding it raises GraphRecursionError.
# The documentation states the default is 1000 starting with version 1.0.6 — a
# runaway agent can burn many model calls before it trips, so set a limit that
# matches the task (for example 25) and also bound the loop in your own
# routing function (a step counter in the state). Inside a node,
# RemainingSteps lets you route gracefully — wrap up and answer — before the
# limit is hit rather than failing. Always combine step limits with token and
# time budgets.
#
# WHERE YOU USE IT
# A limit that stops the run with an error is a safety net; a graceful "I ran
# out of steps, here is what I have" is the product.
#
# RUN IT:  python 06_lg-5.py
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
print(g2.compile().invoke({}, recursion_limit=5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# stopped: GraphRecursionError
# {'n': 4}
