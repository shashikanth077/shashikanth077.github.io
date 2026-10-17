# -*- coding: utf-8 -*-
# ==========================================================================
# predict versus predict_proba [scikit-learn / Classification]
# ==========================================================================
# WHAT IT IS
# predict returns the chosen class labels; predict_proba returns a probability
# for each class, one column per class in the order of clf.classes_, and each
# row sums to 1. Use probabilities when the cost of mistakes differs: apply
# your own threshold (proba[:, 1] > 0.3) instead of the default 0.5, or rank
# cases from most to least likely.
#
# WHERE YOU USE IT
# A fraud team may review every case above 20% probability; the default 50%
# cut-off would miss most of them.
#
# RUN IT:  python 02_classify-1.py
#

from sklearn.linear_model import LogisticRegression

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 0, 1, 1, 1]
clf = LogisticRegression().fit(X, y)
print(clf.classes_.tolist())
print(clf.predict_proba([[3.5]]).round(1).tolist())
print(bool((clf.predict(X) == (clf.predict_proba(X)[:, 1] > 0.5)).all()))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 1]
# [[0.5, 0.5]]
# True
