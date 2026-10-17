# -*- coding: utf-8 -*-
# ==========================================================================
# Vector addition and scaling [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# A vector can be drawn as an arrow from the origin. To add two vectors, add
# matching components — or slide one arrow to the tip of the other: [2, 1] +
# [1, 2] = [3, 3]. Multiplying by a scalar stretches (or flips) the arrow
# without changing its direction.
#
# WHERE YOU USE IT
# Embeddings are vectors; adding and subtracting them gives the famous "king −
# man + woman ≈ queen" arithmetic.
#
# RUN IT:  python 02_vec-1.py
#

u = [2, 1]
v = [1, 2]
print([a + b for a, b in zip(u, v)])
print([3 * a for a in u])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3, 3]
# [6, 3]
