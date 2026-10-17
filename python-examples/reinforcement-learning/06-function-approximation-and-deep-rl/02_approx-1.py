# -*- coding: utf-8 -*-
# ==========================================================================
# Linear value approximation and semi-gradient TD [reinforcement-learning /
# Function approximation and deep RL]
# ==========================================================================
# WHAT IT IS
# Describe each state by a feature vector x(s) and set V̂(s) = w·x(s). The
# weights are adjusted by gradient steps on the prediction error, treating the
# target as a constant (semi-gradient): w ← w + α δ x(s) with the TD error δ =
# r + γ V̂(s′) − V̂(s). Example: w = (0.5, 0.5), x(s) = (1, 0), x(s′) = (0,
# 1), r = 1, γ = 0.9, α = 0.1: V̂(s) = 0.5, V̂(s′) = 0.5, δ = 1 + 0.45 − 0.5 =
# 0.95, so w becomes (0.595, 0.5). With one-hot features this is exactly the
# tabular update.
#
# WHERE YOU USE IT
# Linear TD has convergence guarantees on-policy; with non-linear networks you
# get power but fewer guarantees.
#
# RUN IT:  python 02_approx-1.py
#

import numpy as np

w = np.array([0.5, 0.5])
x, x_next = np.array([1.0, 0.0]), np.array([0.0, 1.0])
r, gamma, alpha = 1.0, 0.9, 0.1
delta = r + gamma * (w @ x_next) - w @ x
w = w + alpha * delta * x
print(round(float(delta), 3), w.round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.95 [0.595, 0.5]
