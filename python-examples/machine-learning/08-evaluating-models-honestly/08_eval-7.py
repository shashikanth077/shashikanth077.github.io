# -*- coding: utf-8 -*-
# ==========================================================================
# Precision–recall curve and average precision [machine-learning / Evaluating
# models honestly]
# ==========================================================================
# WHAT IT IS
# When positives are rare, ROC can look flattering because the many negatives
# keep FPR small. A precision–recall curve plots precision against recall as
# the threshold moves and focuses on the quality of the alerts. Average
# precision summarises it as Σ (Rₙ − Rₙ₋₁) Pₙ. For the eight scores, the
# recall steps are 1/3 each, at precisions 1, 2/3 and 0.6, so AP = (1 + 0.667
# + 0.6)/3 = 0.7556. AP is not identical to every trapezoidal PR-area
# definition.
#
# WHERE YOU USE IT
# Use PR curves for fraud, defects and any rare-event alerting; compare to the
# base rate (3/8 = 0.375 here) rather than to 0.5.
#
# RUN IT:  python 08_eval-7.py
#

import numpy as np

p = np.array([0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1])
y = np.array([1, 0, 1, 0, 1, 0, 0, 0])
ap, prev_recall = 0.0, 0.0
for t in sorted(set(p), reverse=True):
    pred = p >= t
    tp = int((pred & (y == 1)).sum())
    precision, recall = tp / pred.sum(), tp / y.sum()
    ap += (recall - prev_recall) * precision
    prev_recall = recall
print(round(ap, 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7556
