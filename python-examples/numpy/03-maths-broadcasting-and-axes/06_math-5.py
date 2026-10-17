# -*- coding: utf-8 -*-
# ==========================================================================
# Aggregations and the axis argument [numpy / Maths, broadcasting and axes]
# ==========================================================================
# WHAT IT IS
# sum, mean, min, max and std collapse an array. With no axis they use every
# element. For a table, axis=0 works DOWN the rows (one answer per column) and
# axis=1 works ACROSS the columns (one answer per row). A handy memory trick:
# the axis you name is the one that disappears.
#
# WHERE YOU USE IT
# Per-feature means and standard deviations (axis=0) and per-example scores
# (axis=1) are daily operations in data preparation.
#
# RUN IT:  python 06_math-5.py
#

import numpy as np

marks = np.array([[70, 80, 90],
                  [60, 75, 85],
                  [95, 88, 92]])
print(marks.mean())
print(marks.mean(axis=0))
print(marks.mean(axis=1))
print(marks.sum(), marks.min(), marks.max())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 81.66666666666667
# [75. 81. 89.]
# [80.         73.33333333 91.66666667]
# 735 60 95
