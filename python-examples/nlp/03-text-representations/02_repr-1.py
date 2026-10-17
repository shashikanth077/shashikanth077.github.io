# -*- coding: utf-8 -*-
# ==========================================================================
# Sparse versus dense: why embeddings exist [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# A one-hot or count vector has one dimension per word: 50,000 dimensions,
# almost all zero, and every pair of words is equally unrelated (their dot
# product is 0). A dense embedding gives each word a short vector (50–300
# numbers) learned from text so that words used in similar contexts get
# similar vectors. "cat" and "dog" end up close, "cat" and "stock" far apart,
# and the model can generalise from "I adopted a cat" to "I adopted a dog".
#
# WHERE YOU USE IT
# Embeddings are learned once on huge corpora and reused: that is transfer
# learning for text.
#
# RUN IT:  python 02_repr-1.py
#

import numpy as np

onehot = np.eye(4)
print(float(onehot[0] @ onehot[1]), float(onehot[0] @ onehot[3]))
E = np.array([[0.9, 0.8], [0.85, 0.75], [0.1, 0.9], [-0.7, 0.1]])
cos = lambda a, b: float(a @ b / np.linalg.norm(a) / np.linalg.norm(b))
print(round(cos(E[0], E[1]), 3), round(cos(E[0], E[3]), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0 0.0
# 1.0 -0.646
