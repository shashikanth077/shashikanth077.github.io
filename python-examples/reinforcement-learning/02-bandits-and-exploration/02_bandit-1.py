# -*- coding: utf-8 -*-
# ==========================================================================
# Estimating arm values incrementally [reinforcement-learning / Bandits and
# exploration]
# ==========================================================================
# WHAT IT IS
# The value of an arm is its average reward. Storing every reward is wasteful,
# so update it incrementally: Qₙ₊₁ = Qₙ + (Rₙ − Qₙ)/n — new estimate = old
# estimate + step × error. Rewards 1, 0, 1 give Q = 1, 0.5, 0.667. The general
# pattern NewEstimate = OldEstimate + StepSize × (Target − OldEstimate)
# reappears in TD learning, Q-learning and even gradient descent. The error
# term (Target − OldEstimate) is the surprise.
#
# WHERE YOU USE IT
# With step 1/n all rewards are weighted equally; a fixed step weights recent
# ones more.
#
# RUN IT:  python 02_bandit-1.py
#

Q, n = 0.0, 0
for r in [1, 0, 1]:
    n += 1
    Q += (r - Q) / n
    print(n, r, round(Q, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 1 1.0
# 2 0 0.5
# 3 1 0.667
