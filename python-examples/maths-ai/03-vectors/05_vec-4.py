# -*- coding: utf-8 -*-
# ==========================================================================
# Vector length: the L1 and L2 norms [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# A norm measures a vector's size. L2 (Euclidean) is the straight-line length,
# √(x² + y²) — Pythagoras. L1 adds the absolute values, |x| + |y| — a taxi-cab
# walk along the grid. Dividing a vector by its L2 length gives a unit vector
# (length 1) that keeps only the direction.
#
# WHERE YOU USE IT
# L2 appears in distances and weight decay; L1 encourages sparse weights; unit
# vectors are used before cosine similarity.
#
# RUN IT:  python 05_vec-4.py
#

import math
v = [3, 4]
l2 = math.sqrt(sum(a * a for a in v))
l1 = sum(abs(a) for a in v)
print(l2, l1)
unit = [a / l2 for a in v]
print(unit)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0 7
# [0.6, 0.8]
