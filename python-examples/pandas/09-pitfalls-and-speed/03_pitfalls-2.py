# -*- coding: utf-8 -*-
# ==========================================================================
# Why loops over rows are slow [pandas / Pitfalls and speed]
# ==========================================================================
# WHAT IT IS
# df.iterrows() and apply(axis=1) call Python once per row, which is hundreds
# of times slower than a whole-column expression that runs in compiled code.
# If you find yourself looping to compute a value, look for a vectorised form:
# arithmetic, np.where, map, groupby. Reserve loops for genuinely row-by-row
# logic such as calling an API.
#
# WHERE YOU USE IT
# A loop over a million rows can take minutes; the same calculation as one
# expression takes milliseconds.
#
# RUN IT:  python 03_pitfalls-2.py
#

import pandas as pd

df = pd.DataFrame({"price": [100, 250, 400], "qty": [2, 1, 3]})
total_loop = 0
for _, row in df.iterrows():
    total_loop += row["price"] * row["qty"]
total_vec = (df["price"] * df["qty"]).sum()
print(total_loop, total_vec)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1650 1650
