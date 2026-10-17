# -*- coding: utf-8 -*-
# ==========================================================================
# Policy improvement: act greedily on the values [reinforcement-learning /
# Markov decision processes and dynamic programming]
# ==========================================================================
# WHAT IT IS
# Given V_π, improve the policy by choosing in each state the action with the
# best one-step lookahead: π′(s) = argmaxₐ Σ P(s′ | s, a)[ r + γV_π(s′) ]. The
# policy improvement theorem guarantees π′ is at least as good as π
# everywhere. On the gridworld with the converged random-policy values, the
# greedy policy already heads for the nearest terminal corner from every state
# — even though the values themselves belong to a random walker. One
# improvement step produced an optimal policy here.
#
# WHERE YOU USE IT
# Improvement needs a model (or Q-values): you must be able to compare the
# actions' outcomes.
#
# RUN IT:  python 04_mdp-3.py
#

import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def move(i, j, a):
    ni, nj = i + moves[a][0], j + moves[a][1]
    return (ni, nj) if 0 <= ni < n and 0 <= nj < n else (i, j)
V = np.array([[0, -14, -20, -22], [-14, -18, -20, -20], [-20, -20, -18, -14], [-22, -20, -14, 0]], float)
names = ["up", "down", "left", "right"]
for state in [(0, 1), (1, 2), (3, 1)]:
    q = [-1 + V[move(state[0], state[1], a)] for a in range(4)]
    best = [names[a] for a in range(4) if q[a] == max(q)]
    print(state, [float(x) for x in q], best)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (0, 1) [-15.0, -19.0, -1.0, -21.0] ['left']
# (1, 2) [-21.0, -19.0, -19.0, -21.0] ['down', 'left']
# (3, 1) [-21.0, -21.0, -23.0, -15.0] ['right']
