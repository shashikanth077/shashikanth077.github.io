# -*- coding: utf-8 -*-
# ==========================================================================
# Confusion matrix, precision, recall and F1 [maths-ai / Maths inside ML
# algorithms]
# ==========================================================================
# WHAT IT IS
# Accuracy hides mistakes when classes are unbalanced. A confusion matrix
# counts true/false positives and negatives. Precision = of everything
# flagged, how much was right (TP ÷ (TP + FP)). Recall = of everything real,
# how much was found (TP ÷ (TP + FN)). F1 is their harmonic mean — high only
# when both are.
#
# WHERE YOU USE IT
# For rare-event detection (fraud, disease, urgent tickets) precision and
# recall matter far more than accuracy.
#
# RUN IT:  python 05_ml-4.py
#

tp, fp, fn, tn = 40, 10, 20, 130
precision = tp / (tp + fp)
recall = tp / (tp + fn)
f1 = 2 * precision * recall / (precision + recall)
accuracy = (tp + tn) / (tp + fp + fn + tn)
print(round(precision, 3), round(recall, 3), round(f1, 3), round(accuracy, 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8 0.667 0.727 0.85
