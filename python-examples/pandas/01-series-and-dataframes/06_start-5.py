# -*- coding: utf-8 -*-
# ==========================================================================
# Reading and writing CSV files [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# pd.read_csv("file.csv") loads a file into a DataFrame; df.to_csv("out.csv",
# index=False) writes one (index=False leaves out the row numbers). Useful
# options: usecols to read some columns, dtype to force types, parse_dates to
# read dates, na_values to mark custom missing markers and nrows to read a
# sample of a huge file. The examples read from text in memory so you can run
# them as they are.
#
# WHERE YOU USE IT
# Real files have odd missing markers ("N/A", "-"), leading-zero ids and dates
# stored as text. Set options on read instead of repairing afterwards.
#
# RUN IT:  python 06_start-5.py
#

import io
import pandas as pd

text = """id,city,score
001,Pune,90
002,Delhi,N/A
003,Pune,75
"""
df = pd.read_csv(io.StringIO(text), dtype={"id": str}, na_values=["N/A"])
print(df)
print(df["score"].mean())
print(df.to_csv(index=False))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#     id   city  score
# 0  001   Pune   90.0
# 1  002  Delhi    NaN
# 2  003   Pune   75.0
# 82.5
# id,city,score
# 001,Pune,90.0
# 002,Delhi,
# 003,Pune,75.0
