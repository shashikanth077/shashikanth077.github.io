# -*- coding: utf-8 -*-
# ==========================================================================
# Why pandas: tables in Python [pandas / Series and DataFrames]
# ==========================================================================
# WHAT IT IS
# Most real data is a table: rows of records, columns with names and different
# types. A NumPy array has one type and only positions; a Python list of dicts
# has no tools. pandas gives you the DataFrame — a labelled table — with
# one-line methods to load, filter, clean, group and join it. It is the tool
# you reach for first, before any machine learning.
#
# WHERE YOU USE IT
# Before a model sees data it has been loaded, cleaned, joined and summarised
# with pandas. Most of a data scientist's time is spent here.
#
# RUN IT:  python 01_start-0.py
#

import pandas as pd

sales = pd.DataFrame({
    "city": ["Pune", "Delhi", "Pune"],
    "revenue": [120, 90, 80],
})
print(sales)
print(sales.groupby("city")["revenue"].sum())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#     city  revenue
# 0   Pune      120
# 1  Delhi       90
# 2   Pune       80
# city
# Delhi     90
# Pune     200
# Name: revenue, dtype: int64
