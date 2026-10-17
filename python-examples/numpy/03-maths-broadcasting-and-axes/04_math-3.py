# -*- coding: utf-8 -*-
# ==========================================================================
# Broadcasting: stretching to fit [numpy / Maths, broadcasting and axes]
# ==========================================================================
# WHAT IT IS
# Broadcasting lets arrays of different shapes work together without you
# copying data: NumPy virtually stretches the smaller one. Adding a bonus of
# [5, 5, 5] to every row of a table, or subtracting each column's mean from
# the whole table, needs no loop and no tiling.
#
# WHERE YOU USE IT
# Centering and scaling features, adding biases to a whole batch, and
# computing pairwise distances all rely on broadcasting.
#
# RUN IT:  python 04_math-3.py
#

import numpy as np

marks = np.array([[70, 80, 90],
                  [60, 75, 85]])
bonus = np.array([5, 5, 5])
print(marks + bonus)
means = marks.mean(axis=0)
print(means)
print(marks - means)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[75 85 95]
#  [65 80 90]]
# [65.  77.5 87.5]
# [[ 5.   2.5  2.5]
#  [-5.  -2.5 -2.5]]
