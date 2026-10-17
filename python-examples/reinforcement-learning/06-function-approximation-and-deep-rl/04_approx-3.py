# -*- coding: utf-8 -*-
# ==========================================================================
# Deep Q-networks: replay and target networks [reinforcement-learning /
# Function approximation and deep RL]
# ==========================================================================
# WHAT IT IS
# DQN approximates Q(s, a) with a neural network trained on the Q-learning
# target y = r + γ maxₐ′ Q_target(s′, a′), minimising (y − Q(s, a))². Two
# ideas make this stable. Experience replay: store transitions in a buffer and
# train on random mini-batches, which breaks the correlation between
# consecutive steps and reuses data. A target network: a slowly updated (or
# periodically copied) frozen copy used to compute y, so the target does not
# move with every gradient step. Example: r = 1, γ = 0.99, target-network
# Q-values (2, 3): y = 1 + 0.99 × 3 = 3.97.
#
# WHERE YOU USE IT
# Typical settings: replay buffer 10⁵–10⁶, batch 32, target copy every
# 1,000–10,000 steps, ε annealed from 1 to 0.1.
#
# RUN IT:  python 04_approx-3.py
#

import numpy as np

r, gamma = 1.0, 0.99
q_target_next = np.array([2.0, 3.0])
y = r + gamma * q_target_next.max()
q_sa = 3.0
print(round(float(y), 2), round(float((y - q_sa) ** 2), 4))
buffer = [(i, i % 2, float(i), i + 1, False) for i in range(100)]
rng = np.random.default_rng(0)
batch = [buffer[i] for i in rng.choice(len(buffer), size=4, replace=False)]
print([b[0] for b in batch])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.97 0.9409
# [26, 50, 82, 62]
