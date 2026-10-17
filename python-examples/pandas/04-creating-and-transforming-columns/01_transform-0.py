# -*- coding: utf-8 -*-
# ==========================================================================
# New columns from old ones [pandas / Creating and transforming columns]
# ==========================================================================
# WHAT IT IS
# Create a column by assigning to a new name: df["bonus"] = df["salary"] 0.10.
# The right side is calculated for every row at once — no loop. Columns can
# combine each other (df["salary"] + df["bonus"]) and comparisons give
# True/False columns (df["salary"] > 60000).
#
# WHERE YOU USE IT
# Feature engineering — ratios, differences, flags, lengths — is mostly this
# one-line pattern.
#
# RUN IT:  python 01_transform-0.py
#

import pandas as pd

df = pd.DataFrame({"name": ["Asha", "Ben"], "salary": [48000, 72000]})
df["bonus"] = df["salary"] * 0.10
df["total"] = df["salary"] + df["bonus"]
df["high_pay"] = df["salary"] > 60000
print(df)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    name  salary   bonus    total  high_pay
# 0  Asha   48000  4800.0  52800.0     False
# 1   Ben   72000  7200.0  79200.0      True
