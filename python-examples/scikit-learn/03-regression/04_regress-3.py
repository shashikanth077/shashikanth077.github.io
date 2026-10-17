# -*- coding: utf-8 -*-
# ==========================================================================
# PolynomialFeatures: bending the line [scikit-learn / Regression]
# ==========================================================================
# WHAT IT IS
# A straight line cannot follow a curve. PolynomialFeatures(degree=2) adds new
# columns — x² here — so that a LINEAR model on [1, x, x²] can draw a
# parabola. The model is still linear in its coefficients; only the inputs
# changed. Higher degrees give more flexible curves, which leads straight to
# overfitting.
#
# WHERE YOU USE IT
# Feature engineering ideas like squares, products and logs let simple models
# capture non-linear patterns.
#
# RUN IT:  python 04_regress-3.py
#

from sklearn.preprocessing import PolynomialFeatures

print(PolynomialFeatures(degree=2).fit_transform([[2], [3]]).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1.0, 2.0, 4.0], [1.0, 3.0, 9.0]]
