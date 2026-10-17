# -*- coding: utf-8 -*-
# ==========================================================================
# Model-based RL and Dyna [reinforcement-learning / Models, rewards,
# multi-agent and RLHF]
# ==========================================================================
# WHAT IT IS
# A model predicts the next state and reward. With one, the agent can plan:
# simulate experience internally instead of acting. Dyna-Q interleaves three
# things at every real step: (1) direct RL update from the real transition,
# (2) learn the model (store what happened), (3) n planning updates on
# transitions replayed from the model. With n = 10 planning steps, each real
# step triggers ten extra Q-updates, so values propagate far faster — at the
# cost of memory and of trusting a possibly wrong model. AlphaZero and MuZero
# are model-based systems combining search with learned networks.
#
# WHERE YOU USE IT
# Model-based methods are much more sample-efficient but suffer when the model
# is inaccurate; real experience stays the ground truth.
#
# RUN IT:  python 01_adv-0.py
#

import numpy as np

rng = np.random.default_rng(0)
Q = np.zeros((6, 2))
model = {}
def update(s, a, r, s2, alpha=0.5, gamma=0.9):
    Q[s, a] += alpha * (r + gamma * Q[s2].max() - Q[s, a])

updates = 0
for step in range(30):
    s, a = int(rng.integers(5)), int(rng.integers(2))
    s2 = s + 1 if a == 1 else max(s - 1, 0)
    r = 1.0 if s2 == 5 else 0.0
    update(s, a, r, s2)
    model[(s, a)] = (r, s2)
    updates += 1
    for _ in range(10):
        (ps, pa), (pr, ps2) = list(model.items())[int(rng.integers(len(model)))]
        update(ps, pa, pr, ps2)
        updates += 1
print(updates, Q.round(2).tolist()[3:5])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 330 [[0.73, 0.9], [0.81, 1.0]]
