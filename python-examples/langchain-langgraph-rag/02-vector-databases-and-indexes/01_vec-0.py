# -*- coding: utf-8 -*-
# ==========================================================================
# Embeddings and distance metrics [langchain-langgraph-rag / Vector databases
# and indexes]
# ==========================================================================
# WHAT IT IS
# A vector database stores embeddings — lists of numbers produced by an
# embedding model — and finds the ones nearest to a query vector. "Nearest"
# needs a metric. Cosine similarity compares directions: cos = a·b/(‖a‖‖b‖).
# Euclidean (L2) distance ‖a − b‖. Inner (dot) product a·b. For vectors
# normalised to length 1 they are interchangeable: ‖a − b‖² = 2 − 2·cos(a, b),
# and the dot product equals the cosine, so rankings agree. Use the metric the
# embedding model was trained for (most text models: cosine or dot product on
# normalised vectors) and use the same model for documents and queries —
# vectors from different models live in different spaces and cannot be
# compared.
#
# WHERE YOU USE IT
# Normalise once at write time and use the dot product: it is the fastest
# operation and every index supports it.
#
# RUN IT:  python 01_vec-0.py
#

import numpy as np

a, b = np.array([3.0, 4.0]), np.array([4.0, 3.0])
a1, b1 = a / np.linalg.norm(a), b / np.linalg.norm(b)
cos = float(a1 @ b1)
print(round(cos, 4), round(float(np.sum((a1 - b1) ** 2)), 4), round(2 - 2 * cos, 4))
print(round(float(a @ b), 1), round(float(np.linalg.norm(a - b)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.96 0.08 0.08
# 24.0 1.414
