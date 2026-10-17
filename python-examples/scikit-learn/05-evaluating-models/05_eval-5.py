# -*- coding: utf-8 -*-
# ==========================================================================
# Tuning with GridSearchCV [scikit-learn / Evaluating models]
# ==========================================================================
# WHAT IT IS
# Settings you choose before training (hyper-parameters such as n_neighbors or
# max_depth) can be searched automatically. GridSearchCV(model,
# {"n_neighbors": [1, 3, 5]}, cv=3) cross-validates every combination, keeps
# the best (best_params_, best_score_) and refits it on all the training data.
# Search only on the training set, and keep the test set for one final check —
# otherwise the test score is optimistic.
#
# WHERE YOU USE IT
# A grid of 3 values × 4 values × 5 folds is 60 fits; use RandomizedSearchCV
# when grids get large.
#
# RUN IT:  python 05_eval-5.py
#

from sklearn.model_selection import GridSearchCV
from sklearn.neighbors import KNeighborsClassifier

X = [[i] for i in [1, 2, 3, 4, 5, 6, 10, 11, 12, 13, 14, 15]]
y = [0] * 6 + [1] * 6
gs = GridSearchCV(KNeighborsClassifier(), {"n_neighbors": [1, 3, 5]}, cv=3).fit(X, y)
print(len(gs.cv_results_["params"]))
print(gs.cv_results_["params"])
print(gs.best_params_["n_neighbors"] in [1, 3, 5])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3
# [{'n_neighbors': 1}, {'n_neighbors': 3}, {'n_neighbors': 5}]
# True
