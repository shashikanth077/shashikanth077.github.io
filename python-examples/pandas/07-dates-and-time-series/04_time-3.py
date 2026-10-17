# -*- coding: utf-8 -*-
# ==========================================================================
# shift, diff and pct_change [pandas / Dates and time series]
# ==========================================================================
# WHAT IT IS
# s.shift(1) moves every value down one row so each row can see the previous
# one. s.diff() is the change from the previous value and s.pct_change() the
# percentage change. The first row has no predecessor, so it is NaN. They are
# the building blocks of lag features and growth rates.
#
# WHERE YOU USE IT
# "Yesterday's value" and "growth since last week" are standard time-series
# features; shift and pct_change create them.
#
# RUN IT:  python 04_time-3.py
#

import pandas as pd

s = pd.Series([100, 110, 99, 120])
print(s.shift(1).tolist())
print(s.diff().tolist())
print(s.pct_change().round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [nan, 100.0, 110.0, 99.0]
# [nan, 10.0, -11.0, 21.0]
# [nan, 0.1, -0.1, 0.212]
