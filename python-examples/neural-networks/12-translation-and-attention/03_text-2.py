# -*- coding: utf-8 -*-
# ==========================================================================
# Attention matrix and positional encoding [neural-networks / Translation and
# attention]
# ==========================================================================
# WHAT IT IS
# For every query word, attention gives one row of weights over the key words
# (rows sum to 1). A row can be identity-like (each word attends to itself),
# focused on one word ("love"), or spread out. Attention itself has no sense
# of order, so Transformers add positional encodings to the token embeddings:
# PE(pos,2i) = sin(pos/10000^(2i/d)), PE(pos,2i+1) = cos(…). Token embeddings
# tell the model WHAT a word is; positional signals tell it WHERE it is. Not
# every modern Transformer uses this sinusoidal scheme.
#
# WHERE YOU USE IT
# Without positional information "dog bites man" and "man bites dog" would
# look identical to attention.
#
# RUN IT:  python 03_text-2.py
#

import numpy as np

d = 8
pos = np.arange(4)[:, None]
i = np.arange(d // 2)[None, :]
angle = pos / 10000 ** (2 * i / d)
pe = np.zeros((4, d))
pe[:, 0::2], pe[:, 1::2] = np.sin(angle), np.cos(angle)
print(pe[:, :4].round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.0, 1.0, 0.0, 1.0], [0.841, 0.54, 0.1, 0.995], [0.909, -0.416, 0.199, 0.98], [0.141, -0.99, 0.296, 0.955]]
