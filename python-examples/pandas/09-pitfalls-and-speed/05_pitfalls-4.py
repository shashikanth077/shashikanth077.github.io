# -*- coding: utf-8 -*-
# ==========================================================================
# Memory and the category dtype [pandas / Pitfalls and speed]
# ==========================================================================
# WHAT IT IS
# A text column repeats the same few words as separate Python strings.
# astype("category") stores each distinct value once and replaces the column
# with small integer codes — less memory and faster groupby. It suits columns
# with few distinct values (city, department, label) and not ones with unique
# values like names or ids. Check nunique() first.
#
# WHERE YOU USE IT
# A 10-million-row table with a country column can shrink by gigabytes after
# astype("category"). For big files also read only the columns you need.
#
# RUN IT:  python 05_pitfalls-4.py
#

import pandas as pd

s = pd.Series(["Pune", "Delhi", "Pune", "Pune", "Delhi"])
cat = s.astype("category")
print(s.nunique(), cat.dtype)
print(cat.cat.categories.tolist())
print(cat.cat.codes.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 2 category
# ['Delhi', 'Pune']
# [1, 0, 1, 1, 0]
