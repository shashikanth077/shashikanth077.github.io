# -*- coding: utf-8 -*-
# ==========================================================================
# Over-estimation and Double DQN [reinforcement-learning / Function
# approximation and deep RL]
# ==========================================================================
# WHAT IT IS
# Taking a max over noisy estimates is biased upwards: even if every true
# value is 0, the maximum of ten noisy estimates is positive — about 1.54 on
# average for standard-normal noise. Q-learning bootstraps from exactly such
# maxima, so values drift too high and can destabilise learning. Double
# Q-learning / Double DQN decouples selection from evaluation: pick the best
# action with the online network, evaluate it with the target network, y = r +
# γ Q_target(s′, argmaxₐ Q_online(s′, a)). Together with the deadly triad
# (function approximation + bootstrapping + off-policy data), this explains
# many instabilities in deep RL.
#
# WHERE YOU USE IT
# Double DQN costs almost nothing and is part of most modern value-based
# agents.
#
# RUN IT:  python 05_approx-4.py
#

import numpy as np

rng = np.random.default_rng(0)
single = np.mean([rng.normal(0, 1, 10).max() for _ in range(10000)])
a, b = rng.normal(0, 1, (10000, 10)), rng.normal(0, 1, (10000, 10))
double = np.mean(b[np.arange(10000), a.argmax(axis=1)])
print(round(float(single), 2), round(float(double), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.54 0.01
