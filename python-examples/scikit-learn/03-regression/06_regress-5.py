# -*- coding: utf-8 -*-
# ==========================================================================
# Regularisation: Ridge shrinks coefficients [scikit-learn / Regression]
# ==========================================================================
# WHAT IT IS
# Regularisation adds a penalty for big coefficients so the model cannot chase
# every wiggle. Ridge(alpha=1.0) is linear regression plus an L2 penalty: the
# larger alpha, the more the slope shrinks toward zero. Drag alpha: the line
# pivots around the centre of the data and flattens. Lasso (L1 penalty) can
# push some coefficients exactly to zero, which doubles as feature selection.
#
# WHERE YOU USE IT
# With many features or little data, a Ridge model is usually more stable than
# plain least squares. Tune alpha with cross-validation.
#
# RUN IT:  python 06_regress-5.py
#

from sklearn.linear_model import LinearRegression, Ridge

X = [[1], [2], [3], [4]]
y = [3, 5, 7, 9]
ols = LinearRegression().fit(X, y)
ridge = Ridge(alpha=1.0).fit(X, y)
print(round(float(ols.coef_[0]), 3), round(float(ridge.coef_[0]), 3))
print(round(float(ridge.intercept_), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 1.667
# 1.833
