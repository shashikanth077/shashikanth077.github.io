# -*- coding: utf-8 -*-
# ==========================================================================
# resample: totals per week or month [pandas / Dates and time series]
# ==========================================================================
# WHAT IT IS
# With a date index, s.resample("MS").sum() groups the values into calendar
# periods and summarises each — here "MS" means month start, "W" weeks and "D"
# days. It is groupby for time. Choose sum for amounts (sales), mean for
# levels (temperature) and last for balances. Drag to add months and watch the
# monthly totals appear.
#
# WHERE YOU USE IT
# Daily data is noisy; weekly or monthly totals show the trend. Forecasting
# problems begin with a resampled series.
#
# RUN IT:  python 02_time-1.py
#

import pandas as pd

s = pd.Series(
    [10, 20, 30, 40, 50, 60],
    index=pd.to_datetime(["2026-01-05", "2026-01-20", "2026-02-03", "2026-02-18", "2026-03-02", "2026-03-25"]),
)
print(s.resample("MS").sum())
print(s.resample("MS").mean().tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2026-01-01     30
# 2026-02-01     70
# 2026-03-01    110
# Freq: MS, dtype: int64
# [15.0, 35.0, 55.0]
