# -*- coding: utf-8 -*-
# ==========================================================================
# Dropping, filling and interpolating [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# Three standard choices. dropna() removes rows with gaps (safe only when
# few). fillna(value) puts in a constant, the mean or median. ffill() repeats
# the previous value and interpolate() draws a straight line between
# neighbours — good for ordered data. Choose with the data's meaning in mind
# and note that each choice changes the numbers. Drag the strategy (0 drop, 1
# mean, 2 forward fill, 3 interpolate).
#
# WHERE YOU USE IT
# Filling with the mean shrinks the spread; forward fill suits sensor
# readings; dropping can bias a dataset if the gaps are not random.
#
# RUN IT:  python 02_clean-1.py
#

import numpy as np
import pandas as pd

s = pd.Series([10, 14, np.nan, 30, 40])
print(s.dropna().tolist())
print(s.fillna(s.mean()).tolist())
print(s.ffill().tolist())
print(s.interpolate().tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [10.0, 14.0, 30.0, 40.0]
# [10.0, 14.0, 23.5, 30.0, 40.0]
# [10.0, 14.0, 14.0, 30.0, 40.0]
# [10.0, 14.0, 22.0, 30.0, 40.0]
