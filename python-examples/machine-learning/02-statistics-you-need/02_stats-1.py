# -*- coding: utf-8 -*-
# ==========================================================================
# Spread: range, variance and standard deviation [machine-learning /
# Statistics you need]
# ==========================================================================
# WHAT IT IS
# The spread tells you how far values stray from the centre. The range (max −
# min) is easy but controlled by extremes. Variance averages the squared
# distances from the mean; the standard deviation is its square root, in the
# original unit. For 2, 3, 3, 4 the mean is 3, the squared deviations are 1,
# 0, 0, 1, the population variance is 0.5 and the standard deviation is about
# 0.707. Dividing by n − 1 instead of n gives the sample versions.
#
# WHERE YOU USE IT
# NumPy and pandas differ: np.std divides by n; pandas std() divides by n − 1.
# Use ddof to match them.
#
# RUN IT:  python 02_stats-1.py
#

import numpy as np

x = np.array([2, 3, 3, 4])
print(x.mean(), x.var(), round(float(x.std()), 3))
print(round(float(x.var(ddof=1)), 3), round(float(x.std(ddof=1)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.0 0.5 0.707
# 0.667 0.816
