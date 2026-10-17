# -*- coding: utf-8 -*-
# ==========================================================================
# Reliability: pass^k, not just pass@k [agentic-ai / Evaluating agents]
# ==========================================================================
# WHAT IT IS
# Users need the agent to succeed every time, not once in several tries. If a
# task succeeds with probability p per run, the chance of succeeding on all k
# runs is pass^k = pᵏ: p = 0.8 gives 0.328 over five runs and 0.168 over
# eight; p = 0.9 gives 0.430 over eight. Compare pass@k (at least one success
# in k tries) = 1 − (1 − p)ᵏ, which looks flattering. For a customer-facing
# agent report pass^k for the k that matches real use (the same task repeated
# over days, a thousand customers). Closing the gap needs lower variance:
# validation, constrained tools, retries, checkpoints, and human review of the
# uncertain cases.
#
# WHERE YOU USE IT
# Run each evaluation task several times: a task that passes 3 of 5 runs is
# not "solved".
#
# RUN IT:  python 02_evalu-1.py
#

p = 0.8
print(round(p ** 5, 3), round(p ** 8, 3), round(1 - (1 - p) ** 5, 4))
print(round(0.9 ** 8, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.328 0.168 0.9997
# 0.43
