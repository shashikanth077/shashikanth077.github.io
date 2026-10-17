# -*- coding: utf-8 -*-
# ==========================================================================
# Scalars, vectors, matrices and tensors [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# A scalar is one number. A vector is a list of numbers (one dimension). A
# matrix is a table (two dimensions). A tensor is the general case: three or
# more dimensions, like a colour image. The shape — a tuple such as (2, 3) —
# says how many numbers along each dimension.
#
# WHERE YOU USE IT
# Features are vectors, a batch of examples is a matrix, an image batch is a
# 4-D tensor. Most errors in deep learning are shape errors.
#
# RUN IT:  python 01_vec-0.py
#

scalar = 7
vector = [5, 7, 9]
matrix = [[5, 7, 9], [1, 2, 3]]
print(len(vector), (len(matrix), len(matrix[0])))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 3 (2, 3)
