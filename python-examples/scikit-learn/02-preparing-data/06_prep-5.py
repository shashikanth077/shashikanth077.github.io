# -*- coding: utf-8 -*-
# ==========================================================================
# Missing values: SimpleImputer [scikit-learn / Preparing data]
# ==========================================================================
# WHAT IT IS
# Most scikit-learn models stop with an error if the data contains NaN.
# SimpleImputer(strategy="median") learns a fill value per column from the
# training data (statistics_) and fills gaps with it; other strategies are
# "mean", "most_frequent" (for categories) and "constant". The median is safer
# than the mean when values are skewed. Add add_indicator=True to also record
# which values were missing.
#
# WHERE YOU USE IT
# Fill from the training rows only; the test rows then get the same number.
#
# RUN IT:  python 06_prep-5.py
#

import numpy as np
from sklearn.impute import SimpleImputer

X = np.array([[1.0], [np.nan], [3.0], [5.0]])
imp = SimpleImputer(strategy="median").fit(X)
print(imp.statistics_.tolist())
print(imp.transform(X).ravel().tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3.0]
# [1.0, 3.0, 3.0, 5.0]
