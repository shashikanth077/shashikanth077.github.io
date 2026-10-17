# -*- coding: utf-8 -*-
# ==========================================================================
# Sorting and top-n [pandas / Selecting and filtering]
# ==========================================================================
# WHAT IT IS
# df.sort_values("salary", ascending=False) orders rows; sort by several
# columns with a list. df.nlargest(2, "salary") and df.nsmallest take the top
# or bottom rows directly. Sorting returns a new DataFrame, and the old index
# labels travel with the rows — so loc still finds the same person while
# iloc[0] now means the new first row.
#
# WHERE YOU USE IT
# Leaderboards, top customers and worst-performing products are sort_values or
# nlargest.
#
# RUN IT:  python 06_select-5.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen", "Dia", "Eli", "Fay"],
    "salary": [48000, 72000, 65000, 51000, 58000, 70000],
})
top = df.sort_values("salary", ascending=False)
print(top["name"].tolist())
print(df.nlargest(2, "salary")["name"].tolist())
print(top.iloc[0]["name"], top.loc[0]["name"])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['Ben', 'Fay', 'Chen', 'Eli', 'Dia', 'Asha']
# ['Ben', 'Fay']
# Ben Asha
