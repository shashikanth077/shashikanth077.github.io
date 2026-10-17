# -*- coding: utf-8 -*-
# ==========================================================================
# Underfitting and overfitting [scikit-learn / Regression]
# ==========================================================================
# WHAT IT IS
# Too simple a model misses the pattern (underfitting): high error on both
# training and new data. Too flexible a model memorises the training points,
# noise included (overfitting): near-zero training error but a worse error on
# new data. Drag the complexity from a line, to a parabola, to a 6th-degree
# curve through all seven points and compare the train and test error.
#
# WHERE YOU USE IT
# The goal is not the lowest training error; it is the lowest error on data
# the model has not seen.
#
# RUN IT:  python 05_regress-4.py
#

import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import PolynomialFeatures

x_train = np.array([1, 2, 3, 4, 5, 6, 7.0]).reshape(-1, 1)
y_train = np.array([1.2, 3.8, 9.5, 16.3, 24.8, 35.5, 49.2])
x_test = np.array([2.5, 5.5]).reshape(-1, 1)
y_test = np.array([6.0, 30.4])
errors = {}
for degree in (1, 2, 6):
    model = make_pipeline(PolynomialFeatures(degree), LinearRegression()).fit(x_train, y_train)
    errors[degree] = (
        mean_squared_error(y_train, model.predict(x_train)),
        mean_squared_error(y_test, model.predict(x_test)),
    )
print(errors[1][0] > errors[2][0])
print(errors[6][0] < 1e-6)
print(errors[6][1] > errors[2][1])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# True
# True
