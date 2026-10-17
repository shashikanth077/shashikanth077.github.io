# -*- coding: utf-8 -*-
# ==========================================================================
# What an AI agent is [agentic-ai / What agents are]
# ==========================================================================
# WHAT IT IS
# A chatbot answers; an agent acts. An agent is a program in which a language
# model chooses the next action in a loop — call a tool, read the result,
# decide again — until it judges the goal reached or a limit stops it. The
# three ingredients: a model that decides, tools that act on the world
# (search, code, databases, APIs, files, a browser) and a goal with a stopping
# rule. Because the model, not the programmer, picks the sequence of steps,
# agents can handle open-ended tasks ("find why the build fails and fix it")
# that no fixed script anticipates — and can also go wrong in ways a script
# never would.
#
# WHERE YOU USE IT
# Agents trade predictability for flexibility: use them only where the
# flexibility is worth the extra cost and risk.
#
# RUN IT:  python 01_core-0.py
#

import ast
import operator

OPS = {ast.Add: operator.add, ast.Sub: operator.sub, ast.Mult: operator.mul, ast.Div: operator.truediv}

def safe_eval(expr):
    """Arithmetic only: never pass model-written text to eval()."""
    def walk(node):
        if isinstance(node, ast.Constant) and isinstance(node.value, (int, float)):
            return node.value
        if isinstance(node, ast.BinOp) and type(node.op) in OPS:
            return OPS[type(node.op)](walk(node.left), walk(node.right))
        raise ValueError("not allowed")
    return walk(ast.parse(expr, mode="eval").body)

TOOLS = {
    "calculator": lambda expr: str(safe_eval(expr)),
    "lookup_price": lambda item: {"pen": "2", "notebook": "5"}.get(item, "unknown"),
}

def scripted_model(messages):
    """A stand-in for an LLM: decides the next step from the conversation so far."""
    last = messages[-1]
    if last["role"] == "user":
        return {"tool": "lookup_price", "args": {"item": "pen"}}
    if last["role"] == "tool" and last["name"] == "lookup_price":
        return {"tool": "calculator", "args": {"expr": f"3 * {last['content']}"}}
    if last["role"] == "tool" and last["name"] == "calculator":
        return {"final": f"Three pens cost {last['content']} EUR."}

def run_agent(question, max_steps=5):
    messages = [{"role": "user", "content": question}]
    for step in range(max_steps):
        action = scripted_model(messages)
        if "final" in action:
            return action["final"], step, messages
        result = TOOLS[action["tool"]](**action["args"])
        messages.append({"role": "tool", "name": action["tool"], "content": result})
    return "stopped: step limit", max_steps, messages
answer, steps, messages = run_agent("How much do 3 pens cost?")
print(answer, "| steps:", steps)
for m in messages:
    print(m["role"], "->", m.get("name", ""), m["content"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Three pens cost 6 EUR. | steps: 2
# user ->  How much do 3 pens cost?
# tool -> lookup_price 2
# tool -> calculator 6
