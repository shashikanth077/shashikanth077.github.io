# -*- coding: utf-8 -*-
# ==========================================================================
# Monte Carlo versus dynamic programming [reinforcement-learning / Monte Carlo
# methods]
# ==========================================================================
# WHAT IT IS
# DP needs the full model and bootstraps: it updates a state's value from the
# values of successor states. Monte Carlo needs no model, does not bootstrap,
# and can focus on the states that actually occur — useful when the state
# space is huge but only a small part is visited. Because each state's
# estimate is independent of the others, errors do not propagate. The
# trade-off is variance: a return depends on many random steps, so many
# episodes are needed, and nothing is learned until an episode finishes.
#
# WHERE YOU USE IT
# Think of DP as planning with the rules in hand, Monte Carlo as learning from
# playing whole games.
#
# RUN IT:  python 02_mc-1.py
#

import numpy as np

rng = np.random.default_rng(0)
true_value = 0.5
for episodes in (10, 100, 10000):
    estimates = [rng.binomial(1, true_value, episodes).mean() for _ in range(200)]
    print(episodes, round(float(np.std(estimates)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10 0.151
# 100 0.053
# 10000 0.005
