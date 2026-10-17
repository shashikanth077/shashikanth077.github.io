# -*- coding: utf-8 -*-
# ==========================================================================
# Selecting columns [pandas / Selecting and filtering]
# ==========================================================================
# WHAT IT IS
# df["salary"] returns one column as a Series. df[["name", "salary"]] — a list
# inside the brackets — returns a smaller DataFrame. Prefer brackets to the
# dot form (df.salary), which fails for names with spaces or names that clash
# with methods such as count.
#
# WHERE YOU USE IT
# Selecting exactly the columns a model needs is the first step of feature
# building.
#
# RUN IT:  python 01_select-0.py
#

import pandas as pd

df = pd.DataFrame({"name": ["Asha", "Ben"], "dept": ["Sales", "IT"], "salary": [48000, 72000]})
print(type(df["salary"]).__name__)
print(type(df[["salary"]]).__name__)
print(df[["name", "salary"]])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# Series
# DataFrame
#    name  salary
# 0  Asha   48000
# 1   Ben   72000
