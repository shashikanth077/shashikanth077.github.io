# -*- coding: utf-8 -*-
# ==========================================================================
# Reflection: critique and revise [agentic-ai / Planning, reasoning and
# search]
# ==========================================================================
# WHAT IT IS
# A first draft is rarely the best one. In a reflection loop the agent
# produces an answer, a critic (the same model with a different prompt, or a
# second model, or code such as tests) evaluates it against explicit criteria,
# and the agent revises — repeating until the criteria are met or a round
# limit is reached. It works best when the critique is grounded: unit tests
# that pass or fail, a schema validator, a fact check against sources.
# Self-critique without external signal can reinforce mistakes or declare
# success too early. Typical gains come in the first one to three rounds; more
# rounds cost tokens for little improvement.
#
# WHERE YOU USE IT
# Prefer objective checks (tests, validators, calculators) over "does this
# look right?" whenever you have them.
#
# RUN IT:  python 04_plan-3.py
#

def draft(n):
    return ["return a - b", "return a + b"][min(n, 1)]

def tests_pass(code):
    scope = {}
    exec("def add(a, b):\n    " + code, scope)
    return scope["add"](2, 3) == 5

for round_ in range(3):
    code = draft(round_)
    ok = tests_pass(code)
    print(round_, code, ok)
    if ok:
        break

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 return a - b False
# 1 return a + b True
