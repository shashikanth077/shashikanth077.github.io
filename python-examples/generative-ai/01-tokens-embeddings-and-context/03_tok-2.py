# -*- coding: utf-8 -*-
# ==========================================================================
# Embeddings: meaning as vectors [generative-ai / Tokens, embeddings and
# context]
# ==========================================================================
# WHAT IT IS
# Each token is turned into a vector by an embedding table of shape
# (vocabulary × dimension); with 50,257 tokens and 768 dimensions that is 38.6
# million numbers, learned during training. Sentences and documents get
# vectors too, from dedicated embedding models. In the space, similar meanings
# sit close together; cosine similarity measures closeness: for the toy
# vectors a = (0.9, 0.1) and b = (0.8, 0.3) the cosine is 0.969 (similar), for
# a and c = (0.1, 0.9) it is 0.220 (different). Embeddings power semantic
# search, clustering, recommendation and the retrieval step of RAG.
#
# WHERE YOU USE IT
# Embeddings from different models live in different spaces: never compare or
# mix them.
#
# RUN IT:  python 03_tok-2.py
#

import numpy as np

a, b, c = np.array([0.9, 0.1]), np.array([0.8, 0.3]), np.array([0.1, 0.9])
cos = lambda x, y: float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y)))
print(round(cos(a, b), 3), round(cos(a, c), 3))
print(50257 * 768)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.969 0.22
# 38597376
