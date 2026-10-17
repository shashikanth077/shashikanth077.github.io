# -*- coding: utf-8 -*-
# ==========================================================================
# Missing values in a modelling pipeline [pandas / Pandas for machine
# learning]
# ==========================================================================
# WHAT IT IS
# Fill gaps with a statistic computed from the training data (the median is
# robust to outliers) and apply the same number to the test data. Before
# filling, add an indicator column — df["age"].isna().astype(int) — because
# "was missing" can itself be a useful signal. Never compute the fill value on
# the whole dataset.
#
# WHERE YOU USE IT
# Many models cannot accept NaN at all. A principled fill plus an indicator
# keeps both the number and the fact that it was missing.
#
# RUN IT:  python 05_ml-4.py
#

import numpy as np
import pandas as pd

train = pd.DataFrame({"age": [20, 30, np.nan, 40]})
test = pd.DataFrame({"age": [np.nan, 50]})
med = train["age"].median()
for d in (train, test):
    d["age_missing"] = d["age"].isna().astype(int)
    d["age"] = d["age"].fillna(med)
print(med)
print(test)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 30.0
#     age  age_missing
# 0  30.0            1
# 1  50.0            0
