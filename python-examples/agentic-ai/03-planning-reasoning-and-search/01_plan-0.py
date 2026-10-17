# -*- coding: utf-8 -*-
# ==========================================================================
# ReAct: reason, act, observe [agentic-ai / Planning, reasoning and search]
# ==========================================================================
# WHAT IT IS
# ReAct interleaves three things in a loop: a short thought (what do I know,
# what do I need), an action (call a tool) and the observation (its result).
# The thoughts keep the model on track and make its trajectory readable; the
# observations ground it in facts instead of guesses. Example: "Who directed
# the film that won Best Picture in 1994?" → Thought: I need the winner;
# Action: search("Best Picture 1994"); Observation: Forrest Gump; Thought: now
# the director; Action: search("Forrest Gump director"); Observation: Robert
# Zemeckis; Answer. Two tool calls, each informed by the previous result —
# impossible for a single prompt without lookup.
#
# WHERE YOU USE IT
# Log thoughts, actions and observations as a trace: it is both your debugger
# and your audit trail.
#
# RUN IT:  python 01_plan-0.py
#

facts = {"Best Picture 1994": "Forrest Gump", "Forrest Gump director": "Robert Zemeckis"}
trace = []
query = "Best Picture 1994"
for step in range(2):
    obs = facts[query]
    trace.append((f"Thought {step + 1}", f"search({query!r})", obs))
    query = f"{obs} director"
for t in trace:
    print(*t, sep=" | ")
print("Answer:", trace[-1][2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Thought 1 | search('Best Picture 1994') | Forrest Gump
# Thought 2 | search('Forrest Gump director') | Robert Zemeckis
# Answer: Robert Zemeckis
