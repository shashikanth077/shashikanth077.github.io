# -*- coding: utf-8 -*-
# ==========================================================================
# K-fold, stratified K-fold and leave-one-out [machine-learning / Evaluating
# models honestly]
# ==========================================================================
# WHAT IT IS
# K-fold rotates a held-out fold: five-fold on the 80 development emails holds
# out 16 and trains on 64 each run, five runs, and averages the scores.
# Stratified K-fold keeps the class proportions in each fold (not equal class
# sizes!). Leave-one-out holds out one row each run: 80 runs; leave-p-out
# tries every p-subset: C(80, 2) = 3,160 runs. Suppose the five macro-F1
# scores are 0.70, 0.75, 0.80, 0.75, 0.70: the mean is 0.74; also look at
# their spread. With very few minority rows, a fold may miss a class.
#
# WHERE YOU USE IT
# Compare candidates on the SAME folds. Use group-aware folds for repeated
# customers and time-aware folds for forecasting; cross-validation does not
# fix a wrong split.
#
# RUN IT:  python 02_eval-1.py
#

import math
import numpy as np

n = 80
print(n - n // 5, n // 5, math.comb(n, 2))
scores = np.array([0.70, 0.75, 0.80, 0.75, 0.70])
print(round(float(scores.mean()), 2), round(float(scores.std()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 64 16 3160
# 0.74 0.037
