# -*- coding: utf-8 -*-
# ==========================================================================
# Plan first, then execute [agentic-ai / Planning, reasoning and search]
# ==========================================================================
# WHAT IT IS
# For longer tasks, let the model write a plan before acting: a numbered list
# of steps, each with an expected result. Execute step by step (each step may
# itself be a small ReAct loop) and re-plan when an observation contradicts
# the plan. Benefits over pure reaction: fewer wandering steps, a plan a
# person can approve, a progress measure (3 of 7 done) and cheaper execution
# because small models can carry out well-specified steps. Risks: a bad plan
# followed blindly; so check progress after every step and allow revision.
# Keep plans short (3–10 steps) and concrete.
#
# WHERE YOU USE IT
# Showing the plan to the user before execution catches misunderstandings
# cheaply.
#
# RUN IT:  python 02_plan-1.py
#

plan = ["find the failing test", "read the test", "locate the bug", "fix it", "run tests"]
done = 0
for step in plan:
    ok = step != "locate the bug"
    if ok:
        done += 1
        print("done:", step)
    else:
        print("observation contradicts plan at:", step, "-> re-plan")
        break
print(done, "of", len(plan))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# done: find the failing test
# done: read the test
# observation contradicts plan at: locate the bug -> re-plan
# 2 of 5
