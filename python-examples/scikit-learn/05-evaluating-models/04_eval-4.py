# -*- coding: utf-8 -*-
# ==========================================================================
# Cross-validation [scikit-learn / Evaluating models]
# ==========================================================================
# WHAT IT IS
# One train/test split can be lucky or unlucky. cross_val_score(model, X, y,
# cv=5) cuts the data into 5 folds, and five times trains on four folds and
# tests on the fifth, so every row is tested once. You get five scores: their
# mean is a steadier estimate and their spread shows how much the score
# depends on the split. For classifiers scikit-learn automatically stratifies
# the folds.
#
# WHERE YOU USE IT
# Cross-validate to compare models and tune settings, then confirm the winner
# once on the untouched test set.
#
# RUN IT:  python 04_eval-4.py
#

from sklearn.dummy import DummyClassifier
from sklearn.model_selection import KFold, cross_val_score

for train, test in KFold(3).split(range(6)):
    print(train.tolist(), test.tolist())

y = [0] * 9 + [1] * 3
X = [[i] for i in range(12)]
print(cross_val_score(DummyClassifier(strategy="most_frequent"), X, y, cv=3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2, 3, 4, 5] [0, 1]
# [0, 1, 4, 5] [2, 3]
# [0, 1, 2, 3] [4, 5]
# [0.75, 0.75, 0.75]
