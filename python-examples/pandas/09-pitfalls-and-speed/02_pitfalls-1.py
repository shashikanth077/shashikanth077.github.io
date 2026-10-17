# -*- coding: utf-8 -*-
# ==========================================================================
# Assignment does not copy [pandas / Pitfalls and speed]
# ==========================================================================
# WHAT IT IS
# df2 = df makes a second name for the same table, not a second table, so
# changing df2 changes df. df.copy() makes an independent table. Use it before
# experiments on a table you still need, and when you take a slice you plan to
# modify.
#
# WHERE YOU USE IT
# A "temporary" column added to an alias silently appears in the table you
# thought was untouched.
#
# RUN IT:  python 02_pitfalls-1.py
#

import pandas as pd

df = pd.DataFrame({"x": [1, 2]})
alias = df
alias["new"] = 0
print("new" in df.columns)
safe = df.copy()
safe["other"] = 1
print("other" in df.columns)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True
# False
