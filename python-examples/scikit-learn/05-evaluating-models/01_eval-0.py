# -*- coding: utf-8 -*-
# ==========================================================================
# Accuracy can lie: the baseline [scikit-learn / Evaluating models]
# ==========================================================================
# WHAT IT IS
# Accuracy is the share of correct predictions, and with imbalanced classes it
# is easy to inflate. If only 25% of cases are positive, a "model" that always
# says negative is right 75% of the time — while finding none of the
# positives. DummyClassifier(strategy="most_frequent") builds exactly that
# baseline; your real model has to beat it, and on a metric that cares about
# the rare class.
#
# WHERE YOU USE IT
# A 99% accurate fraud model that never flags fraud is worthless. Always
# compare with a dummy baseline.
#
# RUN IT:  python 01_eval-0.py
#

from sklearn.dummy import DummyClassifier

y = [0] * 9 + [1] * 3
X = [[i] for i in range(12)]
dummy = DummyClassifier(strategy="most_frequent").fit(X, y)
print(dummy.score(X, y))
print(dummy.predict([[100]]).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.75
# [0]
