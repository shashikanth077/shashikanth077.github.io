# -*- coding: utf-8 -*-
# ==========================================================================
# Upper confidence bound (UCB) [reinforcement-learning / Bandits and
# exploration]
# ==========================================================================
# WHAT IT IS
# UCB explores where the estimate is uncertain: choose argmax Qₐ + c√(ln t /
# Nₐ). The bonus is large for rarely tried arms and shrinks as Nₐ grows. At t
# = 12 with Q = (0.5, 0.4), counts N = (10, 2) and c = 2: arm 1 scores 0.5 +
# 2√(2.485/10) = 1.497; arm 2 scores 0.4 + 2√(2.485/2) = 2.629. UCB picks the
# less-tried arm although its average is lower. Unlike ε-greedy, exploration
# is directed at uncertainty and fades by itself.
#
# WHERE YOU USE IT
# UCB is optimistic in the face of uncertainty; the same idea powers tree
# search (UCT) and many exploration bonuses in deep RL.
#
# RUN IT:  python 05_bandit-4.py
#

import numpy as np

Q, N, t, c = np.array([0.5, 0.4]), np.array([10, 2]), 12, 2.0
score = Q + c * np.sqrt(np.log(t) / N)
print(score.round(3).tolist(), int(np.argmax(score)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.497, 2.629] 1
