# -*- coding: utf-8 -*-
# ==========================================================================
# A gridworld: random policy, step cost −1 [reinforcement-learning / Markov
# decision processes and dynamic programming]
# ==========================================================================
# WHAT IT IS
# The classic test bed: a 4 × 4 grid with two terminal corners. Every move
# costs −1 reward, γ = 1, so a state's value is minus the expected number of
# steps until the game ends. Moving into a wall leaves you where you are. The
# random policy picks each of the four moves with probability ¼. What is
# V(r0,c1), next to a terminal corner? One step from the goal if you move
# there (¼ chance), otherwise you wander — the exact answer is −14 steps on
# average. Policy evaluation computes all sixteen numbers.
#
# WHERE YOU USE IT
# Gridworlds are tiny but contain every ingredient: states, actions, rewards,
# terminal states, a policy and a value function.
#
# RUN IT:  python 02_mdp-1.py
#

import numpy as np

n = 4
terminal = {(0, 0), (3, 3)}
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def move(i, j, a):
    ni, nj = i + moves[a][0], j + moves[a][1]
    return (ni, nj) if 0 <= ni < n and 0 <= nj < n else (i, j)
rng = np.random.default_rng(0)
lengths = []
for _ in range(3000):
    s, steps = (0, 1), 0
    while s not in terminal:
        s = move(s[0], s[1], int(rng.integers(4)))
        steps += 1
    lengths.append(steps)
print(round(float(np.mean(lengths)), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 14.0
