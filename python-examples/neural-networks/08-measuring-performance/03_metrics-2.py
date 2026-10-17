# -*- coding: utf-8 -*-
# ==========================================================================
# Precision, recall and specificity [neural-networks / Measuring performance]
# ==========================================================================
# WHAT IT IS
# Different denominators answer different questions. Precision = TP/(TP+FP):
# of everything flagged, how much was right? Recall (sensitivity) =
# TP/(TP+FN): of all real positives, how many did we find? Specificity =
# TN/(TN+FP); false-positive rate = FP/(FP+TN) = 1 − specificity. The
# 100-email audit (TP=16, FP=8, FN=4, TN=72): precision = 16/24 = 0.667,
# recall = 16/20 = 0.80, specificity = 72/80 = 0.90, FPR = 0.10. FPR is NOT 1
# − precision: it divides by all real negatives, not all predicted positives.
# If TP+FP = 0, precision is undefined.
#
# WHERE YOU USE IT
# High recall suits fraud and safety screens where a miss is expensive; high
# precision suits cases where a false alarm is costly.
#
# RUN IT:  python 03_metrics-2.py
#

tp, fp, fn, tn = 16, 8, 4, 72
precision = tp / (tp + fp)
recall = tp / (tp + fn)
specificity = tn / (tn + fp)
print(round(precision, 4), recall, specificity, round(1 - specificity, 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.6667 0.8 0.9 0.1
