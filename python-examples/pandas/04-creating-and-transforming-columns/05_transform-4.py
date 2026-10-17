# -*- coding: utf-8 -*-
# ==========================================================================
# assign and method chaining [pandas / Creating and transforming columns]
# ==========================================================================
# WHAT IT IS
# Because most methods return a DataFrame, you can chain them into one
# readable pipeline: df.assign(bonus=…).query("salary >
# 50000").sort_values("bonus").reset_index(drop=True). assign adds columns
# without touching the original, and wrapping the chain in parentheses lets
# you put each step on its own line. Read it top to bottom like a recipe.
#
# WHERE YOU USE IT
# Chains keep intermediate junk variables out of your notebook and make a
# transformation easy to review and reuse.
#
# RUN IT:  python 05_transform-4.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
result = (
    df.assign(bonus=df["salary"] * 0.1)
      .query("salary > 50000")
      .sort_values("bonus", ascending=False)
      .reset_index(drop=True)
)
print(result)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    name  salary   bonus
# 0   Ben   72000  7200.0
# 1   Fay   70000  7000.0
# 2  Chen   65000  6500.0
# 3   Eli   58000  5800.0
# 4   Dia   51000  5100.0
