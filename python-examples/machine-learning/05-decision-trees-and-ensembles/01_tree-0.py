# -*- coding: utf-8 -*-
# ==========================================================================
# Decision tree: learn useful questions [machine-learning / Decision trees and
# ensembles]
# ==========================================================================
# WHAT IT IS
# A decision tree predicts by following a path of yes/no questions to a leaf.
# Training chooses the questions: for a numeric feature the candidate
# thresholds are the midpoints between observed values (between 2 and 3 links:
# 2.5), and the best one is the split that leaves the purest groups. For our
# eight emails "links ≤ 2.5?" separates Normal from Spam perfectly. To predict
# an email with 2 links, answer yes and follow the left branch to Normal — no
# arithmetic beyond one comparison.
#
# WHERE YOU USE IT
# Trees are readable, need no scaling and handle mixed features. They build
# greedily: the best split at each step, not necessarily the best tree.
#
# RUN IT:  python 01_tree-0.py
#

import numpy as np

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

def gini(labels):
    if len(labels) == 0:
        return 0.0
    p = np.bincount(labels, minlength=2) / len(labels)
    return float(1 - (p ** 2).sum())

values = np.unique(links)
best = None
for t in (values[:-1] + values[1:]) / 2:
    left, right = y[links <= t], y[links > t]
    w = (len(left) * gini(left) + len(right) * gini(right)) / len(y)
    if best is None or w < best[1]:
        best = (float(t), w)
print(best)
print("Spam" if 2 > best[0] else "Normal")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (2.5, 0.0)
# Normal
