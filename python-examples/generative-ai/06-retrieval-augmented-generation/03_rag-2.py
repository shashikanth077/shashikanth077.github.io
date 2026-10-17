# -*- coding: utf-8 -*-
# ==========================================================================
# Retrieval with embeddings and top-k [generative-ai / Retrieval-augmented
# generation]
# ==========================================================================
# WHAT IT IS
# Embed every chunk once; at question time embed the question with the same
# model and return the k chunks with the highest cosine similarity. For small
# collections a brute-force dot product over normalised vectors is exact and
# fast; for millions use an approximate nearest-neighbour index (HNSW, IVF)
# that trades a little recall for speed. Example with 2-D vectors: question
# (0.9, 0.2); chunks A (0.8, 0.3), B (0.1, 0.9), C (0.7, 0.1): cosines 0.990,
# 0.323, 0.997 → top-2 are C and A. Choose k to fit your context budget (4–10
# chunks is typical) and store metadata (source, date, permissions) to filter
# by.
#
# WHERE YOU USE IT
# Apply access-control filters inside the search, not after it: never retrieve
# what the user may not see.
#
# RUN IT:  python 03_rag-2.py
#

import numpy as np

q = np.array([0.9, 0.2])
chunks = {"A": [0.8, 0.3], "B": [0.1, 0.9], "C": [0.7, 0.1]}
cos = lambda a, b: float(a @ b / np.linalg.norm(a) / np.linalg.norm(b))
scores = {k: round(cos(q, np.array(v)), 3) for k, v in chunks.items()}
print(scores, sorted(scores, key=scores.get, reverse=True)[:2])

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# {'A': 0.99, 'B': 0.323, 'C': 0.997} ['C', 'A']
