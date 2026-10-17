# -*- coding: utf-8 -*-
# ==========================================================================
# Index alignment surprises [pandas / Pitfalls and speed]
# ==========================================================================
# WHAT IT IS
# Arithmetic between Series or DataFrames lines up the index labels, not the
# positions. Labels that exist in only one operand give NaN: adding a Series
# indexed a, b, c to one indexed b, c, d produces NaN for a and d. This is
# powerful for combining tables, and confusing when the indexes are different
# by accident — for example after a filter or a sort.
#
# WHERE YOU USE IT
# If a column arithmetic gives unexpected NaNs, compare the indexes first. Use
# .values or reset_index(drop=True) only when you truly want positional
# matching.
#
# RUN IT:  python 04_pitfalls-3.py
#

import pandas as pd

s1 = pd.Series([1, 2, 3], index=["a", "b", "c"])
s2 = pd.Series([10, 20, 30], index=["b", "c", "d"])
print(s1 + s2)
print(s1.add(s2, fill_value=0).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# a     NaN
# b    12.0
# c    23.0
# d     NaN
# dtype: float64
# [1.0, 12.0, 23.0, 30.0]
