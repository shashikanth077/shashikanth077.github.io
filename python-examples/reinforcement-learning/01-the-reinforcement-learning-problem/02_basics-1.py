# -*- coding: utf-8 -*-
# ==========================================================================
# Reward and return: what the agent maximises [reinforcement-learning / The
# reinforcement learning problem]
# ==========================================================================
# WHAT IT IS
# The agent does not maximise the next reward but the return: the discounted
# sum of future rewards, Gₜ = Rₜ₊₁ + γRₜ₊₂ + γ²Rₜ₊₃ + … with a discount 0 ≤ γ
# ≤ 1. A reward stream 1, 0, 0, 10 with γ = 0.9 has return 1 + 0 + 0 + 0.9³ ×
# 10 = 8.29 from the start, 8.10 from the second step, 9.0 from the third and
# 10 from the last. γ near 0 makes the agent short-sighted; γ near 1 makes it
# patient. Returns satisfy Gₜ = Rₜ₊₁ + γGₜ₊₁, the recursion behind almost
# every algorithm.
#
# WHERE YOU USE IT
# Design rewards carefully: the agent will optimise exactly what you reward,
# including loopholes.
#
# RUN IT:  python 02_basics-1.py
#

rewards = [1, 0, 0, 10]
gamma = 0.9
G = 0.0
returns = []
for r in reversed(rewards):
    G = r + gamma * G
    returns.append(round(G, 2))
print(returns[::-1])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [8.29, 8.1, 9.0, 10.0]
