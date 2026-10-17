# -*- coding: utf-8 -*-
# ==========================================================================
# Pandas to chart: from CSV to plot [matplotlib / With NumPy and pandas]
# ==========================================================================
# WHAT IT IS
# Pandas loads and reshapes tables; Matplotlib draws them. The standard path
# is pd.read_csv → clean or aggregate with groupby → pass the columns to
# ax.plot. Every column is a Series that Matplotlib accepts directly. The
# example builds its CSV in memory so you can run it as is; with a real file,
# replace io.StringIO(…) by the file name.
#
# WHERE YOU USE IT
# Exploratory data analysis is mostly this loop: load, group, plot, look,
# repeat.
#
# RUN IT:  python 04_data-3.py
#

import io
import pandas as pd
import matplotlib.pyplot as plt

csv = io.StringIO("""date,revenue
2026-01-01,120
2026-01-01,80
2026-01-02,150
2026-01-03,90
2026-01-03,110""")
df = pd.read_csv(csv, parse_dates=["date"])
daily = df.groupby("date", as_index=False)["revenue"].sum()

fig, ax = plt.subplots()
ax.plot(daily["date"], daily["revenue"], marker="o")
ax.set(title="Daily revenue", ylabel="Revenue")
fig.autofmt_xdate()
plt.show()
print(daily)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#         date  revenue
# 0 2026-01-01      200
# 1 2026-01-02      150
# 2 2026-01-03      200
