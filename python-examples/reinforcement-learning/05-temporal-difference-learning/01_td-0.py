# -*- coding: utf-8 -*-
# ==========================================================================
# TD(0): learn a guess from a guess [reinforcement-learning /
# Temporal-difference learning]
# ==========================================================================
# WHAT IT IS
# Temporal-difference learning combines the best of both worlds: like Monte
# Carlo it learns from experience without a model; like DP it bootstraps — it
# updates after every single step using the current estimate of the next
# state. The update is V(s) ← V(s) + α [ r + γV(s′) − V(s) ]; the bracket is
# the TD error δ, the difference between what you predicted and the
# better-informed one-step target. Example: V(s) = 0.5, reward 0, V(s′) = 0.7,
# α = 0.1, γ = 1: δ = 0 + 0.7 − 0.5 = 0.2 and V(s) becomes 0.52.
#
# WHERE YOU USE IT
# TD works in continuing tasks and learns online, which is why it is the
# workhorse of RL.
#
# RUN IT:  python 01_td-0.py
#

V_s, V_next, r, alpha, gamma = 0.5, 0.7, 0.0, 0.1, 1.0
delta = r + gamma * V_next - V_s
print(round(delta, 3), round(V_s + alpha * delta, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.2 0.52
