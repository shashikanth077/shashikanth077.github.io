# -*- coding: utf-8 -*-
# ==========================================================================
# The k-armed bandit [reinforcement-learning / Bandits and exploration]
# ==========================================================================
# WHAT IT IS
# The simplest RL problem has no states: a slot machine with k levers (arms),
# each paying a random reward with its own unknown mean. You pull one arm per
# round and want the largest total reward. It isolates the
# exploration–exploitation dilemma. The quality of a strategy is measured by
# regret: the reward you lost compared with always pulling the best arm. If
# the means are 0.2, 0.5, 0.8 and you pull the middle arm, you lose 0.3 per
# pull on average.
#
# WHERE YOU USE IT
# Real versions: ad or headline selection, recommendations, clinical-trial
# dose finding, routing in networks.
#
# RUN IT:  python 01_bandit-0.py
#

import numpy as np

means = np.array([0.2, 0.5, 0.8])
print(round(float(means.max() - means[1]), 2), round(float(means.max() - means[0]), 2))
rng = np.random.default_rng(0)
print(rng.binomial(1, means, size=(5, 3)).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.3 0.6
# [[0, 0, 1], [0, 1, 0], [0, 1, 1], [1, 1, 1], [1, 0, 1]]
