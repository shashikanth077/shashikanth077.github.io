# -*- coding: utf-8 -*-
# ==========================================================================
# Finding missing values [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# Missing data shows up as NaN (and None in text columns). df.isna() marks
# every missing cell, df.isna().sum() counts them per column and
# df.isna().mean() gives the share missing. Note that mean(), sum() and most
# statistics skip NaN by default, so a column can look fine while a quarter of
# it is empty.
#
# WHERE YOU USE IT
# Decide per column what a gap means: not collected, not applicable, or an
# error. The right fix depends on the answer.
#
# RUN IT:  python 01_clean-0.py
#

import numpy as np
import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia"],
    "age": [29, np.nan, 35, 28],
    "city": ["Pune", None, "Delhi", "Pune"],
})
print(df.isna().sum())
print(df.isna().mean().round(2).tolist())
print(df["age"].mean())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# name    0
# age     1
# city    1
# dtype: int64
# [0.0, 0.25, 0.25]
# 30.666666666666668
