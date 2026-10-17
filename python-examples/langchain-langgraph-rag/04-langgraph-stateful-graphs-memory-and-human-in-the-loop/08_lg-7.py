# -*- coding: utf-8 -*-
# ==========================================================================
# Checkpointers and threads: persistence [langchain-langgraph-rag / LangGraph:
# stateful graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# Compile a graph with a checkpointer and LangGraph saves the state after
# every super-step as a checkpoint, keyed by a thread_id you pass in
# config={"configurable": {"thread_id": "…". That gives conversation
# continuity (a second invoke on the same thread continues from the saved
# state), human-in-the-loop, time travel (replay or fork from an earlier
# checkpoint) and fault tolerance (resume after a crash). Implementations:
# InMemorySaver (RAM, lost on restart), SqliteSaver (local file, development)
# and PostgresSaver / AsyncPostgresSaver (production). Different thread ids
# are independent conversations. Checkpoints accumulate: plan pruning or
# retention, keep thread ids under 255 characters for PostgresSaver, and
# remember that checkpoints store your state — treat them as data with privacy
# obligations.
#
# WHERE YOU USE IT
# Use a durable checkpointer in production; an in-memory one loses every
# conversation on restart.
#
# RUN IT:  python 08_lg-7.py
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

cp = InMemorySaver()
g = StateGraph({"messages": add_list})
g.add_node("reply", lambda s: {"messages": f"I have seen {len(s['messages'])} message(s)"})
g.add_edge(START, "reply").add_edge("reply", END)
app = g.compile(checkpointer=cp)
t1, t2 = {"configurable": {"thread_id": "thread-1"}}, {"configurable": {"thread_id": "thread-2"}}
print(app.invoke({"messages": "Hi, my name is Bob."}, t1)["messages"])
print(app.invoke({"messages": "What is my name?"}, t1)["messages"])
print(app.invoke({"messages": "Hello"}, t2)["messages"])
print(len(cp.history["thread-1"]), "checkpoints saved for thread-1")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Hi, my name is Bob.', 'I have seen 1 message(s)']
# ['Hi, my name is Bob.', 'I have seen 1 message(s)', 'What is my name?', 'I have seen 3 message(s)']
# ['Hello', 'I have seen 1 message(s)']
# 2 checkpoints saved for thread-1
