# -*- coding: utf-8 -*-
# ==========================================================================
# Rolling averages [pandas / Dates and time series]
# ==========================================================================
# WHAT IT IS
# s.rolling(3).mean() replaces each value with the average of itself and the
# two before it — a moving window. A bigger window gives a smoother line but
# reacts later, and the first window − 1 values are NaN because there is not
# enough history. Drag the window (1 = raw data, 3, 5).
#
# WHERE YOU USE IT
# Moving averages smooth noisy metrics (daily users, sensor readings) so a
# trend or a change is visible.
#
# RUN IT:  python 03_time-2.py
#

import pandas as pd

s = pd.Series([10, 14, 9, 20, 15, 24, 18, 26])
print(s.rolling(3).mean().round(2).tolist())
print(s.rolling(5).mean().round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [nan, nan, 11.0, 14.33, 14.67, 19.67, 19.0, 22.67]
# [nan, nan, nan, nan, 13.6, 16.4, 17.2, 20.6]
