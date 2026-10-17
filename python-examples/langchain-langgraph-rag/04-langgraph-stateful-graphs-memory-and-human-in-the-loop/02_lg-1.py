# -*- coding: utf-8 -*-
# ==========================================================================
# State and reducers [langchain-langgraph-rag / LangGraph: stateful graphs,
# memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# The state is a shared schema — usually a TypedDict (a dataclass for
# defaults, a Pydantic model for validation). Nodes do not modify it directly:
# they return a partial update, and LangGraph merges it key by key. Without a
# reducer an update replaces the value; with a reducer — a function of
# (current, update) attached with Annotated, such as operator.add — updates
# are combined. add_messages is the reducer for message lists: it appends new
# messages and updates existing ones by id; MessagesState is a prebuilt state
# with a messages key using it. Reducers are what make parallel nodes safe:
# two nodes writing the same key are merged, not overwritten. Design the state
# small and explicit: it is also what gets checkpointed.
#
# WHERE YOU USE IT
# If a key is written by more than one node in the same step it needs a
# reducer; otherwise the result depends on order.
#
# RUN IT:  python 02_lg-1.py
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

g = StateGraph({"log": add_list})
g.add_node("a", lambda s: {"log": "step a", "answer": "first"})
g.add_node("b", lambda s: {"log": "step b", "answer": "second"})
g.add_edge(START, "a").add_edge("a", "b").add_edge("b", END)
print(g.compile().invoke({"log": ["start"]}))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'log': ['start', 'step a', 'step b'], 'answer': 'second'}
