# -*- coding: utf-8 -*-
# ==========================================================================
# LoRA: low-rank adapters [generative-ai / Adapting models: LoRA,
# quantisation, alignment]
# ==========================================================================
# WHAT IT IS
# Updating all weights is expensive. LoRA freezes the pretrained matrix W (d ×
# k) and learns a low-rank update ΔW = B A with B (d × r) and A (r × k), r ≪
# d. Only A and B are trained: r(d + k) parameters instead of d·k. For d = k =
# 4,096 and r = 8: 2 × 4,096 × 8 = 65,536 trainable parameters instead of
# 16,777,216 — 0.39%. Applied to the attention projections of a 7 B model this
# means a few million trainable weights, one adapter file of tens of MB per
# task, and fine-tuning on a single GPU. At inference the update can be
# merged: W′ = W + (α/r) B A. QLoRA adds a 4-bit quantised base model.
#
# WHERE YOU USE IT
# Typical ranks are 8–64; raise r if the adapter underfits the task.
#
# RUN IT:  python 03_adapt-2.py
#

import numpy as np

d, k, r = 4096, 4096, 8
print(r * (d + k), d * k, round(r * (d + k) / (d * k) * 100, 3))
rng = np.random.default_rng(0)
W = rng.normal(size=(6, 6))
B, A = rng.normal(size=(6, 2)), rng.normal(size=(2, 6))
print(int(np.linalg.matrix_rank(B @ A)), (W + B @ A).shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 65536 16777216 0.391
# 2 (6, 6)
