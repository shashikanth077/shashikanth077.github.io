# -*- coding: utf-8 -*-
# ==========================================================================
# Regret: comparing bandit strategies [reinforcement-learning / Bandits and
# exploration]
# ==========================================================================
# WHAT IT IS
# Cumulative regret after T pulls is T·μ − Σ rewards (in expectation: the sum
# of per-pull gaps). Greedy without exploration can suffer linear regret
# forever if it locks onto a bad arm; ε-greedy with constant ε also grows
# linearly (it keeps exploring); UCB and Thompson sampling achieve logarithmic
# growth — regret rises quickly at first and then flattens. The simulation
# below pits greedy, ε-greedy and UCB against a fixed three-armed problem and
# reports their average regret.
#
# WHERE YOU USE IT
# Always compare exploration strategies over many random seeds; a single run
# proves nothing.
#
# RUN IT:  python 07_bandit-6.py
#

import numpy as np

means = np.array([0.2, 0.5, 0.8])
T, runs = 1000, 200

def run(kind, seed):
    rng = np.random.default_rng(seed)
    Q, N, regret = np.zeros(3), np.zeros(3), 0.0
    for t in range(1, T + 1):
        if kind == "greedy":
            a = int(np.argmax(Q + rng.random(3) * 1e-9))
        elif kind == "eps":
            a = int(rng.integers(3)) if rng.random() < 0.1 else int(np.argmax(Q))
        else:
            a = t - 1 if t <= 3 else int(np.argmax(Q + np.sqrt(2 * np.log(t) / N)))
        r = float(rng.random() < means[a])
        N[a] += 1
        Q[a] += (r - Q[a]) / N[a]
        regret += means.max() - means[a]
    return regret

for kind in ("greedy", "eps", "ucb"):
    print(kind, round(float(np.mean([run(kind, s) for s in range(runs)])), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# greedy 202.7
# eps 49.1
# ucb 38.9
