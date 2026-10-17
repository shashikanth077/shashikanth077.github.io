# -*- coding: utf-8 -*-
# ==========================================================================
# Transformers, BERT and GPT [nlp / Sequence-to-sequence and transformers]
# ==========================================================================
# WHAT IT IS
# A transformer replaces recurrence by stacked self-attention and feed-forward
# layers, so all positions are processed in parallel. Two flavours dominate.
# Encoder-only models (BERT) read the whole sentence with full attention and
# are pretrained by predicting masked words — excellent for classification,
# tagging and retrieval. Decoder-only models (GPT-style) use a causal mask so
# each position sees only earlier tokens and are pretrained to predict the
# next word — the basis of generation. Encoder–decoder models (T5, translation
# systems) combine both.
#
# WHERE YOU USE IT
# The causal mask is a lower-triangular matrix: position i may attend to
# positions 0…i.
#
# RUN IT:  python 05_s2s-4.py
#

import numpy as np

mask = np.tril(np.ones((4, 4), int))
print(mask.tolist())
scores = np.zeros((4, 4))
scores[mask == 0] = -1e9
w = np.exp(scores) / np.exp(scores).sum(axis=1, keepdims=True)
print(w.round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[1, 0, 0, 0], [1, 1, 0, 0], [1, 1, 1, 0], [1, 1, 1, 1]]
# [[1.0, 0.0, 0.0, 0.0], [0.5, 0.5, 0.0, 0.0], [0.33, 0.33, 0.33, 0.0], [0.25, 0.25, 0.25, 0.25]]
