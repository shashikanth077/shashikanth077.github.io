# -*- coding: utf-8 -*-
# ==========================================================================
# Softmax: a probability share for every class [neural-networks / Activation
# functions]
# ==========================================================================
# WHAT IT IS
# For several mutually exclusive classes the output layer produces one raw
# score (logit) per class and softmax(zᵢ) = e^zᵢ / Σⱼ e^zⱼ turns them into
# probabilities that sum to 1. Logits (2, 1, 0): exponentials (7.389, 2.718,
# 1), sum 11.107, probabilities (0.665, 0.245, 0.090) → predict class 0 (the
# argmax). Exponentials make everything positive and keep the ranking;
# dividing by the sum normalises. Adding the SAME constant to every logit
# changes nothing — which is why implementations subtract the maximum for
# numerical stability. Try the shift slider.
#
# WHERE YOU USE IT
# For independent labels (a photo can contain both a cat and a dog) use one
# sigmoid per label instead of one softmax.
#
# RUN IT:  python 05_act-4.py
#

import numpy as np

z = np.array([2.0, 1.0, 0.0])
e = np.exp(z)
print(e.round(4).tolist(), round(float(e.sum()), 4))
p = e / e.sum()
print(p.round(4).tolist(), int(p.argmax()))
shifted = np.exp(z + 10) / np.exp(z + 10).sum()
print(bool(np.allclose(p, shifted)))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [7.3891, 2.7183, 1.0] 11.1073
# [0.6652, 0.2447, 0.09] 0
# True
