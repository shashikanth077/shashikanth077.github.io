# -*- coding: utf-8 -*-
# ==========================================================================
# Matrices transform space [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# A 2×2 matrix is a machine that moves every point of the plane. Its columns
# say where the unit vectors land: the first column is where (1, 0) goes, the
# second where (0, 1) goes. Scaling, rotating and shearing are all matrices;
# the unit square shows what happens to everything.
#
# WHERE YOU USE IT
# A dense layer reshapes the space your data lives in, stretching and rotating
# it until classes are easy to separate.
#
# RUN IT:  python 04_mat-3.py
#

A = [[2, 0], [0, 1]]
p = [1, 1]
q = [A[0][0] * p[0] + A[0][1] * p[1], A[1][0] * p[0] + A[1][1] * p[1]]
print(q)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [2, 1]
