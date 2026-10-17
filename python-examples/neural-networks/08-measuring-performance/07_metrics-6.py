# -*- coding: utf-8 -*-
# ==========================================================================
# Multiclass: confusion matrix, macro, micro and weighted F1 [neural-networks
# / Measuring performance]
# ==========================================================================
# WHAT IT IS
# With ten digits the matrix has ten rows and columns; the diagonal holds
# correct predictions. A 3-class example (rows actual A,B,C; columns
# predicted): A [8,1,0], B [2,6,1], C [0,1,7]. Accuracy = (8+6+7)/26 = 80.77%.
# Treat B as positive and the rest as negative (one-vs-rest): TP=6, FN=2+1=3,
# FP=1+1=2, TN=15 → precision 75%, recall 66.7%, F1 = 12/17 = 70.59%.
# Per-class F1: A 84.21%, B 70.59%, C 87.5%. Macro F1 averages them equally
# (80.77%); weighted F1 weights by support (80.51%); micro pools all decisions
# and equals accuracy for single-label problems.
#
# WHERE YOU USE IT
# Macro F1 lets a rare class matter as much as a common one; overall accuracy
# can hide one difficult digit.
#
# RUN IT:  python 07_metrics-6.py
#

import numpy as np

cm = np.array([[8, 1, 0], [2, 6, 1], [0, 1, 7]])
tp = np.diag(cm).astype(float)
precision = tp / cm.sum(axis=0)
recall = tp / cm.sum(axis=1)
f1 = 2 * precision * recall / (precision + recall)
support = cm.sum(axis=1)
print(round(float(tp.sum() / cm.sum()), 4))
print(precision.round(4).tolist(), recall.round(4).tolist(), f1.round(4).tolist())
print(round(float(f1.mean()), 4), round(float((f1 * support).sum() / support.sum()), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8077
# [0.8, 0.75, 0.875] [0.8889, 0.6667, 0.875] [0.8421, 0.7059, 0.875]
# 0.8077 0.8051
