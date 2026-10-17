# -*- coding: utf-8 -*-
# ==========================================================================
# The causal mask: no peeking at the future [generative-ai / Inside the
# transformer]
# ==========================================================================
# WHAT IT IS
# When generating, a token may only look at earlier tokens, otherwise training
# would be trivial (the answer is the next token). A causal mask sets the
# scores of future positions to −∞ before the softmax, so their weights become
# exactly 0. For the toy example the first token can see only itself (weights
# 1, 0, 0), the second splits 0.33 / 0.67 over tokens 1–2, the third keeps
# (0.248, 0.248, 0.503). One forward pass therefore trains the model on every
# position at once — a sequence of n tokens gives n next-token predictions.
#
# WHERE YOU USE IT
# Encoder models (BERT) use no mask; decoder models (GPT, Claude, Llama) use
# the causal mask.
#
# RUN IT:  python 02_arch-1.py
#

import numpy as np

X = np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]])
d = X.shape[1]
def softmax(z):
    e = np.exp(z - z.max(axis=-1, keepdims=True))
    return e / e.sum(axis=-1, keepdims=True)
scores = X @ X.T / np.sqrt(d)
mask = np.tril(np.ones((3, 3), bool))
W = softmax(np.where(mask, scores, -1e9))
print(W.round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1.0, 0.0, 0.0], [0.33, 0.67, 0.0], [0.248, 0.248, 0.503]]
