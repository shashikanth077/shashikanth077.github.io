# -*- coding: utf-8 -*-
# ==========================================================================
# Searching over attempts: best-of-n and voting [agentic-ai / Planning,
# reasoning and search]
# ==========================================================================
# WHAT IT IS
# When a single attempt succeeds with probability p and you can verify
# results, sample several: the chance that at least one of n independent
# attempts is correct is 1 − (1 − p)ⁿ — for p = 0.4 and n = 5, 0.92. When you
# cannot verify, take a majority vote over answers (self-consistency): with
# five independent attempts each right with probability 0.7, the majority (at
# least 3 right) is correct with probability 0.837. Both cost n× the tokens
# and assume attempts are independent and errors differ; if the model makes
# the same mistake every time, more samples do not help. Tree-of-thought style
# search extends the idea: expand several partial solutions and keep the most
# promising.
#
# WHERE YOU USE IT
# Spend extra compute where verification is cheap: tests, calculators, schema
# checks.
#
# RUN IT:  python 05_plan-4.py
#

from math import comb

print(round(1 - 0.6 ** 5, 3))
vote = sum(comb(5, k) * 0.7 ** k * 0.3 ** (5 - k) for k in range(3, 6))
print(round(vote, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.922
# 0.837
