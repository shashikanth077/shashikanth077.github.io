# -*- coding: utf-8 -*-
# ==========================================================================
# merge: joining on a key [pandas / Combining tables]
# ==========================================================================
# WHAT IT IS
# customers.merge(orders, on="id", how="left") is a database join: rows from
# the two tables are paired when their key columns match. how="left" keeps
# every customer, even those with no order (their order columns are NaN). Step
# through it to see which rows match and what happens to unmatched ones.
#
# WHERE YOU USE IT
# Features almost always live in several tables (users, orders, products).
# Joining them is how you build the training table.
#
# RUN IT:  python 02_combine-1.py
#

import pandas as pd

customers = pd.DataFrame({"id": [1, 2, 3], "name": ["Ana", "Bo", "Cy"]})
orders = pd.DataFrame({"id": [2, 3, 4], "amount": [50, 30, 20]})
print(customers.merge(orders, on="id", how="left"))
print(customers.merge(orders, on="id", how="inner").shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    id name  amount
# 0   1  Ana     NaN
# 1   2   Bo    50.0
# 2   3   Cy    30.0
# (2, 3)
