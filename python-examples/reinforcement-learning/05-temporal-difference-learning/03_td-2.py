# -*- coding: utf-8 -*-
# ==========================================================================
# TD versus Monte Carlo: bias and variance [reinforcement-learning /
# Temporal-difference learning]
# ==========================================================================
# WHAT IT IS
# Monte Carlo's target (the full return Gₜ) is an unbiased but high-variance
# estimate of V — it sums many random steps. TD's target (r + γV(s′)) depends
# on only one random step, so it has low variance, but it is biased while
# V(s′) is still wrong. In practice TD usually learns faster and is the better
# default, especially in long episodes; Monte Carlo can win when the state is
# poorly observed. n-step TD and TD(λ) blend the two, as the next concepts
# show.
#
# WHERE YOU USE IT
# A useful picture: Monte Carlo waits for the end of the game before learning;
# TD updates after every move.
#
# RUN IT:  python 03_td-2.py
#

import numpy as np

rng = np.random.default_rng(0)
returns = rng.normal(0.5, 1.0, 1000)
td_targets = 0.5 + rng.normal(0, 0.1, 1000) + 0.05
print(round(float(returns.std()), 2), round(float(td_targets.std()), 2), round(float(td_targets.mean() - 0.5), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.98 0.1 0.05
