# -*- coding: utf-8 -*-
# ==========================================================================
# Thresholds: make the decision rule visible [machine-learning / Evaluating
# models honestly]
# ==========================================================================
# WHAT IT IS
# A model returns scores; a threshold turns them into decisions: predict Spam
# when p ≥ threshold. Lowering the threshold finds more Spam and flags more
# Normal. Eight scored emails (A 0.9 Spam, B 0.8 Normal, C 0.7 Spam, D 0.6
# Normal, E 0.4 Spam, F 0.3, G 0.2, H 0.1 Normal). At 0.5: TP 2, FP 2, FN 1,
# TN 3 → precision 0.5, recall 0.667, F1 0.571. At 0.7: TP 2, FP 1 → P = R =
# F1 = 0.667. At 0.8: TP 1, FP 1, FN 2 → precision falls to 0.5, so raising
# the threshold does NOT guarantee higher precision. Drag it.
#
# WHERE YOU USE IT
# Choose the threshold from validation predictions and the cost of each
# mistake; then evaluate that frozen rule on the test set.
#
# RUN IT:  python 06_eval-5.py
#

import numpy as np

p = np.array([0.9, 0.8, 0.7, 0.6, 0.4, 0.3, 0.2, 0.1])
y = np.array([1, 0, 1, 0, 1, 0, 0, 0])
for t in (0.5, 0.7, 0.8):
    pred = p >= t
    tp, fp = int((pred & (y == 1)).sum()), int((pred & (y == 0)).sum())
    fn, tn = int(((~pred) & (y == 1)).sum()), int(((~pred) & (y == 0)).sum())
    print(t, tp, fp, fn, tn, round(tp / (tp + fp), 4), round(tp / (tp + fn), 4), round(2 * tp / (2 * tp + fp + fn), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 2 2 1 3 0.5 0.6667 0.5714
# 0.7 2 1 1 4 0.6667 0.6667 0.6667
# 0.8 1 1 2 4 0.5 0.3333 0.4
