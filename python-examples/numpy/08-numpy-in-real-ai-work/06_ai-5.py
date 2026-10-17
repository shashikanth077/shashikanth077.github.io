# -*- coding: utf-8 -*-
# ==========================================================================
# Shuffling and splitting a dataset [numpy / NumPy in real AI work]
# ==========================================================================
# WHAT IT IS
# Shuffle by permuting ROW INDICES, then cut: idx = rng.permutation(len(X)),
# X[idx]. Use the SAME indices for the labels so each row keeps its label.
# Take the first 80% as training data and the rest as test data. Seeding the
# generator makes the split repeatable.
#
# WHERE YOU USE IT
# Every train/test split, and the shuffling between epochs, is an index
# permutation — if rows and labels get out of step the model learns nonsense.
#
# RUN IT:  python 06_ai-5.py
#

import numpy as np

rng = np.random.default_rng(0)
X = np.arange(10).reshape(5, 2)
y = np.array([0, 1, 0, 1, 1])
idx = rng.permutation(len(X))
split = int(0.8 * len(X))
train_idx, test_idx = idx[:split], idx[split:]
X_train, X_test = X[train_idx], X[test_idx]
y_train, y_test = y[train_idx], y[test_idx]
print(X_train.shape, X_test.shape)
print(sorted(idx.tolist()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (4, 2) (1, 2)
# [0, 1, 2, 3, 4]
