# -*- coding: utf-8 -*-
# ==========================================================================
# ROC curve and AUC: ranking quality [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# Sweep the threshold and plot the true-positive rate TPR = TP/(TP + FN)
# (recall) against the false-positive rate FPR = FP/(FP + TN) = 1 −
# specificity: that is the ROC curve. The area under it, AUC, equals the
# fraction of positive–negative score PAIRS in which the positive ranks higher
# (ties count half). Here, positives 0.9, 0.7, 0.4 and negatives 0.8, 0.6,
# 0.3, 0.2, 0.1 give 15 pairs; the positives beat 5, 4 and 3 negatives: 12/15
# = 0.8. This is NOT 80% accuracy: at threshold 0.5 the accuracy is (2 + 3)/8
# = 0.625.
#
# WHERE YOU USE IT
# AUC 1 is perfect ranking, 0.5 is chance, below 0.5 is possible. It says
# nothing about calibration: a model can rank well and still be overconfident.
#
# RUN IT:  python 07_eval-6.py
#

import numpy as np

pos = np.array([0.9, 0.7, 0.4])
neg = np.array([0.8, 0.6, 0.3, 0.2, 0.1])
wins = (pos[:, None] > neg[None, :]).sum() + 0.5 * (pos[:, None] == neg[None, :]).sum()
print(int(wins), pos.size * neg.size, round(float(wins / (pos.size * neg.size)), 3))
print((2 + 3) / 8)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 12 15 0.8
# 0.625
