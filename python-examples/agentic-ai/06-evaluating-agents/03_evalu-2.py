# -*- coding: utf-8 -*-
# ==========================================================================
# Evaluating the trajectory, not only the outcome [agentic-ai / Evaluating
# agents]
# ==========================================================================
# WHAT IT IS
# Two runs can both reach the right answer — one in 4 efficient steps, the
# other in 19 after a dangerous detour. Inspect the trajectory: which tools
# were called, with what arguments, in what order; were any forbidden or risky
# actions attempted; were redundant calls made; did the agent recover from
# errors. Useful trajectory metrics: steps and tokens per task, tool-call
# error rate, share of calls that were unnecessary, number of approvals
# requested, and policy violations. Compare to a reference trajectory where
# there is one, or review a sample by hand. Examples of failures to catalogue:
# wrong tool, wrong argument, loop, premature stop, ignoring an observation.
#
# WHERE YOU USE IT
# Read twenty failed traces end to end before changing any prompt: patterns
# appear fast.
#
# RUN IT:  python 03_evalu-2.py
#

runs = {
    "run A": ["search", "read", "answer"],
    "run B": ["search", "search", "search", "delete_file", "read", "answer"],
}
forbidden = {"delete_file"}
for name, calls in runs.items():
    print(name, len(calls), "calls,", "violations:", [c for c in calls if c in forbidden])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# run A 3 calls, violations: []
# run B 6 calls, violations: ['delete_file']
