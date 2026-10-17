# -*- coding: utf-8 -*-
# ==========================================================================
# Continuous actions: Gaussian policies [reinforcement-learning / Policy
# gradients and actor–critic]
# ==========================================================================
# WHAT IT IS
# For a torque, a steering angle or a price there are infinitely many actions,
# so a table over actions is impossible. A Gaussian policy outputs a mean μ(s)
# and a standard deviation σ(s), samples a ~ N(μ, σ²), and has log-probability
# log π(a) = −½((a − μ)/σ)² − log(σ√(2π)). With μ = 0, σ = 1, a = 1: log π =
# −0.5 − 0.919 = −1.419. A policy-gradient step shifts μ towards high-return
# actions and shrinks σ as the agent becomes confident. Algorithms such as
# DDPG/TD3 use deterministic actor networks, SAC keeps a stochastic one with
# an entropy bonus.
#
# WHERE YOU USE IT
# Squash actions with tanh and rescale to the allowed range; clip carefully.
#
# RUN IT:  python 07_policy-6.py
#

import numpy as np

mu, sigma, a = 0.0, 1.0, 1.0
logp = -0.5 * ((a - mu) / sigma) ** 2 - np.log(sigma * np.sqrt(2 * np.pi))
print(round(float(logp), 3))
rng = np.random.default_rng(0)
print(rng.normal(mu, sigma, 5).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -1.419
# [0.13, -0.13, 0.64, 0.1, -0.54]
