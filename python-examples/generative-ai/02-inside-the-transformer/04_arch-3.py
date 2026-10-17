# -*- coding: utf-8 -*-
# ==========================================================================
# The transformer block: attention, MLP, residuals [generative-ai / Inside the
# transformer]
# ==========================================================================
# WHAT IT IS
# A transformer layer is two sub-layers, each wrapped in layer normalisation
# and a residual connection: x ← x + Attention(LN(x)), then x ← x +
# MLP(LN(x)). The MLP expands to 4d and projects back (with a GELU or SwiGLU
# non-linearity). The residual path lets gradients flow through dozens of
# layers, and each layer only adds a refinement to what is already in the
# stream. LayerNorm standardises each token's vector: (1, 2, 3, 4) becomes
# (−1.342, −0.447, 0.447, 1.342). Stacking L such blocks (12 for GPT-2 small,
# 80+ for the largest models) and adding an output layer over the vocabulary
# gives the full model.
#
# WHERE YOU USE IT
# "Pre-norm" (normalise before each sub-layer) trains more stably than the
# original "post-norm".
#
# RUN IT:  python 04_arch-3.py
#

import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
ln = (x - x.mean()) / np.sqrt(x.var() + 1e-5)
print(ln.round(3).tolist())
d = 768
attn, mlp = 4 * d * d, 2 * d * 4 * d
print(attn, mlp, attn + mlp, 12 * d * d)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-1.342, -0.447, 0.447, 1.342]
# 2359296 4718592 7077888 7077888
