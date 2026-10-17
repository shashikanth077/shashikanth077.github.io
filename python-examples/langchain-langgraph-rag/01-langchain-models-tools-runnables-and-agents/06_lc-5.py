# -*- coding: utf-8 -*-
# ==========================================================================
# create_agent: the loop in one call [langchain-langgraph-rag / LangChain:
# models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# create_agent wraps the loop you built by hand in the agentic track: call the
# model with the messages and tools; if it returns tool_calls, run them and
# append ToolMessages; repeat until the model answers without tool calls. You
# supply the model, the tools, the system prompt and optional middleware —
# hooks that run around model calls and tool calls to add behaviour such as
# summarising long histories, requiring human approval for sensitive tools,
# redacting data or limiting calls. The result of invoke is a dict whose
# messages list holds the whole trajectory; the last message is the answer.
# Because it runs on LangGraph, the agent can be given a checkpointer to
# remember a conversation per thread and can be interrupted for approval.
#
# WHERE YOU USE IT
# Start with create_agent; drop to a hand-built LangGraph when you need
# control over the exact steps.
#
# RUN IT:  python 06_lc-5.py
#

def create_agent(model, tools, max_steps=5):
    registry = {t.__name__: t for t in tools}
    def invoke(inputs):
        messages = list(inputs["messages"])
        for _ in range(max_steps):
            ai = model(messages)
            messages.append(ai)
            if not ai.get("tool_calls"):
                break
            for call in ai["tool_calls"]:
                messages.append({"role": "tool", "tool_call_id": call["id"], "content": str(registry[call["name"]](**call["args"]))})
        return {"messages": messages}
    return type("Agent", (), {"invoke": staticmethod(invoke)})

def add(a: int, b: int) -> int:
    """Add two integers."""
    return a + b

def scripted_model(messages):
    if messages[-1]["role"] == "user":
        return {"role": "ai", "tool_calls": [{"id": "c1", "name": "add", "args": {"a": 20, "b": 22}}]}
    return {"role": "ai", "content": "The answer is " + messages[-1]["content"], "tool_calls": []}

agent = create_agent(scripted_model, [add])
result = agent.invoke({"messages": [{"role": "user", "content": "20 + 22?"}]})
print([m["role"] for m in result["messages"]], result["messages"][-1]["content"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['user', 'ai', 'tool', 'ai'] The answer is 42
