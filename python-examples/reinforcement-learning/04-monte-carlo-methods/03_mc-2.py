# -*- coding: utf-8 -*-
# ==========================================================================
# Monte Carlo control with ε-soft policies [reinforcement-learning / Monte
# Carlo methods]
# ==========================================================================
# WHAT IT IS
# To control (find a good policy) from samples we estimate action values Q(s,
# a): after each episode, update each visited pair towards its observed
# return, Q ← Q + α(G − Q), and act ε-greedily with respect to Q. Because
# every action keeps probability at least ε/|A|, all state–action pairs
# continue to be tried (the "exploring starts" requirement is replaced by a
# soft policy). The loop — play with the current ε-greedy policy, update Q
# from returns — is again generalised policy iteration, now model-free.
#
# WHERE YOU USE IT
# The final policy is ε-greedy, not truly greedy; decay ε or evaluate the
# greedy policy separately.
#
# RUN IT:  python 03_mc-2.py
#

import numpy as np

rng = np.random.default_rng(0)
Q, N = np.zeros((3, 2)), np.zeros((3, 2))
for ep in range(3000):
    s, traj = 0, []
    while s < 2:
        a = int(rng.integers(2)) if rng.random() < 0.2 else int(np.argmax(Q[s]))
        s2 = s + 1 if a == 1 else s
        r = 1.0 if (s2 == 2) else -0.1
        traj.append((s, a, r))
        s = s2 if a == 1 else s
        if len(traj) > 20:
            break
    G = 0.0
    for s_, a_, r_ in reversed(traj):
        G = r_ + 0.9 * G
        N[s_, a_] += 1
        Q[s_, a_] += (G - Q[s_, a_]) / N[s_, a_]
print(Q.round(2).tolist(), Q.argmax(axis=1).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.57, 0.78], [0.78, 1.0], [0.0, 0.0]] [1, 1, 0]
