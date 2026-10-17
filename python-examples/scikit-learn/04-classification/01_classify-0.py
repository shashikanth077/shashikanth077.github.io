# -*- coding: utf-8 -*-
# ==========================================================================
# Logistic regression: a probability, then a threshold [scikit-learn /
# Classification]
# ==========================================================================
# WHAT IT IS
# Despite its name, LogisticRegression classifies. It computes a score from
# the features, squeezes it through the S-shaped sigmoid to get a probability
# between 0 and 1, and predicts class 1 when that probability passes a
# threshold — 0.5 by default. Drag the threshold: a lower one catches more
# class-1 cases but also raises false alarms.
#
# WHERE YOU USE IT
# A fast, explainable first model for yes/no questions: churn, default, spam.
# Always scale features first.
#
# RUN IT:  python 01_classify-0.py
#

import numpy as np
from sklearn.linear_model import LogisticRegression

X = [[1], [2], [3], [4], [5], [6]]
y = [0, 0, 0, 1, 1, 1]
clf = LogisticRegression().fit(X, y)
print(clf.predict([[2], [5]]).tolist())
proba = clf.predict_proba([[2], [5]])
print(proba.shape, bool(np.allclose(proba.sum(axis=1), 1)))
print(bool(proba[1, 1] > 0.5))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 1]
# (2, 2) True
# True
