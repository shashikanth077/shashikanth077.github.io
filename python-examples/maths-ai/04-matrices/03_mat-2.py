# -*- coding: utf-8 -*-
# ==========================================================================
# Transpose [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# The transpose Aᵀ flips a matrix over its diagonal: rows become columns. A (2
# × 3) matrix becomes (3 × 2). You use it to line shapes up for
# multiplication, as in XᵀX or WᵀW.
#
# WHERE YOU USE IT
# Gradients with respect to weights are written with transposes: ∂L/∂W = Xᵀ ·
# (∂L/∂Z).
#
# RUN IT:  python 03_mat-2.py
#

A = [[1, 2, 3], [4, 5, 6]]
At = [list(col) for col in zip(*A)]
print(At)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1, 4], [2, 5], [3, 6]]
