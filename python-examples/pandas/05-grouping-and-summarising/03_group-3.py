# -*- coding: utf-8 -*-
# ==========================================================================
# Several keys, sizes and counts [pandas / Grouping and summarising]
# ==========================================================================
# WHAT IT IS
# Group by more than one column with a list: df.groupby(["region",
# "product"])["units"].sum() gives one row for each combination. size() counts
# rows per group (including missing values) while count() counts non-missing
# values per column. reset_index() turns the group labels back into ordinary
# columns.
#
# WHERE YOU USE IT
# Most business questions have two keys: product by month, class by fold, user
# by day.
#
# RUN IT:  python 03_group-3.py
#

import pandas as pd

df = pd.DataFrame({
    "region": ["N", "N", "S", "S", "N", "S"],
    "product": ["A", "B", "A", "A", "A", "B"],
    "units": [10, 5, 8, 12, 6, 4],
})
print(df.groupby(["region", "product"])["units"].sum())
print(df.groupby("region").size())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# region  product
# N       A          16
#         B           5
# S       A          20
#         B           4
# Name: units, dtype: int64
# region
# N    3
# S    3
# dtype: int64
