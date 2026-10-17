# -*- coding: utf-8 -*-
# ==========================================================================
# Renaming, dropping and reordering columns [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# df.rename(columns={"old": "new"}) changes names, df.drop(columns=["tmp"])
# removes columns and df[["b", "a"]] reorders them. Most pandas methods return
# a new DataFrame, so assign the result back (df = df.drop(…)). Clean column
# names early — lower case, no spaces — and you can use them without typos.
#
# WHERE YOU USE IT
# Names with spaces or odd capitals ("Total Sales ") cause key errors.
# Normalise with df.columns = [c.strip().lower() for c in df.columns].
#
# RUN IT:  python 06_clean-5.py
#

import pandas as pd

df = pd.DataFrame({"Name ": ["a"], "Age": [30], "tmp": [0]})
df = df.rename(columns={"Name ": "name", "Age": "age"}).drop(columns="tmp")
print(df.columns.tolist())
print(df[["age", "name"]].columns.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# ['name', 'age']
# ['age', 'name']
