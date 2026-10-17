# -*- coding: utf-8 -*-
# ==========================================================================
# Quantisation: smaller numbers, smaller models [generative-ai / Adapting
# models: LoRA, quantisation, alignment]
# ==========================================================================
# WHAT IT IS
# Weights stored in 16 bits can often be stored in 8 or 4 bits with little
# loss. Symmetric int8 quantisation: scale s = max|w|/127, q = round(w/s),
# reconstruction ŵ = q·s. For w = (0.5, −1.2, 0.03, 0.9): s = 0.00945, q =
# (53, −127, 3, 95), ŵ = (0.5008, −1.2, 0.0283, 0.8976) — error at most
# 0.0024, but the tiny weight 0.03 has the largest relative error. Memory
# falls from 2 bytes to 1 (int8) or 0.5 (4-bit) per weight: a 70 B model goes
# from 140 GB to 35 GB. Per-group scales and outlier handling keep 4-bit
# accuracy acceptable; activations and the KV cache can be quantised too.
#
# WHERE YOU USE IT
# Always evaluate the quantised model on your task: small average error can
# still break rare, important behaviours.
#
# RUN IT:  python 04_adapt-3.py
#

import numpy as np

w = np.array([0.5, -1.2, 0.03, 0.9])
s = np.abs(w).max() / 127
q = np.round(w / s).astype(int)
print(round(float(s), 5), q.tolist(), (q * s).round(4).tolist(), round(float(np.abs(q * s - w).max()), 4))
for bits, name in ((16, "fp16"), (8, "int8"), (4, "int4")):
    print(name, 70e9 * bits / 8 / 1e9, "GB for 70B")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.00945 [53, -127, 3, 95] [0.5008, -1.2, 0.0283, 0.8976] 0.0024
# fp16 140.0 GB for 70B
# int8 70.0 GB for 70B
# int4 35.0 GB for 70B
