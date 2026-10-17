# -*- coding: utf-8 -*-
# ==========================================================================
# Off-policy learning and importance sampling [reinforcement-learning / Monte
# Carlo methods]
# ==========================================================================
# WHAT IT IS
# On-policy methods learn about the policy that generates the data; off-policy
# methods learn about a target policy π while following a different behaviour
# policy b — for example learning the greedy policy while exploring. Returns
# from b must be reweighted by the importance-sampling ratio ρ = Π π(aₜ | sₜ)
# / b(aₜ | sₜ). If the target always takes action a (π = 1) but the behaviour
# takes it with probability 0.5, an episode containing it is weighted ρ = 2;
# two such steps give 4. Weights can become huge, making estimates
# high-variance, so practical methods clip or avoid them (Q-learning does).
#
# WHERE YOU USE IT
# Off-policy learning lets an agent reuse old data and learn from other agents
# or humans.
#
# RUN IT:  python 04_mc-3.py
#

import numpy as np

pi = np.array([1.0, 1.0, 1.0])
b = np.array([0.5, 0.5, 0.5])
rho = np.cumprod(pi / b)
print(rho.tolist())
returns = np.array([10.0, 0.0, 0.0, 0.0])
weights = np.array([8.0, 1.0, 1.0, 1.0])
print(round(float(np.average(returns, weights=weights)), 3), round(float(returns.mean()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2.0, 4.0, 8.0]
# 7.273 2.5
