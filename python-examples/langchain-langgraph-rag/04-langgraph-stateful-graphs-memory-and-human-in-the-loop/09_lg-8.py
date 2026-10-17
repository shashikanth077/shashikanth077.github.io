# -*- coding: utf-8 -*-
# ==========================================================================
# Interrupts: human-in-the-loop [langchain-langgraph-rag / LangGraph: stateful
# graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# Inside a node, interrupt(value) pauses the graph: the state is saved by the
# checkpointer and the value (any JSON-serialisable payload, for example
# "Approve this refund of 120?") is returned to the caller under
# __interrupt__. The graph waits — for seconds or days. To continue, invoke
# again with Command(resume=answer) on the same thread_id; the resume value
# becomes the return value of the interrupt() call. A checkpointer and a
# thread id are required. One rule matters: on resume the runtime restarts the
# whole node from its beginning, so any code before interrupt() runs again —
# keep side effects there idempotent or move them after the interrupt, and
# never wrap interrupt() in a bare try/except, which would swallow the pause.
# Typical uses: approve a tool call, edit a draft, supply missing information.
#
# WHERE YOU USE IT
# Put the approval before the side effect, and show the reviewer the exact
# action — not only the model's description of it.
#
# RUN IT:  python 09_lg-8.py
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
print(final["result"], "| node ran", len(effects), "times (restarts from its start on resume)")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Approve refund of 120?
# refund paid | node ran 2 times (restarts from its start on resume)
