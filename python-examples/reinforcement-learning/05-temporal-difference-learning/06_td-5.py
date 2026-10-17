# -*- coding: utf-8 -*-
# ==========================================================================
# Cliff walking: the difference you can see [reinforcement-learning /
# Temporal-difference learning]
# ==========================================================================
# WHAT IT IS
# A 4 × 12 grid: start bottom-left, goal bottom-right, the bottom row between
# them is a cliff (−100 and back to the start); every other step costs −1. Run
# both algorithms with ε = 0.1. Q-learning learns the values of the shortest
# path hugging the cliff edge (13 steps), but because it explores while
# acting, it occasionally steps off — its online return is poor, about −55.
# SARSA learns the values of the ε-greedy policy it follows, so it prefers a
# longer, safer route along the top (17 steps) with a better online return of
# about −22. Neither is "wrong": they optimise different things.
#
# WHERE YOU USE IT
# If you will deploy the greedy policy, Q-learning's path is better; if you
# care about reward during learning, SARSA's is.
#
# RUN IT:  python 06_td-5.py
#

import numpy as np

H, W = 4, 12
moves = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def step(s, a):
    i, j = s
    i = min(max(i + moves[a][0], 0), H - 1)
    j = min(max(j + moves[a][1], 0), W - 1)
    if i == 3 and 0 < j < 11:
        return (3, 0), -100, False
    if (i, j) == (3, 11):
        return (i, j), -1, True
    return (i, j), -1, False

def train(kind, eps=0.1, alpha=0.1, episodes=2000, seed=0):
    rng = np.random.default_rng(seed)
    Q = np.zeros((H, W, 4))
    pick = lambda s: int(rng.integers(4)) if rng.random() < eps else int(np.argmax(Q[s]))
    totals = []
    for _ in range(episodes):
        s = (3, 0)
        a = pick(s)
        total = 0
        for _ in range(1000):
            s2, r, done = step(s, a)
            total += r
            a2 = pick(s2)
            target = r + (0 if done else (Q[s2][a2] if kind == "sarsa" else Q[s2].max()))
            Q[s + (a,)] += alpha * (target - Q[s + (a,)])
            s, a = s2, a2
            if done:
                break
        totals.append(total)
    s, path = (3, 0), [(3, 0)]
    for _ in range(60):
        s, _, done = step(s, int(np.argmax(Q[s])))
        path.append(s)
        if done:
            break
    return float(np.mean(totals[-200:])), path
for kind in ("q", "sarsa"):
    online, path = train(kind)
    print(kind, round(online, 1), len(path) - 1, "steps; highest row", min(p[0] for p in path))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# q -54.6 13 steps; highest row 2
# sarsa -21.7 17 steps; highest row 0
