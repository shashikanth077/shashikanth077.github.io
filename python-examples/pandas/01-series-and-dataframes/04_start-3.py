# -*- coding: utf-8 -*-
# ==========================================================================
# DataFrame: a table of columns [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# A DataFrame is a table whose columns are Series that share one index. Build
# it from a dictionary — each key becomes a column name — and inspect it with
# df.shape (rows, columns), df.columns and df.index. Think of it as a
# spreadsheet you can program.
#
# WHERE YOU USE IT
# Nearly all data work starts by reading a table into a DataFrame and checking
# its shape.
#
# RUN IT:  python 04_start-3.py
#

import pandas as pd

df = pd.DataFrame({
    "name": ["Asha", "Ben", "Chen"],
    "dept": ["Sales", "IT", "IT"],
    "salary": [48000, 72000, 65000],
})
print(df)
print(df.shape)
print(df.columns.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    name   dept  salary
# 0  Asha  Sales   48000
# 1   Ben     IT   72000
# 2  Chen     IT   65000
# (3, 3)
# ['name', 'dept', 'salary']
