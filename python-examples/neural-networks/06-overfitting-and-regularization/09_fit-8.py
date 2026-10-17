# -*- coding: utf-8 -*-
# ==========================================================================
# Data leakage: the silent cheater [neural-networks / Overfitting and
# regularization]
# ==========================================================================
# WHAT IT IS
# Leakage means information from validation or test data sneaks into training,
# making results look better than they will be. Fit the vocabulary, the
# scaler, the normalisation and any feature selection on the TRAINING split
# only, then apply them to the rest. If one user wrote several similar
# reviews, split by user. Example: scaling with the mean of ALL values shifts
# the test inputs using test information; the honest way uses the training
# mean only.
#
# WHERE YOU USE IT
# A suspiciously high validation score is often a leak, not a breakthrough.
#
# RUN IT:  python 09_fit-8.py
#

import numpy as np

data = np.array([1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0, 8.0, 9.0, 100.0])
train, test = data[:8], data[8:]
leak_mean = data.mean()
honest_mean = train.mean()
print(round(float(leak_mean), 2), round(float(honest_mean), 2))
print((test - honest_mean).round(2).tolist(), (test - leak_mean).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 14.5 4.5
# [4.5, 95.5] [-5.5, 85.5]
