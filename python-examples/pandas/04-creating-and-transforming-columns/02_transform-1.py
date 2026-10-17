# -*- coding: utf-8 -*-
# ==========================================================================
# map, apply and replace [pandas / Creating and transforming columns]
# ==========================================================================
# WHAT IT IS
# When arithmetic is not enough: Series.map(dict) translates values through a
# dictionary, Series.replace swaps listed values, and Series.apply(function)
# runs your own Python function on each value. apply is flexible but slow on
# large data — prefer a vectorised expression or np.where when one exists.
#
# WHERE YOU USE IT
# Mapping codes to labels (1 → "male") and bucketing values are the typical
# uses; reach for apply last.
#
# RUN IT:  python 02_transform-1.py
#

import pandas as pd

df = pd.DataFrame({"dept": ["IT", "HR", "IT"], "age": [41, 50, 28]})
df["code"] = df["dept"].map({"IT": "T", "HR": "H"})
df["band"] = df["age"].apply(lambda a: "senior" if a >= 40 else "junior")
print(df)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#   dept  age code    band
# 0   IT   41    T  senior
# 1   HR   50    H  senior
# 2   IT   28    T  junior
