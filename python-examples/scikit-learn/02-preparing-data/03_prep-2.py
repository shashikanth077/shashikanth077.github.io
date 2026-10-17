# -*- coding: utf-8 -*-
# ==========================================================================
# Scaling features with StandardScaler [scikit-learn / Preparing data]
# ==========================================================================
# WHAT IT IS
# Many models compare or add features, so a column in the thousands overwhelms
# one in single digits. StandardScaler rescales each column to mean 0 and
# spread 1: (x − mean) / std. The pattern is scaler.fit(X_train) to learn the
# mean and std (stored as mean_ and scale_), then scaler.transform(X) to apply
# them. MinMaxScaler squeezes values into 0–1 instead.
#
# WHERE YOU USE IT
# KNN, SVM, logistic regression and neural networks all need scaled features.
# Trees do not.
#
# RUN IT:  python 03_prep-2.py
#

from sklearn.preprocessing import StandardScaler

X = [[10.0], [20.0], [30.0], [40.0]]
sc = StandardScaler().fit(X)
print(sc.mean_.tolist(), sc.scale_.round(2).tolist())
print(sc.transform(X).round(2).ravel().tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [25.0] [11.18]
# [-1.34, -0.45, 0.45, 1.34]
