# -*- coding: utf-8 -*-
# ==========================================================================
# Indexing 2D arrays: rows and columns [numpy / Indexing and slicing]
# ==========================================================================
# WHAT IT IS
# For a table use a[row, col]. A colon means "all": a[:, 0] is every row of
# column 0 (the first column), a[1, :] is all of row 1. This row-and-column
# selection is how you split features from labels.
#
# WHERE YOU USE IT
# X[:, :-1] (all features) and X[:, -1] (the label column) are everywhere in
# ML code.
#
# RUN IT:  python 04_index-3.py
#

import numpy as np

marks = np.array([[70, 85, 90], [80, 75, 95]])
print(marks[1, 2])
print(marks[:, 0])
print(marks[0, :])
print(marks[:, 1:])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 95
# [70 80]
# [70 85 90]
# [[85 90]
#  [75 95]]
