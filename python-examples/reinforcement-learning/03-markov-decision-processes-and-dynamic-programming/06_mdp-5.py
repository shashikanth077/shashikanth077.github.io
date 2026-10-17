# -*- coding: utf-8 -*-
# ==========================================================================
# Value iteration and the Bellman optimality equation [reinforcement-learning
# / Markov decision processes and dynamic programming]
# ==========================================================================
# WHAT IT IS
# Value iteration merges evaluation and improvement into one update using the
# Bellman optimality equation: V(s) = maxₐ Σ P(s′ | s, a)[ r + γV(s′) ] —
# replace the average over the policy's actions by a max. Repeating it from V
# = 0 converges to V. On the gridworld the answer is simply minus the
# Manhattan distance to the nearest corner (−1, −2, −3 …), reached after only
# a few sweeps; the optimal policy is then read off greedily. Q-learning is
# the sampled, model-free version of this same update.
#
# WHERE YOU USE IT
# Value iteration is the right tool when the model is known and the state
# space small; its cost per sweep is |S|²|A|.
#
# RUN IT:  python 06_mdp-5.py
#

import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def move(i, j, a):
    ni, nj = i + moves[a][0], j + moves[a][1]
    return (ni, nj) if 0 <= ni < n and 0 <= nj < n else (i, j)
V = np.zeros((n, n))
for sweep in range(1, 8):
    W = V.copy()
    for i in range(n):
        for j in range(n):
            if (i, j) not in terminal:
                W[i, j] = max(-1 + V[move(i, j, a)] for a in range(4))
    V = W
    if sweep in (1, 2, 3, 6):
        print(sweep, V.astype(int).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 [[0, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, -1], [-1, -1, -1, 0]]
# 2 [[0, -1, -2, -2], [-1, -2, -2, -2], [-2, -2, -2, -1], [-2, -2, -1, 0]]
# 3 [[0, -1, -2, -3], [-1, -2, -3, -2], [-2, -3, -2, -1], [-3, -2, -1, 0]]
# 6 [[0, -1, -2, -3], [-1, -2, -3, -2], [-2, -3, -2, -1], [-3, -2, -1, 0]]
