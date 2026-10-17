# -*- coding: utf-8 -*-
# ==========================================================================
# Generating text: temperature, top-k and top-p [nlp / Language models and
# generation]
# ==========================================================================
# WHAT IT IS
# To generate, repeatedly turn the next-word distribution into a choice.
# Greedy always takes the maximum (repetitive); sampling draws from the
# distribution (varied, sometimes odd). Temperature T reshapes the logits:
# softmax(z/T). With z = [3, 2, 1, 0]: T = 0.5 gives [0.865, 0.117, 0.016,
# 0.002] (almost greedy), T = 1 gives [0.644, 0.237, 0.087, 0.032], T = 2
# gives [0.455, 0.276, 0.167, 0.102] (flatter, more random). Top-k keeps the k
# best words; top-p (nucleus) keeps the smallest set whose probabilities add
# to p (0.644 + 0.237 = 0.881 ≥ 0.85 → two words).
#
# WHERE YOU USE IT
# Low temperature for factual answers and code; higher for creative writing.
# Sampling settings change behaviour as much as the model does.
#
# RUN IT:  python 06_lm-5.py
#

import numpy as np

z = np.array([3.0, 2.0, 1.0, 0.0])
for T in (0.5, 1.0, 2.0):
    e = np.exp(z / T)
    print(T, (e / e.sum()).round(3).tolist())
p = np.exp(z) / np.exp(z).sum()
cum = np.cumsum(np.sort(p)[::-1])
print(cum.round(3).tolist(), int((cum < 0.9).sum()) + 1)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.5 [0.865, 0.117, 0.016, 0.002]
# 1.0 [0.644, 0.237, 0.087, 0.032]
# 2.0 [0.455, 0.276, 0.167, 0.102]
# [0.644, 0.881, 0.968, 1.0] 3
