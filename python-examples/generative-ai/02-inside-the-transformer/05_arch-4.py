# -*- coding: utf-8 -*-
# ==========================================================================
# Counting parameters: 12·L·d² [generative-ai / Inside the transformer]
# ==========================================================================
# WHAT IT IS
# Each layer holds 4d² weights in attention (Q, K, V and output projections)
# and 8d² in the MLP (d → 4d → d), so ≈ 12 d² per layer and 12 L d² in total,
# plus the embeddings V × d. GPT-2 small: L = 12, d = 768 → 12 × 12 × 768² =
# 84.9 M, plus 50,257 × 768 = 38.6 M and 1,024 × 768 = 0.8 M positions: 124.3
# M — the advertised "124M". A 7B model has roughly d = 4,096, L = 32: 12 × 32
# × 4,096² = 6.4 B + embeddings ≈ 6.6 B. Memory to store weights = parameters
# × bytes: 7 B in 16-bit = 14 GB.
#
# WHERE YOU USE IT
# Doubling the width d quadruples the parameters; doubling the depth doubles
# them.
#
# RUN IT:  python 05_arch-4.py
#

def params(L, d, V, pos=0):
    return 12 * L * d * d + V * d + pos * d

print(params(12, 768, 50257, 1024))
print(params(32, 4096, 32000), round(params(32, 4096, 32000) * 2 / 1e9, 1), "GB in 16-bit")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 124318464
# 6573522944 13.1 GB in 16-bit
