# -*- coding: utf-8 -*-
# ==========================================================================
# Standardisation: the z-score [machine-learning / Preparing data]
# ==========================================================================
# WHAT IT IS
# z = (x − μ) / σ re-expresses a value as the number of standard deviations
# from the mean. If the training mean is 4 and σ = 2, then x = 6 gives z = 1.
# Standardised data has mean 0 and spread 1, but z is not clipped: values can
# be negative or larger than 1. It is the usual choice for distance- and
# gradient-based models. Drag z along the bell curve.
#
# WHERE YOU USE IT
# Income € 30,000 (mean 20,000, σ 10,000) and orders 6 (mean 4, σ 2) both have
# z = 1: each is one standard deviation above its mean, so they now count
# equally.
#
# RUN IT:  python 04_prep-3.py
#

import numpy as np

print((6 - 4) / 2)
x = np.array([2, 4, 4, 4, 5, 5, 7, 9])
z = (x - x.mean()) / x.std()
print(x.mean(), x.std(), z[-1], round(float(z.mean()), 6))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0
# 5.0 2.0 2.0 0.0
