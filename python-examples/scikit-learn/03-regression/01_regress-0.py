# -*- coding: utf-8 -*-
# ==========================================================================
# Linear regression: the best straight line [scikit-learn / Regression]
# ==========================================================================
# WHAT IT IS
# Regression predicts a number. LinearRegression finds the line y = coef × x +
# intercept that makes the total squared distance from the points to the line
# as small as possible. Those vertical gaps are the residuals; their squares
# added together are the error being minimised. Drag the slope and intercept
# yourself and watch the error — the best values are the ones scikit-learn
# finds.
#
# WHERE YOU USE IT
# House prices, delivery times, energy use: a linear model is the baseline
# every other regression model must beat.
#
# RUN IT:  python 01_regress-0.py
#

from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4], [5]]
y = [2.1, 3.9, 6.2, 7.8, 10.1]
model = LinearRegression().fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))
print(round(model.score(X, y), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.99 0.05
# 0.997
