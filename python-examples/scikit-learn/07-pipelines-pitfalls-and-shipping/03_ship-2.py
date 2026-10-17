# -*- coding: utf-8 -*-
# ==========================================================================
# Feature importance and what the model learned [scikit-learn / Pipelines,
# pitfalls and shipping]
# ==========================================================================
# WHAT IT IS
# Linear models expose coef_; tree models expose feature_importances_, a share
# per feature that sums to 1. A feature that never helps a split gets 0 — here
# the constant second column. Importances show what the model used, not what
# causes the outcome, and they can be split unpredictably among correlated
# features. sklearn.inspection.permutation_importance is a more reliable check
# on test data.
#
# WHERE YOU USE IT
# Use importances to find useless columns to drop and to sanity-check that the
# model uses features you expect, not an ID or a leak.
#
# RUN IT:  python 03_ship-2.py
#

from sklearn.ensemble import RandomForestClassifier

X = [[1, 5], [2, 5], [3, 5], [10, 5], [11, 5], [12, 5]]
y = [0, 0, 0, 1, 1, 1]
rf = RandomForestClassifier(n_estimators=10, random_state=0).fit(X, y)
print(rf.feature_importances_.round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1.0, 0.0]
