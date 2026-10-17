# -*- coding: utf-8 -*-
# ==========================================================================
# Cosine similarity: comparing direction [maths-ai / Vectors]
# ==========================================================================
# WHAT IT IS
# Cosine similarity compares the direction of two vectors and ignores their
# length: cos θ = (u · v) / (‖u‖ ‖v‖). It is 1 when they point the same way, 0
# when perpendicular, −1 when opposite. Two documents can be similar even if
# one is much longer.
#
# WHERE YOU USE IT
# Embedding search and retrieval (RAG) rank passages by cosine similarity
# between the query vector and each document vector.
#
# RUN IT:  python 07_vec-6.py
#

import math

def cosine(u, v):
    dot = sum(a * b for a, b in zip(u, v))
    return dot / (math.sqrt(sum(a * a for a in u)) * math.sqrt(sum(b * b for b in v)))

print(round(cosine([1, 0], [1, 1]), 4))
print(round(cosine([1, 2], [2, 4]), 4), round(cosine([1, 0], [0, 1]), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.7071
# 1.0 0.0
