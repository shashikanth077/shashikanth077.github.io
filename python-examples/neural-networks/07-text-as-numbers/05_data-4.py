# -*- coding: utf-8 -*-
# ==========================================================================
# The IMDb project: two architectures [neural-networks / Text as numbers]
# ==========================================================================
# WHAT IT IS
# Goal: classify a movie review as positive (1) or negative (0) from 50,000
# reviews split into train / validation / test. Pipeline: reviews → split →
# token index → encode → network → early stopping → test results. Architecture
# A: multi-hot 10,000-vector → Dense(16, relu) → Dense(16, relu) → Dense(1,
# sigmoid). Architecture B: token IDs → Embedding → global pooling → Dense
# layers → sigmoid. Output sigmoid + binary cross-entropy suit a two-class
# label. Check that training loss falls, find the epoch where validation loss
# is lowest, compare train and validation curves, and only then evaluate on
# the untouched test reviews.
#
# WHERE YOU USE IT
# Parameter count of A: 10,000×16+16 + 16×16+16 + 16×1+1 = 160,305. These
# snippets need TensorFlow; here the network arithmetic is reproduced in
# NumPy.
#
# RUN IT:  python 05_data-4.py
#

sizes = [10000, 16, 16, 1]
params = [a * b + b for a, b in zip(sizes[:-1], sizes[1:])]
print(params, sum(params))
emb = 10000 * 8
print(emb, emb + 8 * 16 + 16 + 16 * 1 + 1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [160016, 272, 17] 160305
# 80000 80161
