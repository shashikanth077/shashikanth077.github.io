# -*- coding: utf-8 -*-
# ==========================================================================
# Embeddings: a trainable lookup table [neural-networks / Text as numbers]
# ==========================================================================
# WHAT IT IS
# A word ID is only an index. An Embedding layer owns a trainable matrix of
# shape (vocabulary × dimension) and returns row ID for each token — a dense
# vector learned by backpropagation so that useful words end up close.
# Embedding(10000, 8) holds 10,000 × 8 = 80,000 trainable values. A sentence
# of 10 tokens becomes a 10 × 8 matrix; global average pooling then collapses
# it to one 8-vector fed to Dense layers. Real embeddings have dozens to
# hundreds of dimensions and are not human-readable axes.
#
# WHERE YOU USE IT
# Raw token IDs should never go straight into a Dense layer as if they were
# measurements — use multi-hot or an Embedding.
#
# RUN IT:  python 04_data-3.py
#

import numpy as np

rng = np.random.default_rng(0)
vocab, dim = 10000, 8
table_ = rng.normal(0, 0.05, (vocab, dim))
ids = np.array([5, 6, 7, 8, 0, 0, 0, 0, 0, 0])
vectors = table_[ids]
pooled = vectors.mean(axis=0)
print(table_.size, vectors.shape, pooled.shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80000 (10, 8) (8,)
