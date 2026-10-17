# -*- coding: utf-8 -*-
# ==========================================================================
# Optimism and Thompson sampling [reinforcement-learning / Bandits and
# exploration]
# ==========================================================================
# WHAT IT IS
# Two more ways to explore. Optimistic initial values: start every Q above any
# realistic reward (say 5); every pull disappoints, so the agent keeps trying
# other arms until estimates settle. Thompson sampling keeps a posterior for
# each arm — for yes/no rewards a Beta(1 + successes, 1 + failures) — samples
# one value from each and plays the arm with the largest sample. After 3
# successes and 1 failure the posterior mean is 4/6 = 0.667; uncertain arms
# have wide posteriors and win the sampling often, certain good arms win
# mostly. Thompson sampling is simple and performs very well in practice.
#
# WHERE YOU USE IT
# Both methods explore by uncertainty, not by blind randomness.
#
# RUN IT:  python 06_bandit-5.py
#

import numpy as np

rng = np.random.default_rng(0)
succ, fail = np.array([3, 30]), np.array([1, 10])
print(((1 + succ) / (2 + succ + fail)).round(3).tolist())
wins = np.zeros(2)
for _ in range(2000):
    samples = rng.beta(1 + succ, 1 + fail)
    wins[int(np.argmax(samples))] += 1
print((wins / 2000).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.667, 0.738]
# [0.39, 0.61]
