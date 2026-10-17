# -*- coding: utf-8 -*-
# ==========================================================================
# Common errors and what they mean [scikit-learn / Pipelines, pitfalls and
# shipping]
# ==========================================================================
# WHAT IT IS
# Three errors cover most beginner problems. NotFittedError: you called
# predict before fit. ValueError: inconsistent numbers of samples: X and y
# have different row counts. ValueError: unknown category: a one-hot encoder
# met a value it never saw — fit it on all expected categories or set
# handle_unknown="ignore". Also "Expected 2D array" (reshape X) and NaN errors
# (impute).
#
# WHERE YOU USE IT
# Read the last line of the traceback first; scikit-learn's messages usually
# name the exact fix.
#
# RUN IT:  python 04_ship-3.py
#

from sklearn.exceptions import NotFittedError
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import OneHotEncoder

try:
    LinearRegression().predict([[1]])
except NotFittedError:
    print("NotFittedError")
try:
    LinearRegression().fit([[1], [2]], [1])
except ValueError:
    print("ValueError: inconsistent lengths")
enc = OneHotEncoder().fit([["a"], ["b"]])
try:
    enc.transform([["c"]])
except ValueError:
    print("unknown category")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# NotFittedError
# ValueError: inconsistent lengths
# unknown category
