# -*- coding: utf-8 -*-
# ==========================================================================
# Precision, recall, specificity and F1 [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# The denominators answer different questions. Precision = TP/(TP + FP): of
# the emails flagged Spam, how many are Spam? 16/24 = 0.667. Recall
# (sensitivity) = TP/(TP + FN): of all real Spam, how many were caught? 16/20
# = 0.80. Specificity = TN/(TN + FP): of all Normal, how many passed? 72/80 =
# 0.90. F1 = 2TP/(2TP + FP + FN) = 32/44 = 0.727, the harmonic mean of
# precision and recall — it punishes imbalance: P = 1 and R = 0.1 give F1 =
# 0.18, not 0.55. Drag the caught Spam and false alarms.
#
# WHERE YOU USE IT
# F1 ignores true negatives. If a denominator is zero the metric is undefined;
# software may return 0 by convention.
#
# RUN IT:  python 04_eval-3.py
#

tp, fp, fn, tn = 16, 8, 4, 72
precision, recall = tp / (tp + fp), tp / (tp + fn)
print(round(precision, 4), recall, tn / (tn + fp))
print(round(2 * precision * recall / (precision + recall), 4), round(2 * tp / (2 * tp + fp + fn), 4))
print(round(2 * 1 * 0.1 / (1 + 0.1), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.6667 0.8 0.9
# 0.7273 0.7273
# 0.1818
