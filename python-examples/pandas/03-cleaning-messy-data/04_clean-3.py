# -*- coding: utf-8 -*-
# ==========================================================================
# Fixing data types [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# Text that should be a number or a date must be converted before you can
# calculate with it. pd.to_numeric(col, errors="coerce") turns text into
# numbers and bad values into NaN instead of crashing; pd.to_datetime(col)
# parses dates; astype converts between clean types. Remove thousands
# separators first with .str.replace(",", "").
#
# WHERE YOU USE IT
# A single "n/a" in a numeric column turns the whole column to text.
# errors="coerce" plus a NaN count shows how many values were bad.
#
# RUN IT:  python 04_clean-3.py
#

import pandas as pd

df = pd.DataFrame({"price": ["1,200", "950", "n/a"], "date": ["2026-01-05", "2026-02-10", "2026-03-15"]})
df["price"] = pd.to_numeric(df["price"].str.replace(",", ""), errors="coerce")
df["date"] = pd.to_datetime(df["date"])
print(df.dtypes)
print(df["price"].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# price           float64
# date     datetime64[ns]
# dtype: object
# [1200.0, 950.0, nan]
