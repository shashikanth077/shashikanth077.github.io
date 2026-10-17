# -*- coding: utf-8 -*-
# ==========================================================================
# Stopping rules and budgets [agentic-ai / Planning, reasoning and search]
# ==========================================================================
# WHAT IT IS
# A loop needs a way to end. Combine four rules: a success check (the goal
# test passes), a step limit (say 20), a budget (tokens, money, wall-clock
# time) and stuck detection (the same action with the same arguments three
# times, or no progress for k steps). When a limit trips, stop gracefully:
# report what was done, what remains and why it stopped, rather than failing
# silently or looping on. Cost control and safety are the same mechanism: an
# agent without limits can burn money overnight. Log the reason for every stop
# to see which limits actually fire.
#
# WHERE YOU USE IT
# Set limits from measured behaviour: the 95th percentile of successful runs
# plus a margin.
#
# RUN IT:  python 06_plan-5.py
#

history = ["search(a)", "read(b)", "search(a)", "search(a)", "search(a)"]
def stuck(h, k=3):
    return len(h) >= k and len(set(h[-k:])) == 1

max_steps, budget_tokens, used = 20, 50000, 51200
print(stuck(history), len(history) >= max_steps, used > budget_tokens)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True False True
