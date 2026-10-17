# -*- coding: utf-8 -*-
# ==========================================================================
# Workflows versus agents [agentic-ai / What agents are]
# ==========================================================================
# WHAT IT IS
# Not every LLM application needs an agent. In a workflow the code fixes the
# path — "classify, then retrieve, then draft, then check" — and the model
# fills in each step: predictable, cheap, testable. In an agent the model
# decides the path at run time: flexible, but slower, costlier and harder to
# test. Start with the simplest thing that works: a single prompt, then a
# chain of prompts, then routing and parallel calls, and only then an
# autonomous agent for problems whose steps cannot be predicted. Many real
# "agents" are workflows with one or two decision points.
#
# WHERE YOU USE IT
# If you can draw the flowchart in advance, build the flowchart.
#
# RUN IT:  python 02_core-1.py
#

def workflow(ticket):
    category = "billing" if "invoice" in ticket else "other"
    steps = ["classify", "retrieve policy", "draft reply", "check tone"]
    return category, steps

print(workflow("My invoice is wrong"))
paths = {"workflow": 4, "agent (typical)": 7, "agent (worst case)": 25}
print(paths)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ('billing', ['classify', 'retrieve policy', 'draft reply', 'check tone'])
# {'workflow': 4, 'agent (typical)': 7, 'agent (worst case)': 25}
