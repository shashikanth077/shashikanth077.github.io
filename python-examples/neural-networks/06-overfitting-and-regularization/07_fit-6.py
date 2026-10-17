# -*- coding: utf-8 -*-
# ==========================================================================
# Reading training curves like an engineer [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# Learning curves tell you what to change next. Healthy: both losses fall and
# stay close. Overfitting: training keeps falling, validation turns up →
# regularize, add data, stop earlier. Underfitting: both stay high → bigger
# model, better features, train longer. Learning rate too high: the loss
# oscillates or explodes → lower η, scale inputs, clip gradients. A learning
# curve plots loss against epoch; a loss landscape plots loss against weights
# — different things. Validation need not sit above training (dropout and
# augmentation can reverse it), so read trends, not one rule.
#
# WHERE YOU USE IT
# Accuracy alone can mislead on imbalanced data — also read the confusion
# matrix, precision, recall and F1.
#
# RUN IT:  python 07_fit-6.py
#

import numpy as np

def diagnose(train, val):
    if not np.all(np.isfinite(val)) or val[-1] > 5 * val[0]:
        return "unstable: lower the learning rate"
    if val[-1] > min(val) + 0.1 and val[-1] - train[-1] > 0.3:
        return "overfitting"
    if train[-1] > 0.5:
        return "underfitting"
    return "healthy"

e = np.arange(1, 31)
print(diagnose(1 / e, 1 / e + 0.02))
print(diagnose(1 / e, 1 / e + 0.01 * np.maximum(0, e - 10) ** 1.3 + 0.05))
print(diagnose(0.8 + 0 * e, 0.82 + 0 * e))
print(diagnose(1.5 ** e, 1.5 ** e))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# healthy
# overfitting
# underfitting
# unstable: lower the learning rate
