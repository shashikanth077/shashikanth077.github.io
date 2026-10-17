# -*- coding: utf-8 -*-
# ==========================================================================
# Iterative policy evaluation [reinforcement-learning / Markov decision
# processes and dynamic programming]
# ==========================================================================
# WHAT IT IS
# To find V_π for a known model, start from V = 0 and repeatedly apply the
# Bellman equation to every state (sweeps). On the gridworld the first sweep
# gives −1 everywhere (one step costs 1); the second −1.75, −2 …; the third
# −2.44, −2.94, −3 …; after about a thousand sweeps the numbers stop changing:
# V(r0,c1) = −14, V(r1,c1) = −18, V(r0,c3) = −22. Convergence is guaranteed
# because each sweep shrinks the error — and you can stop as soon as the
# largest change falls below a small θ.
#
# WHERE YOU USE IT
# In-place updates (using fresh values immediately) usually converge faster
# than keeping two copies of V.
#
# RUN IT:  python 03_mdp-2.py
#

import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def move(i, j, a):
    ni, nj = i + moves[a][0], j + moves[a][1]
    return (ni, nj) if 0 <= ni < n and 0 <= nj < n else (i, j)
V = np.zeros((n, n))
for sweep in range(1000):
    W = V.copy()
    for i in range(n):
        for j in range(n):
            if (i, j) in terminal:
                continue
            W[i, j] = sum(0.25 * (-1 + V[move(i, j, a)]) for a in range(4))
    delta = float(np.abs(W - V).max())
    V = W
    if sweep < 3:
        print(sweep + 1, V[0].round(2).tolist())
print(V.round(1).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 [0.0, -1.0, -1.0, -1.0]
# 2 [0.0, -1.75, -2.0, -2.0]
# 3 [0.0, -2.44, -2.94, -3.0]
# [[0.0, -14.0, -20.0, -22.0], [-14.0, -18.0, -20.0, -20.0], [-20.0, -20.0, -18.0, -14.0], [-22.0, -20.0, -14.0, 0.0]]
