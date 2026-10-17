# -*- coding: utf-8 -*-
# ==========================================================================
# Time series: dates, sorting and resampling [matplotlib / With NumPy and
# pandas]
# ==========================================================================
# WHAT IT IS
# For a time series, make the date column a real datetime (parse_dates or
# pd.to_datetime), sort by date, then plot. fig.autofmt_xdate() tilts the date
# labels so they stop overlapping. To see the trend through daily noise,
# aggregate: .resample("W").sum() gives weekly totals.
#
# WHERE YOU USE IT
# Unsorted or text-typed dates give a scrambled line or one label per row.
# Check df.dtypes before blaming Matplotlib.
#
# RUN IT:  python 05_data-4.py
#

import pandas as pd
import matplotlib.pyplot as plt

df = pd.DataFrame({
    "date": pd.date_range("2026-01-01", periods=10),
    "revenue": [120, 135, 128, 150, 160, 155, 170, 165, 180, 190],
})
fig, ax = plt.subplots()
ax.plot(df["date"], df["revenue"], marker="o")
fig.autofmt_xdate()
plt.show()
print(df.set_index("date")["revenue"].resample("W").sum())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# date
# 2026-01-04     533
# 2026-01-11    1020
# Freq: W-SUN, Name: revenue, dtype: int64
