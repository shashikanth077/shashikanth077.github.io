# -*- coding: utf-8 -*-
# ==========================================================================
# Random variables and expected value [maths-ai / Probability and information]
# ==========================================================================
# WHAT IT IS
# A random variable takes different values with different probabilities. Its
# expected value is the probability-weighted average: E[X] = Σ x · P(x) — the
# long-run mean. The probabilities must add to 1. Expectation is linear: E[aX
# + b] = aE[X] + b.
#
# WHERE YOU USE IT
# A model's loss is an expectation over data; "expected reward" drives
# reinforcement learning.
#
# RUN IT:  python 04_prob-3.py
#

values = [0, 1, 2, 3]
probs = [0.5, 0.3, 0.15, 0.05]
expected = sum(v * p for v, p in zip(values, probs))
print(round(expected, 2), round(sum(probs), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.75 1.0
