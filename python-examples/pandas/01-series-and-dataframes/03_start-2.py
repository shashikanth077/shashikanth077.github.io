# -*- coding: utf-8 -*-
# ==========================================================================
# Series: one labelled column [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# A Series is a one-dimensional list of values with a label for each — its
# index. s["Ben"] looks a value up by label, s.iloc[1] by position, and
# arithmetic works on the whole Series at once: s 2, s.mean(). When two Series
# are combined, pandas lines them up by label, not by position.
#
# WHERE YOU USE IT
# Every column of a DataFrame is a Series, so everything you learn here
# applies to columns.
#
# RUN IT:  python 03_start-2.py
#

import pandas as pd

s = pd.Series([70, 85, 90], index=["Asha", "Ben", "Chen"])
print(s)
print(s["Ben"], s.iloc[1])
print(s.mean())
print((s + 5).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Asha    70
# Ben     85
# Chen    90
# dtype: int64
# 85 85
# 81.66666666666667
# [75, 90, 95]
