# -*- coding: utf-8 -*-
# ==========================================================================
# Column types (dtypes) [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# Each column has one dtype: int64 and float64 for numbers, bool, datetime64
# for dates, category for repeated labels and object for text (newer pandas
# may show str). Wrong dtypes cause most surprises: numbers read as text do
# not add up. Check df.dtypes early and convert with astype.
#
# WHERE YOU USE IT
# A price column that loaded as text will sort "100" before "9" and fail on
# arithmetic. Always look at dtypes right after loading.
#
# RUN IT:  python 05_start-4.py
#

import pandas as pd

df = pd.DataFrame({"id": [1, 2], "price": [9.5, 12.0], "name": ["a", "b"], "ok": [True, False]})
print(df.dtypes)
df["id"] = df["id"].astype("float64")
print(df["id"].dtype)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# id         int64
# price    float64
# name      object
# ok          bool
# dtype: object
# float64
