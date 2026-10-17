# -*- coding: utf-8 -*-
# ==========================================================================
# Scaling features: min–max and standardisation [numpy / NumPy in real AI
# work]
# ==========================================================================
# WHAT IT IS
# Features on different scales (hours 2–8, attendance 60–95) confuse many
# models. Min–max scaling maps each column to 0–1: (X − min) / (max − min).
# Standardisation gives each column mean 0 and standard deviation 1: (X −
# mean) / std. Both use axis=0 so each COLUMN is scaled separately, and
# broadcasting does the rest.
#
# WHERE YOU USE IT
# Fit the scaling numbers (min/max or mean/std) on the training set only, then
# apply them to validation and test data — otherwise you leak information.
#
# RUN IT:  python 03_ai-2.py
#

import numpy as np

X = np.array([[2., 60.], [4., 80.], [6., 100.]])
mins, maxs = X.min(axis=0), X.max(axis=0)
scaled = (X - mins) / (maxs - mins)
print(scaled)
z = (X - X.mean(axis=0)) / X.std(axis=0)
print(np.round(z, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.  0. ]
#  [0.5 0.5]
#  [1.  1. ]]
# [[-1.225 -1.225]
#  [ 0.     0.   ]
#  [ 1.225  1.225]]
