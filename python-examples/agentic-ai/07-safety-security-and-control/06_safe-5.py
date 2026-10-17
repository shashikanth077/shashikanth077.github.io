# -*- coding: utf-8 -*-
# ==========================================================================
# Circuit breakers, rate limits and budgets [agentic-ai / Safety, security and
# control]
# ==========================================================================
# WHAT IT IS
# Automatic brakes stop small faults becoming big ones. Rate limits cap tool
# calls per minute; budgets cap tokens, money and wall-clock time per task and
# per day; a circuit breaker trips when a tool fails repeatedly (say 5
# failures in 60 seconds), pausing calls for a cool-down instead of hammering
# a broken service; loop detection halts repeated identical calls. Example: a
# budget of 50,000 tokens and a step limit of 20 mean a runaway loop costs at
# most a bounded amount — at 3 per million input tokens, the worst case of
# 50,000 tokens is 0.15. Alert a person when limits trip so they can find out
# why.
#
# WHERE YOU USE IT
# A hard daily spending cap on every API key is the cheapest insurance you can
# buy.
#
# RUN IT:  python 06_safe-5.py
#

failures = [1, 1, 1, 1, 1]
threshold = 5
state = "open (paused)" if sum(failures) >= threshold else "closed (calls allowed)"
print(state)
print(50000 / 1e6 * 3, "maximum input cost under a 50k token budget at 3 per million")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# open (paused)
# 0.15000000000000002 maximum input cost under a 50k token budget at 3 per million
