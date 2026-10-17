# -*- coding: utf-8 -*-
# ==========================================================================
# The random walk: TD learns the values [reinforcement-learning /
# Temporal-difference learning]
# ==========================================================================
# WHAT IT IS
# Five states A–E in a row, start in the middle C, step left or right with
# equal probability; stepping off the right end pays 1, off the left end 0.
# The true value of each state is the probability of ending on the right: 1/6,
# 2/6, 3/6, 4/6, 5/6. TD(0) starts from V = 0.5 everywhere and, after a couple
# of thousand episodes with a small α, gets close: about 0.18, 0.35, 0.50,
# 0.67, 0.86. The estimates keep jittering slightly because α is constant.
#
# WHERE YOU USE IT
# With a decaying step size the estimates converge exactly; with a constant
# one they track a moving average.
#
# RUN IT:  python 02_td-1.py
#

import numpy as np

rng = np.random.default_rng(0)
V = np.full(5, 0.5)
for episode in range(2000):
    s = 2
    while True:
        s2 = s + int(rng.choice([-1, 1]))
        done = s2 < 0 or s2 > 4
        r = 1.0 if s2 > 4 else 0.0
        target = r + (0.0 if done else V[s2])
        V[s] += 0.02 * (target - V[s])
        if done:
            break
        s = s2
print(V.round(2).tolist(), (np.arange(1, 6) / 6).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.18, 0.35, 0.5, 0.67, 0.86] [0.17, 0.33, 0.5, 0.67, 0.83]
