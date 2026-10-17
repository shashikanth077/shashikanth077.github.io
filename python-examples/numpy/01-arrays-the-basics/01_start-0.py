# -*- coding: utf-8 -*-
# ==========================================================================
# Why NumPy: lists versus arrays [numpy / Arrays: the basics]
# ==========================================================================
# WHAT IT IS
# A Python list holds any objects, so list 2 repeats it and arithmetic needs a
# loop. A NumPy array holds numbers of one type packed side by side, so one
# operation applies to every element at once — "vectorised" — in fast compiled
# code. NumPy is the foundation under pandas, scikit-learn and the
# deep-learning frameworks.
#
# WHERE YOU USE IT
# Features, weights, images and predictions are all arrays. Every ML library
# speaks NumPy.
#
# RUN IT:  python 01_start-0.py
#

import numpy as np

prices = [100, 200, 300]
print(prices * 2)
arr = np.array(prices)
print(arr * 2)
print(arr * 0.9)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [100, 200, 300, 100, 200, 300]
# [200 400 600]
# [ 90. 180. 270.]
