# -*- coding: utf-8 -*-
# ==========================================================================
# Gini impurity and the best split [machine-learning / Decision trees and
# ensembles]
# ==========================================================================
# WHAT IT IS
# Gini(node) = 1 − Σ pᵢ² measures how mixed a node is: 0 is pure; 0.5 is a
# 50/50 split of two classes. A split is scored by the WEIGHTED child Gini, Σ
# (n_child / n_parent) · Gini(child), weighted by row counts. The impurity
# reduction is parent minus weighted children. The parent has 4 Spam and 4
# Normal: Gini = 1 − 0.5² − 0.5² = 0.5. Drag the links threshold and watch the
# reduction peak at 2.5.
#
# WHERE YOU USE IT
# Exam: a node with 6 Spam and 4 Normal has Gini 1 − 0.36 − 0.16 = 0.48.
# Always write the formula, substitute, calculate, interpret.
#
# RUN IT:  python 02_tree-1.py
#

import numpy as np

def gini(y):
    p = np.bincount(y, minlength=2) / len(y)
    return round(float(1 - (p ** 2).sum()), 4)

links = np.array([0, 1, 1, 2, 3, 4, 4, 5])
offer = np.array([0, 0, 1, 0, 1, 1, 0, 1])
y = np.array([0, 0, 0, 0, 1, 1, 1, 1])

def weighted(mask):
    left, right = y[mask], y[~mask]
    return round((len(left) * gini(left) + len(right) * gini(right)) / len(y), 4)

print(gini(y), weighted(links <= 2.5), weighted(offer == 1))
print(gini(np.array([1] * 6 + [0] * 4)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 0.0 0.375
# 0.48
