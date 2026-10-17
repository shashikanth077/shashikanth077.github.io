# -*- coding: utf-8 -*-
# ==========================================================================
# Matrix multiplication and the shape rule [maths-ai / Matrices]
# ==========================================================================
# WHAT IT IS
# Each entry of the product is a dot product of one row of A with one column
# of B. The inner sizes must match: an (m × n) matrix times an (n × p) matrix
# gives an (m × p) matrix. A (2 × 3) times a (3 × 2) is (2 × 2); a (2 × 3)
# times a (2 × 3) is not allowed.
#
# WHERE YOU USE IT
# A whole layer of neurons — and a whole batch of examples — is computed with
# one matrix multiplication; GPUs are built for it.
#
# RUN IT:  python 01_mat-0.py
#

A = [[1, 2, 3], [4, 5, 6]]
B = [[7, 8], [9, 10], [11, 12]]
C = [[sum(a * b for a, b in zip(row, col)) for col in zip(*B)] for row in A]
print(C)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[58, 64], [139, 154]]
