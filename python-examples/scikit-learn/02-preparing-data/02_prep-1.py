# -*- coding: utf-8 -*-
# ==========================================================================
# Stratified splits keep class proportions [scikit-learn / Preparing data]
# ==========================================================================
# WHAT IT IS
# A random split can, by bad luck, put too few rows of a rare class in the
# test set. train_test_split(…, stratify=y) splits each class separately so
# the train and test parts keep the same proportions. With a 50/50 label and
# test_size=0.4, the test set gets two of each class. Use it for
# classification, especially with imbalanced classes.
#
# WHERE YOU USE IT
# With 5% positives, an unstratified test set of 20 rows may contain no
# positives at all — a useless evaluation.
#
# RUN IT:  python 02_prep-1.py
#

import numpy as np
from sklearn.model_selection import train_test_split

y = np.array([0] * 5 + [1] * 5)
X = np.arange(10).reshape(-1, 1)
X_tr, X_te, y_tr, y_te = train_test_split(X, y, test_size=0.4, stratify=y, random_state=0)
print(np.bincount(y_te).tolist(), np.bincount(y_tr).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2, 2] [3, 3]
