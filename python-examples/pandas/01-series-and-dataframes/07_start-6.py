# -*- coding: utf-8 -*-
# ==========================================================================
# First look at a dataset [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# Before any analysis, ask the same five questions: how big (df.shape), what
# does it look like (df.head()), what types (df.dtypes or df.info()), what are
# the numbers like (df.describe()) and what is missing (df.isna().sum()). Five
# lines tell you whether the data can be trusted.
#
# WHERE YOU USE IT
# Skipping this step is how a column of ages containing 999 or a half-empty
# column ends up inside a model.
#
# RUN IT:  python 07_start-6.py
#

import io
import pandas as pd

csv = io.StringIO("""name,dept,age,salary
Asha,Sales,29,48000
Ben,IT,41,72000
Chen,IT,35,65000
Dia,Sales,28,51000
Eli,HR,50,58000
Fay,IT,33,70000
""")
df = pd.read_csv(csv)
print(df.shape)
print(df.head(3))
print(df.isna().sum().sum())
print(df.describe().loc[["count", "mean", "max"]])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (6, 4)
#    name   dept  age  salary
# 0  Asha  Sales   29   48000
# 1   Ben     IT   41   72000
# 2  Chen     IT   35   65000
# 0
#         age        salary
# count   6.0      6.000000
# mean   36.0  60666.666667
# max    50.0  72000.000000
