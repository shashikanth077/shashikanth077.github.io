# -*- coding: utf-8 -*-
# ==========================================================================
# ROC curve and AUC [neural-networks / Measuring performance]
# ==========================================================================
# WHAT IT IS
# Sweep the threshold from above every score down to below every score. Each τ
# gives a point (FPR, TPR=recall); joining them is the ROC curve. A ranking
# that puts positives above negatives hugs the top-left. AUC is the area under
# it — equivalently the probability that a random positive outscores a random
# negative (ties count ½). Tiny example: scores positive 0.9, negative 0.8,
# positive 0.7, negative 0.1: 4 pairs; 0.9 beats both negatives (2), 0.7 beats
# one (1) → AUC = 3/4. 1.0 = perfect ranking, 0.5 = random, below 0.5 =
# reversed. AUC says nothing about the best threshold or calibration; for rare
# positives also read precision–recall.
#
# WHERE YOU USE IT
# ROC AUC needs both classes present in the evaluated data.
#
# RUN IT:  python 06_metrics-5.py
#

import numpy as np

pos = np.array([0.9, 0.7])
neg = np.array([0.8, 0.1])
wins = sum((p > n) + 0.5 * (p == n) for p in pos for n in neg)
print(wins, wins / (len(pos) * len(neg)))
scores = np.array([0.9, 0.8, 0.7, 0.1])
labels = np.array([1, 0, 1, 0])
for tau in (1.0, 0.85, 0.75, 0.5, 0.05):
    pred = scores >= tau
    print(tau, (pred & (labels == 1)).sum() / 2, (pred & (labels == 0)).sum() / 2)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3.0 0.75
# 1.0 0.0 0.0
# 0.85 0.5 0.0
# 0.75 0.5 0.5
# 0.5 1.0 0.5
# 0.05 1.0 1.0
