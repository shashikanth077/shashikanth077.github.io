# -*- coding: utf-8 -*-
# ==========================================================================
# Policy-based methods: learn the policy directly [reinforcement-learning /
# Policy gradients and actor–critic]
# ==========================================================================
# WHAT IT IS
# Instead of learning values and acting greedily, parametrise the policy π(a |
# s; θ) and adjust θ to increase expected return. Advantages: it handles
# continuous actions (output a mean and a spread), represents stochastic
# policies (essential in games with hidden information), and changes action
# probabilities smoothly rather than flipping when one Q-value overtakes
# another. For discrete actions a softmax over scores gives the probabilities:
# logits (1, 0) → π = (0.731, 0.269).
#
# WHERE YOU USE IT
# Policy methods usually have high variance and are less sample-efficient than
# value methods; baselines and critics fix much of that.
#
# RUN IT:  python 01_policy-0.py
#

import numpy as np

theta = np.array([1.0, 0.0])
pi = np.exp(theta - theta.max())
pi /= pi.sum()
print(pi.round(3).tolist())
rng = np.random.default_rng(0)
print(np.bincount(rng.choice(2, size=1000, p=pi), minlength=2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.731, 0.269]
# [716, 284]
