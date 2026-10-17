# -*- coding: utf-8 -*-
# ==========================================================================
# Monte Carlo prediction: learn from complete episodes [reinforcement-learning
# / Monte Carlo methods]
# ==========================================================================
# WHAT IT IS
# If the model is unknown, learn from experience. Monte Carlo methods run
# complete episodes and estimate V(s) as the average of the returns observed
# after visiting s. No model, no bootstrapping — just averaging. Two episodes
# visit state A: the return afterwards was 8.29 in one and 8.10 in the other,
# so V(A) ≈ 8.195. The first-visit variant averages the return after the first
# visit in each episode; every-visit uses all visits. Updates happen only when
# an episode ends, so it needs episodic tasks.
#
# WHERE YOU USE IT
# Estimates are unbiased but noisy, because a whole random trajectory
# contributes to every return.
#
# RUN IT:  python 01_mc-0.py
#

import numpy as np

returns = {"A": [8.29, 8.10]}
print({s: round(float(np.mean(v)), 3) for s, v in returns.items()})
episode = [("A", 1.0), ("B", 0.0), ("A", 0.0), ("T", 10.0)]
gamma = 0.9
G, first = 0.0, {}
for t in range(len(episode) - 1, -1, -1):
    s, r = episode[t]
    G = r + gamma * G
    first[s] = round(G, 3)
print(first)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'A': 8.195}
# {'T': 10.0, 'A': 8.29, 'B': 8.1}
