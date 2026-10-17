# -*- coding: utf-8 -*-
# ==========================================================================
# Baselines: subtract the average [reinforcement-learning / Policy gradients
# and actor–critic]
# ==========================================================================
# WHAT IT IS
# If every return is positive, REINFORCE raises the probability of every
# action it sees, only by different amounts — a lot of noise. Subtracting a
# baseline b(s) from the return, giving (G − b), leaves the expected gradient
# unchanged (the baseline does not depend on the action) but can cut the
# variance dramatically. A natural baseline is the state value V(s), so the
# weight becomes the advantage A = G − V(s): "how much better than usual was
# this?" Returns 10, 12, 11 with baseline 11 become advantages −1, +1, 0 — now
# only the genuinely better actions are reinforced.
#
# WHERE YOU USE IT
# A learned value function as baseline leads directly to actor–critic methods.
#
# RUN IT:  python 03_policy-2.py
#

import numpy as np

G = np.array([10.0, 12.0, 11.0])
b = 11.0
print((G - b).tolist(), round(float(G.std()), 3), round(float((G - b).std()), 3))
rng = np.random.default_rng(0)
pi0 = 0.5
def grad_estimates(b, n=100000):
    a = rng.random(n) < 0.5
    G = np.where(a, rng.normal(12, 1, n), rng.normal(10, 1, n))
    return (G - b) * np.where(a, 1 - pi0, -pi0)
print(round(float(np.var(grad_estimates(0.0))), 2), round(float(np.var(grad_estimates(11.0))), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-1.0, 1.0, 0.0] 0.816 0.816
# 30.49 0.25
