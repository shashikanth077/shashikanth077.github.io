# -*- coding: utf-8 -*-
# ==========================================================================
# The estimator API: fit, predict, score [scikit-learn / The scikit-learn
# workflow]
# ==========================================================================
# WHAT IT IS
# Every scikit-learn model — a line fitter, a tree, a forest — is used the
# same way. Create it with its settings (model = LinearRegression()), teach it
# with model.fit(X, y), ask it for answers with model.predict(X_new) and grade
# it with model.score(X, y). Whatever the model learns is stored in attributes
# ending in an underscore, such as coef_ and intercept_. Learn this pattern
# once and you can use 100 models.
#
# WHERE YOU USE IT
# Swapping a model is a one-line change because the interface never varies.
# That is what makes experiments fast.
#
# RUN IT:  python 01_start-2.py
#

from sklearn.linear_model import LinearRegression

X = [[1], [2], [3], [4]]
y = [3, 5, 7, 9]

model = LinearRegression()
model.fit(X, y)
print(round(float(model.coef_[0]), 2), round(float(model.intercept_), 2))
print(model.predict([[5]]).round(2).tolist())
print(round(model.score(X, y), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2.0 1.0
# [11.0]
# 1.0
