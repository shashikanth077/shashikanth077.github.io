# -*- coding: utf-8 -*-
# ==========================================================================
# Testing graphs with fake models [langchain-langgraph-rag / Testing, tracing
# and operating]
# ==========================================================================
# WHAT IT IS
# Because a graph is made of functions, most of it can be tested without
# calling a model. Replace the chat model with a scripted fake that returns
# fixed AI messages (with or without tool_calls), then assert on the final
# state and on the path taken: given a tool call, does the graph reach
# tool_node and then END? Given a poor retrieval grade, does it retry at most
# twice? Test nodes as plain functions (state in, update out), routing
# functions on handcrafted states, reducers on their own, and interrupts by
# invoking, checking __interrupt__ and resuming. Keep a small set of
# end-to-end evaluations with a real model separately, because mocks cannot
# tell you whether the model behaves well.
#
# WHERE YOU USE IT
# Fast deterministic tests on every commit, real-model evaluations on a
# schedule: they catch different bugs.
#
# RUN IT:  python 01_prod-0.py
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

def should_continue(state):
    return "tool_node" if state["messages"][-1].get("tool_calls") else END

assert should_continue({"messages": [{"tool_calls": [{"id": "1"}]}]}) == "tool_node"
assert should_continue({"messages": [{"tool_calls": []}]}) == END
assert add_list([1], 2) == [1, 2] and add_list(None, [3]) == [3]
print("routing and reducer tests passed")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# routing and reducer tests passed
