# -*- coding: utf-8 -*-
# ==========================================================================
# isin, between, str.contains and query [pandas / Selecting and filtering]
# ==========================================================================
# WHAT IT IS
# Readable helpers replace long chains of |: df["dept"].isin(["IT", "HR"]) is
# membership, df["age"].between(30, 40) is an inclusive range,
# df["name"].str.contains("a", case=False) searches text and df.query("age >
# 30 and dept == 'IT'") writes the whole filter as a string where and is
# allowed.
#
# WHERE YOU USE IT
# isin is the idiom for "customers in this list of ids"; between is the idiom
# for date and value ranges.
#
# RUN IT:  python 05_select-4.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
})
print(df[df["dept"].isin(["HR", "Sales"])]["name"].tolist())
print(df[df["age"].between(30, 40)]["name"].tolist())
print(df[df["name"].str.contains("a", case=False)]["name"].tolist())
print(df.query("age > 30 and dept == 'IT'")["name"].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Asha', 'Dia', 'Eli']
# ['Chen', 'Fay']
# ['Asha', 'Dia', 'Fay']
# ['Ben', 'Chen', 'Fay']
