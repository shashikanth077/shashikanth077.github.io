# -*- coding: utf-8 -*-
# ==========================================================================
# ColumnTransformer: different steps for different columns [scikit-learn /
# Preparing data]
# ==========================================================================
# WHAT IT IS
# A real table mixes number columns and text columns that need different
# treatment. ColumnTransformer takes a list of (name, transformer, columns)
# and applies each to its columns, then joins the results side by side: scale
# age, one-hot city. Use it on a pandas DataFrame so you can name columns
# instead of counting positions.
#
# WHERE YOU USE IT
# One ColumnTransformer replaces a pile of manual column surgery and makes the
# preprocessing a single reusable object.
#
# RUN IT:  python 07_prep-6.py
#

import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

df = pd.DataFrame({"age": [20, 30, 40], "city": ["Pune", "Delhi", "Pune"]})
ct = ColumnTransformer([
    ("num", StandardScaler(), ["age"]),
    ("cat", OneHotEncoder(sparse_output=False), ["city"]),
])
out = ct.fit_transform(df)
print(out.shape)
print(out.round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (3, 3)
# [[-1.22, 0.0, 1.0], [0.0, 1.0, 0.0], [1.22, 0.0, 1.0]]
