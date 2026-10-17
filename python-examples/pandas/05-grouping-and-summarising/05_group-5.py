# -*- coding: utf-8 -*-
# ==========================================================================
# pivot_table and crosstab [pandas / Grouping and summarising]
# ==========================================================================
# WHAT IT IS
# A pivot table turns one column's values into column headings:
# df.pivot_table(index="region", columns="product", values="units",
# aggfunc="sum") gives a compact grid of totals. pd.crosstab(df["region"],
# df["product"]) is the same idea for counting rows. They are group-bys laid
# out as a table, ready to read — or to draw as a heatmap.
#
# WHERE YOU USE IT
# Reports and dashboards are mostly pivot tables: sales by region and month,
# errors by service and day.
#
# RUN IT:  python 05_group-5.py
#

import pandas as pd

df = pd.DataFrame({
    "region": ["N", "N", "S", "S", "N", "S"],
    "product": ["A", "B", "A", "A", "A", "B"],
    "units": [10, 5, 8, 12, 6, 4],
})
print(df.pivot_table(index="region", columns="product", values="units", aggfunc="sum"))
print(pd.crosstab(df["region"], df["product"]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# product   A  B
# region
# N        16  5
# S        20  4
# product  A  B
# region
# N        2  1
# S        2  1
