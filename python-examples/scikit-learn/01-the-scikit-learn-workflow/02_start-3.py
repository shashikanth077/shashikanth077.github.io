# -*- coding: utf-8 -*-
# ==========================================================================
# X and y: shapes that scikit-learn expects [scikit-learn / The scikit-learn
# workflow]
# ==========================================================================
# WHAT IT IS
# X (the features) must be 2D: one row per example, one column per feature,
# shape (n_samples, n_features). y (the answers) is 1D with one value per row,
# shape (n_samples,). A single feature must still be a column: use
# X.reshape(-1, 1) or df[["age"]] with double brackets. A 1D X raises
# "Expected 2D array, got 1D array".
#
# WHERE YOU USE IT
# Shape errors are the most common first-day error. Print X.shape and y.shape
# before every fit.
#
# RUN IT:  python 02_start-3.py
#

import numpy as np
from sklearn.linear_model import LinearRegression

X = np.array([[1, 5], [2, 6], [3, 7]])
y = np.array([10, 20, 30])
print(X.shape, y.shape)
try:
    LinearRegression().fit(np.array([1, 2, 3]), y)
except ValueError:
    print("X must be 2D")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3, 2) (3,)
# X must be 2D
