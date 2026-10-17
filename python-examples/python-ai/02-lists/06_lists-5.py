# -*- coding: utf-8 -*-
# ==========================================================================
# Nested lists as tables and matrices [python-ai / Lists]
# ==========================================================================
# WHAT IT IS
# A list of lists models a table or matrix: grid[row][col]. grid[i] is row i;
# a column needs a comprehension, [row[j] for row in grid]. NumPy later makes
# this fast, but the idea of rows, columns and shape is identical.
#
# WHERE YOU USE IT
# A dataset of 3 samples with 2 features each is a 3×2 list of lists — exactly
# what scikit-learn calls X.
#
# RUN IT:  python 06_lists-5.py
#

X = [[5.1, 3.5],
     [4.9, 3.0],
     [6.2, 3.4]]
print(X[1])
print(X[1][0])
print([row[1] for row in X])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [4.9, 3.0]
# 4.9
# [3.5, 3.0, 3.4]
