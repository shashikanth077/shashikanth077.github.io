# -*- coding: utf-8 -*-
# ==========================================================================
# Grid search: compare settings fairly [machine-learning / Evaluating models
# honestly]
# ==========================================================================
# WHAT IT IS
# Hyper-parameters (k, depth, C) are chosen before training; parameters (tree
# thresholds, SVM weights) are learned. Grid search tries every combination
# with the same cross-validation folds. For kNN with k ∈ {1, 3, 5} and weights
# ∈ {uniform, distance}: 6 candidates × 5 folds = 30 validation fits, plus one
# final refit of the winner. Select by mean validation macro F1 — k = 3 with
# distance weights (0.82) — then evaluate once on the test set. A 0.01
# difference is not automatically meaningful: look at fold variation and cost.
#
# WHERE YOU USE IT
# Do not report the best cross-validation score as an untouched test score.
# When many rounds of decisions reuse the same validation data, nested
# cross-validation estimates the whole tuning procedure.
#
# RUN IT:  python 10_eval-10.py
#

from itertools import product

grid = {"k": [1, 3, 5], "weights": ["uniform", "distance"]}
combos = list(product(*grid.values()))
print(len(combos), len(combos) * 5)
cv_scores = dict(zip(combos, [0.72, 0.72, 0.80, 0.82, 0.79, 0.81]))
print(max(cv_scores, key=cv_scores.get))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6 30
# (3, 'distance')
