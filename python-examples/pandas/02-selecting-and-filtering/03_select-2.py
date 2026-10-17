# -*- coding: utf-8 -*-
# ==========================================================================
# Boolean filtering: keep the rows that match [pandas / Selecting and
# filtering]
# ==========================================================================
# WHAT IT IS
# A comparison on a column such as df["salary"] > 60000 gives a True/False
# value for every row — a mask. Putting it inside brackets, df[mask], keeps
# only the True rows. It is the pandas version of "WHERE" in SQL. Drag the
# threshold: each dot is one employee's salary, and only dots right of the
# line survive.
#
# WHERE YOU USE IT
# Filtering rows (active customers, orders above a value, valid readings) is
# part of nearly every analysis.
#
# RUN IT:  python 03_select-2.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
mask = df["salary"] > 60000
print(mask.tolist())
print(df[mask])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False, True, True, False, False, True]
#    name  salary
# 1   Ben   72000
# 2  Chen   65000
# 5   Fay   70000
