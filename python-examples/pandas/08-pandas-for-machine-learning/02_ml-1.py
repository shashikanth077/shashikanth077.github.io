# -*- coding: utf-8 -*-
# ==========================================================================
# One-hot encoding with get_dummies [pandas / Pandas for machine learning]
# ==========================================================================
# WHAT IT IS
# Models need numbers, not text. pd.get_dummies(df, columns=["city"],
# dtype=int) replaces a category column by one 0/1 column per value
# ("one-hot"). Pune becomes city_Pune = 1, city_Delhi = 0. For categories with
# many values this makes many columns — then consider grouping rare values
# first. Apply the same columns to training and test data.
#
# WHERE YOU USE IT
# A model seeing "Pune" as 1 and "Delhi" as 2 would think Delhi is twice Pune.
# One-hot avoids inventing an order.
#
# RUN IT:  python 02_ml-1.py
#

import pandas as pd

df = pd.DataFrame({"city": ["Pune", "Delhi", "Pune"], "age": [30, 40, 50]})
enc = pd.get_dummies(df, columns=["city"], dtype=int)
print(enc)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    age  city_Delhi  city_Pune
# 0   30           0          1
# 1   40           1          0
# 2   50           0          1
