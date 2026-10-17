# -*- coding: utf-8 -*-
# ==========================================================================
# Why LangGraph: agents as stateful graphs [langchain-langgraph-rag /
# LangGraph: stateful graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# LangGraph is "a low-level orchestration framework and runtime for building,
# managing, and deploying long-running, stateful agents". You describe the
# program as a graph: a shared state, nodes (functions that read the state and
# return updates) and edges (which node runs next, fixed or chosen at run
# time). Three benefits follow from running it as a graph with saved state:
# durable execution (survive failures and resume where you left off),
# human-in-the-loop (pause, inspect and edit state, then continue) and memory
# (short-term per conversation, long-term across sessions). Install: pip
# install -U langgraph. Use it when a plain loop stops being enough: several
# steps with branching, approvals, retries, parallel work or hours-long tasks.
#
# WHERE YOU USE IT
# A graph makes the control flow explicit: you can draw it, test each node and
# evaluate each path.
#
# RUN IT:  python 01_lg-0.py
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

graph = StateGraph({"messages": add_list})
graph.add_node("mock_llm", lambda state: {"messages": "hello world"})
graph.add_edge(START, "mock_llm")
graph.add_edge("mock_llm", END)
app = graph.compile()
print(app.invoke({"messages": "hi!"}))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'messages': ['hi!', 'hello world']}
