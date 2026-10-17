# -*- coding: utf-8 -*-
# ==========================================================================
# The cost of looping: tokens grow every step [agentic-ai / What agents are]
# ==========================================================================
# WHAT IT IS
# Each loop iteration sends the whole history again, so the input grows by the
# size of the previous action and observation. With a 1,000-token system
# prompt and 500 new tokens per step, step t reads 1,000 + 500·t tokens and
# the total input over n steps is n·1,000 + 500·n(n−1)/2: 10,000 for n = 5,
# 32,500 for n = 10 and 115,000 for n = 20 — quadratic growth. Costs are a mix
# of quadratic input and linear output, plus latency per step. Keep
# observations short (summarise or truncate tool output), cache the stable
# prefix, drop stale history and cap the number of steps.
#
# WHERE YOU USE IT
# Budget tokens and steps per task and abort cleanly when the budget is spent.
#
# RUN IT:  python 06_core-5.py
#

s, d = 1000, 500
def total(n):
    return sum(s + d * t for t in range(n))

print([total(n) for n in (5, 10, 20)])
print(total(10) / 10, "average input tokens per step at n = 10")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10000, 32500, 115000]
# 3250.0 average input tokens per step at n = 10
