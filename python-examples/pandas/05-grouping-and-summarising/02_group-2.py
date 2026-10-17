# -*- coding: utf-8 -*-
# ==========================================================================
# Several summaries at once with agg [pandas / Grouping and summarising]
# ==========================================================================
# WHAT IT IS
# .agg([...]) computes several statistics in one call: g.agg(["count", "mean",
# "max"]). For readable column names use named aggregation:
# df.groupby("dept").agg(avg_age=("age", "mean"), top_pay=("salary", "max")) —
# each keyword is a new column, each tuple is (column, function).
#
# WHERE YOU USE IT
# A single groupby with a named agg builds a whole summary table; no loops, no
# merges.
#
# RUN IT:  python 02_group-2.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})

g = df.groupby("dept")["salary"]
print(g.agg(["count", "mean", "max"]))
print(df.groupby("dept").agg(avg_age=("age", "mean"), top_pay=("salary", "max")))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#        count     mean    max
# dept
# HR         1  58000.0  58000
# IT         3  69000.0  72000
# Sales      2  49500.0  51000
#          avg_age  top_pay
# dept
# HR     50.000000    58000
# IT     36.333333    72000
# Sales  28.500000    51000
