# -*- coding: utf-8 -*-
# ==========================================================================
# Correlation is not causation [machine-learning / Statistics you need]
# ==========================================================================
# WHAT IT IS
# Pearson r = covariance(X, Y) / (sₓ · s_y) measures how closely two numbers
# move along a straight line: +1 rise together, −1 one rises while the other
# falls, near 0 no linear link. It says nothing about cause. More support
# agents and more tickets are correlated, but busy days cause both. Drag the
# slope: with the same scatter of noise, a steeper line means a higher |r|.
#
# WHERE YOU USE IT
# A strong r invites a causal story. Ask what third factor could drive both
# before you act on it.
#
# RUN IT:  python 07_stats-8.py
#

import numpy as np

x = np.array([1, 2, 3, 4, 5])
y = np.array([2, 4, 5, 4, 5])
print(round(float(np.corrcoef(x, y)[0, 1]), 3))
agents = np.array([3, 5, 8, 10])
tickets = np.array([30, 52, 75, 100])
print(round(float(np.corrcoef(agents, tickets)[0, 1]), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.775
# 0.996
