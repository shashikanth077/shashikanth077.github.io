# -*- coding: utf-8 -*-
# ==========================================================================
# concat: stacking tables [pandas / Combining tables]
# ==========================================================================
# WHAT IT IS
# pd.concat([a, b]) stacks DataFrames on top of each other (rows, the default
# axis=0) and matches columns by name; axis=1 places them side by side and
# matches rows by index. Add ignore_index=True to renumber the rows. Use it to
# combine files with the same layout, such as one CSV per month.
#
# WHERE YOU USE IT
# Reading twelve monthly files and concatenating them is the usual start of a
# yearly analysis.
#
# RUN IT:  python 01_combine-0.py
#

import pandas as pd

a = pd.DataFrame({"id": [1, 2], "x": [10, 20]})
b = pd.DataFrame({"id": [3], "x": [30]})
c = pd.DataFrame({"y": [5, 6]})
print(pd.concat([a, b], ignore_index=True))
print(pd.concat([a, c], axis=1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
#    id   x
# 0   1  10
# 1   2  20
# 2   3  30
#    id   x  y
# 0   1  10  5
# 1   2  20  6
