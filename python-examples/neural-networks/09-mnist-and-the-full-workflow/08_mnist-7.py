# -*- coding: utf-8 -*-
# ==========================================================================
# One complete evaluation story [neural-networks / MNIST and the full
# workflow]
# ==========================================================================
# WHAT IT IS
# Putting it together: split 60,000 development images into 48,000 train and
# 12,000 validation (stratified, so each digit keeps its share); train with
# Adam at 0.001, batch 32, up to six epochs with early stopping on validation
# loss; freeze the choices; evaluate once on the 10,000 test images; then read
# overall accuracy, the 10 × 10 confusion matrix, per-digit
# precision/recall/F1 and macro F1. Never quote a number you did not measure,
# and never tune on the test set. Report which split each number came from.
#
# WHERE YOU USE IT
# The workflow code in the lecture needs TensorFlow; the NumPy tracks above
# reproduce every idea at small scale.
#
# RUN IT:  python 08_mnist-7.py
#

import numpy as np

rng = np.random.default_rng(0)
y = rng.integers(0, 10, 60000)
idx = rng.permutation(60000)
val_idx, train_idx = idx[:12000], idx[12000:]
share = lambda a: np.bincount(a, minlength=10) / len(a)
print(len(train_idx), len(val_idx))
print(abs(share(y[train_idx]) - share(y[val_idx])).max() < 0.01)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 48000 12000
# True
