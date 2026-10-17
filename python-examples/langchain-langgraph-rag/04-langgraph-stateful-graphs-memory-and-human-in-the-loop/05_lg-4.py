# -*- coding: utf-8 -*-
# ==========================================================================
# The tool-calling agent as a graph [langchain-langgraph-rag / LangGraph:
# stateful graphs, memory and human-in-the-loop]
# ==========================================================================
# WHAT IT IS
# LangGraph's documentation builds an agent in three pieces. llm_call (a
# node): call the model with the messages — a model with tools attached via
# bind_tools — and return its AI message. tool_node (a node): for each tool
# call in the last message run the tool and return ToolMessages.
# should_continue (a conditional edge from llm_call): if the last message has
# tool_calls go to tool_node, otherwise END. Plus one normal edge tool_node →
# llm_call closes the loop. The same loop as create_agent, but now every step
# is yours to change: add a node that checks the output, a second tool node
# for risky tools with an approval interrupt, or a route to a cheaper model
# for simple steps.
#
# WHERE YOU USE IT
# Start with create_agent; build the graph yourself when you need to insert
# steps into the loop.
#
# RUN IT:  python 05_lg-4.py
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
print([m["role"] for m in final["messages"]], final["messages"][-1]["content"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['user', 'ai', 'tool', 'ai'] The answer is 5.
