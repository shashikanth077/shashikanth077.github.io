# -*- coding: utf-8 -*-
# ==========================================================================
# Random forests: many trees vote [scikit-learn / Classification]
# ==========================================================================
# WHAT IT IS
# A RandomForestClassifier trains many trees, each on a random resample of the
# rows (and random subsets of features), and combines them by voting.
# Individual trees overfit in different ways, so their mistakes cancel out.
# More trees (n_estimators) rarely hurts. feature_importances_ reports how
# much each feature helped, summing to 1.
#
# WHERE YOU USE IT
# A forest is the usual strong default for tabular data — little tuning, no
# scaling, resists overfitting.
#
# RUN IT:  python 07_classify-6.py
#

from sklearn.ensemble import RandomForestClassifier

X = [[1], [2], [3], [10], [11], [12]]
y = [0, 0, 0, 1, 1, 1]
rf = RandomForestClassifier(n_estimators=10, random_state=0).fit(X, y)
print(len(rf.estimators_))
print(rf.predict([[4], [9]]).tolist())
print(round(float(rf.feature_importances_.sum()), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 10
# [0, 1]
# 1.0
