# -*- coding: utf-8 -*-
# ==========================================================================
# Combining conditions: & | ~ [pandas / Selecting and filtering]
# ==========================================================================
# WHAT IT IS
# To combine conditions use & (and), | (or) and ~ (not) — and wrap each
# comparison in parentheses: df[(df["dept"] == "IT") & (df["age"] > 33)]. The
# Python words and / or fail with "truth value of a Series is ambiguous"
# because a Series holds many True/False values, not one.
#
# WHERE YOU USE IT
# The missing-parentheses error is the most common pandas filtering bug. Build
# complex filters from named masks to keep them readable.
#
# RUN IT:  python 04_select-3.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "dept": ["Sales", "IT", "IT", "Sales", "HR", "IT"],
    "age": [29, 41, 35, 28, 50, 33],
})
it = df["dept"] == "IT"
older = df["age"] > 33
print(df[it & older]["name"].tolist())
print(df[it | older]["name"].tolist())
print(df[~it]["name"].tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Ben', 'Chen']
# ['Ben', 'Chen', 'Eli', 'Fay']
# ['Asha', 'Dia', 'Eli']
