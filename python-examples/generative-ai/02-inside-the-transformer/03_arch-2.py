# -*- coding: utf-8 -*-
# ==========================================================================
# Multi-head attention and shapes [generative-ai / Inside the transformer]
# ==========================================================================
# WHAT IT IS
# One attention pattern is not enough (syntax, coreference, position all
# matter), so the d-dimensional space is split into h heads of size d/h that
# attend independently and are concatenated and mixed by an output projection.
# For d = 768 and h = 12, each head works in 64 dimensions. Shapes: input
# (batch, seq, d) → Q, K, V each (batch, h, seq, d/h) → scores (batch, h, seq,
# seq) → output (batch, seq, d). The scores tensor is why memory and time grow
# with seq²: for a 4,096-token sequence and 32 heads that is 4,096² × 32 = 537
# million scores per layer (FlashAttention avoids storing them).
#
# WHERE YOU USE IT
# Grouped-query attention shares keys and values among several query heads to
# shrink the KV cache.
#
# RUN IT:  python 03_arch-2.py
#

d, h, seq = 768, 12, 4096
print(d // h)
print(seq * seq * 32, round(seq * seq * 32 * 2 / 1e9, 2), "GB in fp16 per layer (if stored)")
import numpy as np
x = np.zeros((2, seq // 64, d))
print(x.reshape(2, seq // 64, h, d // h).transpose(0, 2, 1, 3).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 64
# 536870912 1.07 GB in fp16 per layer (if stored)
# (2, 12, 64, 64)
