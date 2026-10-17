# -*- coding: utf-8 -*-
# ==========================================================================
# Determinant, inverse and rank [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# For a 2×2 matrix the determinant ad − bc is the signed area of the
# parallelogram its columns span — how much it scales area. If the determinant
# is 0 the columns lie on one line, the matrix squashes the plane flat, loses
# information, and has no inverse (its rank is less than 2).
#
# WHERE YOU USE IT
# Rank tells you how many independent features you really have; a
# rank-deficient feature matrix breaks linear regression.
#
# RUN IT:  python 06_mat-5.py
#

a, b, c, d = 2, 1, 1, 3
det = a * d - b * c
inv = [[d / det, -b / det], [-c / det, a / det]]
print(det)
print(inv)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5
# [[0.6, -0.2], [-0.2, 0.4]]
