# -*- coding: utf-8 -*-
# ==========================================================================
# Preprocessing leakage: fit on training only [machine-learning / Preparing
# data]
# ==========================================================================
# WHAT IT IS
# Every learned preparation step (fill value, encoder categories, scaler mean
# and std, SMOTE neighbours, selected features) must be fitted on the training
# rows and only APPLIED to validation and test rows. If you fit a scaler on
# all rows, the test data influences the numbers used to prepare the training
# data: scores look better than reality. Inside cross-validation this means
# the whole preparation lives inside each fold.
#
# WHERE YOU USE IT
# Pipelines exist to make this mistake impossible. Fitting a scaler before
# cross-validation is a classic bug.
#
# RUN IT:  python 08_prep-8.py
#

import numpy as np

train = np.array([10.0, 20.0, 30.0, 40.0])
test = np.array([25.0, 50.0])
print(((test - train.mean()) / train.std()).round(2).tolist())
both = np.concatenate([train, test])
print(((test - both.mean()) / both.std()).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 2.24]
# [-0.32, 1.6]
