# -*- coding: utf-8 -*-
# ==========================================================================
# Dates: to_datetime and the .dt accessor [pandas / Dates and time series]
# ==========================================================================
# WHAT IT IS
# Dates read from files are text until you convert them: pd.to_datetime(col).
# After that the .dt accessor gives the parts — dt.year, dt.month,
# dt.day_name(), dt.dayofweek — and you can filter with date strings. Setting
# the date column as the index (df.set_index("when")) lets loc["2026-02"]
# select a whole month.
#
# WHERE YOU USE IT
# Weekday, month and "days since signup" are among the most predictive
# features in business data, and all come from .dt.
#
# RUN IT:  python 01_time-0.py
#

import pandas as pd

df = pd.DataFrame({
    "when": pd.to_datetime(["2026-01-05", "2026-02-14", "2026-03-30"]),
    "v": [1, 2, 3],
})
print(df["when"].dt.month.tolist())
print(df["when"].dt.day_name().tolist())
print(df.set_index("when").loc["2026-02"]["v"].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [1, 2, 3]
# ['Monday', 'Saturday', 'Monday']
# [2]
