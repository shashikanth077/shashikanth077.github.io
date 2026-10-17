# -*- coding: utf-8 -*-
# ==========================================================================
# A minimal agent from scratch [agentic-ai / Building and shipping agents]
# ==========================================================================
# WHAT IT IS
# Frameworks are optional: the core of an agent is about thirty lines. A
# while-loop sends the messages and the tool list to the model; if the reply
# contains tool calls, execute each (with validation), append the results and
# continue; if it contains a final answer, return it; stop at the step limit.
# Building it once by hand teaches what every framework hides — message
# format, validation, error handling, limits, logging — and often a
# hand-written loop is all a product needs. Add features only when a real
# failure demands them: persistence, parallel calls, streaming, approvals.
#
# WHERE YOU USE IT
# Understand the raw loop before adopting a framework; you will debug through
# it eventually.
#
# RUN IT:  python 01_build-0.py
#

TOOLS = {"add": lambda a, b: a + b}

def fake_model(history):
    last = history[-1]
    if last["role"] == "user":
        return {"tool": "add", "args": {"a": 2, "b": 3}}
    return {"final": f"The sum is {last['content']}."}

def agent(question, max_steps=5):
    history = [{"role": "user", "content": question}]
    for _ in range(max_steps):
        reply = fake_model(history)
        if "final" in reply:
            return reply["final"]
        result = TOOLS[reply["tool"]](**reply["args"])
        history.append({"role": "tool", "content": result})
    return "step limit reached"

print(agent("What is 2 + 3?"))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# The sum is 5.
