# -*- coding: utf-8 -*-
# ==========================================================================
# Duplicates [pandas / Cleaning messy data]
# ==========================================================================
# WHAT IT IS
# df.duplicated() is True for every row that repeats an earlier one;
# df.drop_duplicates() removes them. Restrict the test to the columns that
# define identity with subset=["id"] and choose which copy to keep with
# keep="first" or "last". Duplicates inflate counts, sums and model accuracy
# (the same row ends up in both train and test).
#
# WHERE YOU USE IT
# Repeated rows come from double-loaded files, joins that multiply rows and
# form re-submissions. Check df.duplicated().sum() on every new dataset.
#
# RUN IT:  python 03_clean-2.py
#

import pandas as pd

df = pd.DataFrame({"id": [1, 2, 2, 3], "name": ["a", "b", "b", "c"], "score": [5, 7, 7, 9]})
print(df.duplicated().tolist())
print(len(df.drop_duplicates()))
print(df.drop_duplicates(subset="id", keep="last").index.tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [False, False, True, False]
# 3
# [0, 2, 3]
