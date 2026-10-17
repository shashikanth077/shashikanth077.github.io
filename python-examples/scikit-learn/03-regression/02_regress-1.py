# -*- coding: utf-8 -*-
# ==========================================================================
# Reading coef_ and intercept_ [scikit-learn / Regression]
# ==========================================================================
# WHAT IT IS
# With several features the model is y = c1·x1 + c2·x2 + … + intercept. After
# fit, model.coef_ holds one number per column of X (in order) and
# model.intercept_ the constant. A coefficient says how much y changes when
# that feature rises by one unit with the others held fixed — which makes
# linear models easy to explain. Here the data follows y = 2·x1 + 3·x2 + 1
# exactly.
#
# WHERE YOU USE IT
# Coefficients are only comparable if features are on the same scale, and
# correlated features can split credit unpredictably.
#
# RUN IT:  python 02_regress-1.py
#

from sklearn.linear_model import LinearRegression

X = [[1, 0], [0, 1], [1, 1], [2, 1]]
y = [3, 4, 6, 8]
model = LinearRegression().fit(X, y)
print(model.coef_.round(2).tolist(), round(float(model.intercept_), 2))
print(model.predict([[3, 2]]).round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2.0, 3.0] 1.0
# [13.0]
