# -*- coding: utf-8 -*-
# ==========================================================================
# groupby: split, apply, combine [pandas / Grouping and summarising]
# ==========================================================================
# WHAT IT IS
# df.groupby("dept")["salary"].mean() answers "what is the average salary in
# each department?". pandas splits the rows into one group per department,
# applies the calculation to each group, then combines the results into a new
# table with one row per group. This is the pandas version of SQL GROUP BY and
# it is the most useful idea in the library.
#
# WHERE YOU USE IT
# Revenue per region, average rating per product, error rate per day, accuracy
# per class — all groupby.
#
# RUN IT:  python 01_group-0.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})

print(df.groupby("dept")["salary"].mean())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# dept
# HR       58000.0
# IT       69000.0
# Sales    49500.0
# Name: salary, dtype: float64
