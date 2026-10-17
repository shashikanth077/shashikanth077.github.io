# -*- coding: utf-8 -*-
# ==========================================================================
# Positional information: telling a model the order [generative-ai / Tokens,
# embeddings and context]
# ==========================================================================
# WHAT IT IS
# Self-attention treats a sentence as a set — without extra signals "dog bites
# man" and "man bites dog" look the same. Position is injected in one of three
# ways. Learned absolute position vectors (GPT-2: 1,024 positions). Sinusoidal
# encodings: PE(pos, 2i) = sin(pos / 10000^(2i/d)): for the first dimension (i
# = 0) positions 0, 1, 2 give 0, 0.841, 0.909. Rotary embeddings (RoPE) rotate
# the query and key vectors by an angle proportional to position, so attention
# depends on the relative distance of two tokens — the choice of most modern
# LLMs, and the basis of context-extension tricks.
#
# WHERE YOU USE IT
# A model trained on 4k tokens often fails beyond that unless its positional
# scheme is extended and the model is adapted.
#
# RUN IT:  python 04_tok-3.py
#

import numpy as np

pos = np.array([0, 1, 2])
print(np.sin(pos / 10000 ** (0 / 4)).round(3).tolist())
def rotate(v, angle):
    c, s = np.cos(angle), np.sin(angle)
    return np.array([c * v[0] - s * v[1], s * v[0] + c * v[1]])
q, k = np.array([1.0, 0.0]), np.array([1.0, 0.0])
print(round(float(rotate(q, 0.3 * 5) @ rotate(k, 0.3 * 3)), 3), round(float(rotate(q, 0.3 * 12) @ rotate(k, 0.3 * 10)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 0.841, 0.909]
# 0.825 0.825
