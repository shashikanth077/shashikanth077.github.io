# -*- coding: utf-8 -*-
# ==========================================================================
# Mean, median, standard deviation and ddof [numpy / Maths, broadcasting and
# axes]
# ==========================================================================
# WHAT IT IS
# mean is the average, np.median the middle value (robust to outliers), and
# std the spread. NumPy's std divides by n (population) by default; pass
# ddof=1 for the sample standard deviation, which divides by n − 1. For small
# datasets the two differ noticeably.
#
# WHERE YOU USE IT
# Standardising features uses mean and std; reporting a sample statistic with
# the population formula quietly understates uncertainty.
#
# RUN IT:  python 07_math-6.py
#

import numpy as np

data = np.array([2, 4, 4, 4, 5, 5, 7, 9])
print(data.mean())
print(np.median(data))
print(data.std())
print(round(data.std(ddof=1), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0
# 4.5
# 2.0
# 2.138
