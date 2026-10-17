# -*- coding: utf-8 -*-
# ==========================================================================
# Scaling a feature and checking it with a histogram [matplotlib / Charts for
# machine learning]
# ==========================================================================
# WHAT IT IS
# Standardising subtracts the mean and divides by the standard deviation, so
# the feature has mean 0 and spread 1. Histograms before and after show that
# the shape is unchanged — only the scale moves. Plot both with subplots(1, 2,
# sharey=True) to prove it.
#
# WHERE YOU USE IT
# Plotting the transformed feature is the quickest sanity check that your
# preprocessing did what you meant.
#
# RUN IT:  python 02_ml-3.py
#

import numpy as np
import matplotlib.pyplot as plt

rng = np.random.default_rng(0)
x = rng.normal(70, 10, 200)
z = (x - x.mean()) / x.std()

fig, axes = plt.subplots(1, 2, figsize=(9, 3.5))
axes[0].hist(x, bins=15)
axes[0].set_title("Raw")
axes[1].hist(z, bins=15)
axes[1].set_title("Standardised")
plt.show()
print(round(x.mean(), 1), round(x.std(), 1))
print(round(z.mean(), 2), round(z.std(), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 70.2 9.6
# 0.0 1.0
