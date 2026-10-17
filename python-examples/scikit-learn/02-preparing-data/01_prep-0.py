# -*- coding: utf-8 -*-
# ==========================================================================
# train_test_split [scikit-learn / Preparing data]
# ==========================================================================
# WHAT IT IS
# train_test_split(X, y, test_size=0.25, random_state=42) shuffles the rows
# and cuts them into a training part (to learn from) and a test part (to grade
# on). It returns four pieces in a fixed order: X_train, X_test, y_train,
# y_test. random_state fixes the shuffle so you get the same split every run.
# Never train and grade on the same rows — the score would only measure
# memory.
#
# WHERE YOU USE IT
# The test set is a stand-in for the future. Look at it once, at the end.
#
# RUN IT:  python 01_prep-0.py
#

import numpy as np
from sklearn.model_selection import train_test_split

X = np.arange(16).reshape(8, 2)
y = np.arange(8)
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)
print(X_train.shape, X_test.shape)
print(len(y_train), len(y_test))
print(sorted(np.concatenate([y_train, y_test]).tolist()) == list(range(8)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (6, 2) (2, 2)
# 6 2
# True
