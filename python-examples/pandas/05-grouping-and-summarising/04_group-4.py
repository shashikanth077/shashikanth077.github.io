# -*- coding: utf-8 -*-
# ==========================================================================
# transform: a group statistic on every row [pandas / Grouping and
# summarising]
# ==========================================================================
# WHAT IT IS
# agg shrinks each group to one row. transform instead returns a result with
# the same length as the original, repeating the group statistic on every row:
# df.groupby("dept")["salary"].transform("mean"). That lets you compare each
# row to its own group — for example salary minus the department average — or
# fill missing values with the group mean.
#
# WHERE YOU USE IT
# Per-group normalisation and per-group imputation (fill each missing age with
# its class average) are transform use cases.
#
# RUN IT:  python 04_group-4.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})

df["dept_avg"] = df.groupby("dept")["salary"].transform("mean")
df["vs_dept"] = df["salary"] - df["dept_avg"]
print(df[["name", "dept_avg", "vs_dept"]])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    name  dept_avg  vs_dept
# 0  Asha   49500.0  -1500.0
# 1   Ben   69000.0   3000.0
# 2  Chen   69000.0  -4000.0
# 3   Dia   49500.0   1500.0
# 4   Eli   58000.0      0.0
# 5   Fay   69000.0   1000.0
