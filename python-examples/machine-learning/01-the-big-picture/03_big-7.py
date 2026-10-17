# -*- coding: utf-8 -*-
# ==========================================================================
# Always compare with a baseline [machine-learning / The big picture]
# ==========================================================================
# WHAT IT IS
# A score means nothing without something to compare it to. The simplest
# baseline predicts the most common class every time. If 95 of 100 emails are
# Normal, "always Normal" is 95% accurate and catches 0% of spam. Your model
# must beat the baseline on the metric that matters, not just on accuracy.
# Drag the share of spam to see how a lazy baseline looks better as spam gets
# rarer.
#
# WHERE YOU USE IT
# Report "model 0.97 accuracy versus 0.95 for always-Normal" — the honest
# improvement is 2 points, not 97.
#
# RUN IT:  python 03_big-7.py
#

import numpy as np

y = np.array([0] * 95 + [1] * 5)
pred = np.zeros_like(y)
print((pred == y).mean())
print(((pred == 1) & (y == 1)).sum() / (y == 1).sum())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.95
# 0.0
