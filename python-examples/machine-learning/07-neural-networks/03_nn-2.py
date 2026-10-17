# -*- coding: utf-8 -*-
# ==========================================================================
# Softmax: probabilities for several classes [machine-learning / Neural
# networks]
# ==========================================================================
# WHAT IT IS
# For more than two classes the output layer produces one score per class and
# softmax turns them into probabilities that sum to 1: pᵢ = e^zᵢ / Σⱼ e^zⱼ.
# Scores (2, 1, 0.1) give (0.659, 0.242, 0.099). Raising one score raises that
# class's share and lowers the others. The largest score always gets the
# largest probability; softmax just makes the competition explicit. Drag the
# three scores.
#
# WHERE YOU USE IT
# Subtract the maximum score before exponentiating to avoid overflow; the
# probabilities do not change.
#
# RUN IT:  python 03_nn-2.py
#

import numpy as np

z = np.array([2.0, 1.0, 0.1])
p = np.exp(z - z.max()) / np.exp(z - z.max()).sum()
print(p.round(3).tolist(), round(float(p.sum()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.659, 0.242, 0.099] 1.0
