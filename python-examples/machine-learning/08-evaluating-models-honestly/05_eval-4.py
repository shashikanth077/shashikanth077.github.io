# -*- coding: utf-8 -*-
# ==========================================================================
# Macro, weighted and micro averages [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# Calculate each class's metrics first, then average. Using the same 100-email
# matrix and evaluating Normal as its own positive class (TP = 72, FP = 4, FN
# = 8, support 80): Spam F1 = 0.7273 (support 20), Normal F1 = 0.9231. Macro
# averages the classes equally: F1 = 0.8252. Weighted weights by support:
# (20×0.7273 + 80×0.9231)/100 = 0.8839. Micro adds the counts across classes
# first; for single-label multiclass it equals accuracy. Weighted recall =
# accuracy = 0.88; macro recall (balanced accuracy) = 0.85.
#
# WHERE YOU USE IT
# "Macro accuracy" and "weighted accuracy" have several definitions in
# courses. State the formula you use: macro recall is not the same as an
# average of one-vs-rest accuracies. Macro F1 is not the F1 of macro precision
# and macro recall.
#
# RUN IT:  python 05_eval-4.py
#

import numpy as np

f1 = np.array([32 / 44, 144 / 156])
support = np.array([20, 80])
recall = np.array([16 / 20, 72 / 80])
print(f1.round(4).tolist(), round(float(f1.mean()), 4), round(float((f1 * support).sum() / support.sum()), 4))
print(round(float(recall.mean()), 2), round(float((recall * support).sum() / support.sum()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.7273, 0.9231] 0.8252 0.8839
# 0.85 0.88
