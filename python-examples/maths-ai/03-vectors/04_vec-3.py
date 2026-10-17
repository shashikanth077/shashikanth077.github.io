# -*- coding: utf-8 -*-
# ==========================================================================
# Element-wise product versus dot product [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# Element-wise multiplication keeps the shape: it multiplies matching entries
# and returns a vector. The dot product goes one step further and adds those
# products into a single number. They are easy to confuse — in NumPy, is
# element-wise and @ is the dot / matrix product.
#
# WHERE YOU USE IT
# Masks and gating (element-wise) versus scores and projections (dot product)
# both appear in the same network.
#
# RUN IT:  python 04_vec-3.py
#

x = [5, 7, 9]
w = [4, 2, 0.5]
elementwise = [a * b for a, b in zip(x, w)]
print(elementwise, sum(elementwise))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [20, 14, 4.5] 38.5
