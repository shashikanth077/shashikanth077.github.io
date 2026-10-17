# -*- coding: utf-8 -*-
# ==========================================================================
# Fit on train only: avoiding leakage [scikit-learn / Preparing data]
# ==========================================================================
# WHAT IT IS
# The scaler's mean and std must be learned from the training rows only, then
# reused on the test rows. If you fit on all rows, information about the test
# set seeps into training — the test score becomes optimistic. In code: fit
# (or fit_transform) on train; only transform on test. Here the same test
# value 25 is scaled to 0.0 with the training statistics, but the leaky scaler
# would give a different number.
#
# WHERE YOU USE IT
# Leakage is the number-one reason a model that scored 95% in a notebook fails
# in production. Pipelines (later) make the mistake impossible.
#
# RUN IT:  python 04_prep-3.py
#

from sklearn.preprocessing import StandardScaler

train = [[10.0], [20.0], [30.0], [40.0]]
test = [[25.0], [50.0]]
good = StandardScaler().fit(train)
print(good.transform(test).round(2).ravel().tolist())
leaky = StandardScaler().fit(train + test)
print(leaky.transform(test).round(2).ravel().tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 2.24]
# [-0.32, 1.6]
