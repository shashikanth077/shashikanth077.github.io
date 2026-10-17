# -*- coding: utf-8 -*-
# ==========================================================================
# Accuracy, and when it lies [neural-networks / Measuring performance]
# ==========================================================================
# WHAT IT IS
# Accuracy = (TP + TN) / (TP + TN + FP + FN). In a 100-email audit (20 spam,
# 80 normal) with TP=16, FN=4, FP=8, TN=72: accuracy = (16+72)/100 = 88%. The
# trap: with a rare positive class a useless model scores high. If 9 of 9,999
# cases are positive and the model predicts "negative" for everything,
# accuracy is 9,990/9,999 ≈ 99.91% — yet recall is 0/9 = 0%: it finds none of
# the cases that matter.
#
# WHERE YOU USE IT
# Accuracy hides which class fails. Pair it with precision, recall and a
# confusion matrix whenever classes are imbalanced.
#
# RUN IT:  python 02_metrics-1.py
#

tp, fn, fp, tn = 16, 4, 8, 72
print((tp + tn) / (tp + tn + fp + fn))
tp, fn, fp, tn = 0, 9, 0, 9990
print(round((tp + tn) / (tp + tn + fp + fn), 4), tp / (tp + fn))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.88
# 0.9991 0.0
