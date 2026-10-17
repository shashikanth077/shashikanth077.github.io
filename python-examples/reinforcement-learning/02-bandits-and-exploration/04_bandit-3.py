# -*- coding: utf-8 -*-
# ==========================================================================
# ε-greedy action selection [reinforcement-learning / Bandits and exploration]
# ==========================================================================
# WHAT IT IS
# With probability 1 − ε take the greedy action (largest Q), with probability
# ε take a uniformly random action. With k arms the greedy arm is therefore
# chosen with probability 1 − ε + ε/k: for ε = 0.1 and k = 5 that is 0.92, and
# every other arm gets 0.02. ε = 0 never explores; ε = 1 is pure random. A
# common schedule starts with ε near 1 and decays it as estimates improve. It
# is simple and robust, but wastes exploration on obviously bad arms.
#
# WHERE YOU USE IT
# A small constant ε (0.05–0.1) is a reasonable default in a changing world.
#
# RUN IT:  python 04_bandit-3.py
#

eps, k = 0.1, 5
print(round(1 - eps + eps / k, 3), round(eps / k, 3))
import numpy as np
rng = np.random.default_rng(0)
Q = np.array([0.1, 0.9, 0.3, 0.2, 0.0])
picks = [int(np.argmax(Q)) if rng.random() > eps else int(rng.integers(k)) for _ in range(10000)]
print(round(float(np.mean(np.array(picks) == 1)), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.92 0.02
# 0.92
