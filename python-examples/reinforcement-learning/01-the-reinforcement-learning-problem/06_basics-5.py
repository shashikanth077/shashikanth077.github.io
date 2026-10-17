# -*- coding: utf-8 -*-
# ==========================================================================
# Exploration versus exploitation [reinforcement-learning / The reinforcement
# learning problem]
# ==========================================================================
# WHAT IT IS
# To get reward the agent should exploit what it already knows; to learn more
# it must explore actions it is unsure about. Picking your favourite
# restaurant every night is safe but you may miss a better one; trying a new
# one every night wastes dinners. The tension has no free lunch: pure
# exploitation can lock into a poor choice early, pure exploration never
# cashes in. Standard remedies are ε-greedy (random action with probability
# ε), optimism about untried actions, uncertainty bonuses (UCB) and sampling
# from posteriors (Thompson sampling).
#
# WHERE YOU USE IT
# Decay exploration over time, but never to exactly zero when the world can
# change.
#
# RUN IT:  python 06_basics-5.py
#

import numpy as np

true_means = np.array([0.3, 0.7])
Q, N = np.zeros(2), np.zeros(2)
rng = np.random.default_rng(1)
for t in range(200):
    a = int(np.argmax(Q))
    r = float(rng.random() < true_means[a])
    N[a] += 1
    Q[a] += (r - Q[a]) / N[a]
print(N.tolist(), Q.round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [200.0, 0.0] [0.29, 0.0]
