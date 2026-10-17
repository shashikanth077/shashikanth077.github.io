# -*- coding: utf-8 -*-
# ==========================================================================
# The confusion matrix: read the mistakes first [machine-learning / Evaluating
# models honestly]
# ==========================================================================
# WHAT IT IS
# Fix the positive class and the axes before reading anything. Here Spam is
# positive; rows are actual, columns predicted. Of 100 emails (20 Spam, 80
# Normal) the filter catches 16 Spam, misses 4 and wrongly blocks 8 Normal: TP
# = 16, FN = 4, FP = 8, TN = 72. Accuracy = (TP + TN) / total = 88/100 = 0.88.
# Rebuild the cells from a sentence: true positives, then caught, the rest are
# missed; false alarms come from the Normal class; the remainder are true
# negatives.
#
# WHERE YOU USE IT
# Exercise: 18 of 20 Spam caught and 6 of 80 Normal blocked gives TP = 18, FN
# = 2, FP = 6, TN = 74 (sum 100).
#
# RUN IT:  python 03_eval-2.py
#

import numpy as np

spam_total, normal_total, caught, blocked = 20, 80, 16, 8
tp, fn = caught, spam_total - caught
fp, tn = blocked, normal_total - blocked
print(np.array([[tp, fn], [fp, tn]]).tolist(), (tp + tn) / (tp + tn + fp + fn))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[16, 4], [8, 72]] 0.88
