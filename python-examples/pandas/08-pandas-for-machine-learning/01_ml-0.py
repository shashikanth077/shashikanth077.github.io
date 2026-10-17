# -*- coding: utf-8 -*-
# ==========================================================================
# Features X and target y [pandas / Pandas for machine learning]
# ==========================================================================
# WHAT IT IS
# Supervised learning needs two things: the input table X (the features) and
# the answer column y (the target). With pandas that is two lines: X =
# df.drop(columns="bought") and y = df["bought"]. Check the shapes — X is a
# DataFrame with rows and columns, y is a Series with one value per row — and
# that the target is not hiding inside the features.
#
# WHERE YOU USE IT
# Leaving the target (or something computed from it) inside X makes a model
# look perfect in testing and useless in real life. This is called leakage.
#
# RUN IT:  python 01_ml-0.py
#

import pandas as pd

df = pd.DataFrame({
    "age": [22, 35, 47, 61],
    "income": [30, 52, 71, 64],
    "bought": [0, 1, 1, 0],
})
X = df.drop(columns="bought")
y = df["bought"]
print(X.shape, y.shape)
print(X.columns.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (4, 2) (4,)
# ['age', 'income']
