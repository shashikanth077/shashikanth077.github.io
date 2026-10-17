# -*- coding: utf-8 -*-
# ==========================================================================
# Distance between points [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# The distance between two points is the L2 length of their difference vector:
# d = √((x₂ − x₁)² + (y₂ − y₁)²). With many features it is the same formula
# with more terms. Close points are "similar"; far points are not.
#
# WHERE YOU USE IT
# k-nearest neighbours, clustering and embedding search all rank things by
# distance.
#
# RUN IT:  python 06_vec-5.py
#

import math
a, b = (1, 1), (4, 5)
dist = math.dist(a, b)
print(dist)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5.0
