# -*- coding: utf-8 -*-
# ==========================================================================
# Middleware: behaviour around the agent loop [langchain-langgraph-rag /
# LangChain: models, tools, runnables and agents]
# ==========================================================================
# WHAT IT IS
# Middleware lets you change what happens before or after a model call or a
# tool call without rewriting the loop. Typical uses: summarise history when
# it exceeds a token budget, require approval before tools with side effects,
# redact sensitive data in prompts and outputs, limit the number of model or
# tool calls, retry flaky calls, and switch models dynamically (a cheap model
# for easy steps). Order matters: each layer wraps the next, so put guards
# (limits, redaction) outside and optimisations inside. Because middleware is
# code, test it like code: given this history, does it trim to the budget?
# Given this tool call, does it stop for approval?
#
# WHERE YOU USE IT
# Put the safety-critical checks in middleware or in the tools themselves, not
# only in the prompt.
#
# RUN IT:  python 07_lc-6.py
#

def call_limit(max_calls):
    state = {"n": 0}
    def wrap(call):
        def inner(x):
            state["n"] += 1
            if state["n"] > max_calls:
                return "stopped: call limit reached"
            return call(x)
        return inner
    return wrap

def redact(call):
    return lambda text: call(text.replace("4111 1111 1111 1111", "<card>"))

model_call = lambda text: "model saw: " + text
guarded = call_limit(2)(redact(model_call))
print([guarded("pay with 4111 1111 1111 1111") for _ in range(3)])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['model saw: pay with <card>', 'model saw: pay with <card>', 'stopped: call limit reached']
