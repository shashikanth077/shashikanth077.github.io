# -*- coding: utf-8 -*-
# ==========================================================================
# Policy iteration [reinforcement-learning / Markov decision processes and
# dynamic programming]
# ==========================================================================
# WHAT IT IS
# Policy iteration alternates two steps until nothing changes: evaluate the
# current policy (compute V_π), then improve it (act greedily). Each loop
# gives a strictly better policy until the optimal one is reached; because a
# finite MDP has finitely many policies, it terminates, usually in only a
# handful of iterations. Cost: every evaluation is itself a series of sweeps
# over all states, so the method is heavy per iteration but needs few of them.
#
# WHERE YOU USE IT
# Generalised policy iteration — evaluation and improvement interleaved,
# however roughly — is the template for nearly all RL algorithms.
#
# RUN IT:  python 05_mdp-4.py
#

import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def move(i, j, a):
    ni, nj = i + moves[a][0], j + moves[a][1]
    return (ni, nj) if 0 <= ni < n and 0 <= nj < n else (i, j)
policy = np.full((n, n, 4), 0.25)
for rnd in range(6):
    V = np.zeros((n, n))
    for _ in range(500):
        W = V.copy()
        for i in range(n):
            for j in range(n):
                if (i, j) not in terminal:
                    W[i, j] = sum(policy[i, j, a] * (-1 + V[move(i, j, a)]) for a in range(4))
        V = W
    new = np.zeros_like(policy)
    for i in range(n):
        for j in range(n):
            q = np.array([-1 + V[move(i, j, a)] for a in range(4)])
            best = np.isclose(q, q.max())
            new[i, j] = best / best.sum()
    changed = not np.allclose(new, policy)
    policy = new
    print(rnd, round(float(V[0, 1]), 2), changed)
    if not changed:
        break

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0 -14.0 True
# 1 -1.0 True
# 2 -1.0 False
