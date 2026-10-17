# -*- coding: utf-8 -*-
# ==========================================================================
# Scaling with training statistics only [pandas / Pandas for machine learning]
# ==========================================================================
# WHAT IT IS
# Standardising means (x − mean) / std. Compute the mean and standard
# deviation on the training rows only, then apply those same numbers to the
# test rows — otherwise information from the test set leaks into training. A
# trap: pandas std() divides by n − 1 (ddof=1) while NumPy's np.std divides by
# n, so the two disagree on small samples.
#
# WHERE YOU USE IT
# Scaling fitted on all data gives optimistic test scores. Fit on train,
# transform both.
#
# RUN IT:  python 03_ml-2.py
#

import pandas as pd

train = pd.DataFrame({"x": [10, 20, 30, 40]})
test = pd.DataFrame({"x": [25, 50]})
mean = train["x"].mean()
std = train["x"].std(ddof=0)
print(mean, round(std, 2))
print(((train["x"] - mean) / std).round(2).tolist())
print(((test["x"] - mean) / std).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 25.0 11.18
# [-1.34, -0.45, 0.45, 1.34]
# [0.0, 2.24]
