# -*- coding: utf-8 -*-
# ==========================================================================
# Cosine similarity between word vectors [nlp / Text representations]
# ==========================================================================
# WHAT IT IS
# cos(a, b) = a·b / (‖a‖‖b‖) measures the angle between two vectors: 1 = same
# direction, 0 = unrelated, −1 = opposite. It ignores length, so a rare and a
# frequent word of similar meaning can still match. With toy vectors cat =
# (0.9, 0.8) and dog = (0.85, 0.75) the cosine is 1.000 (almost the same
# direction), while cat and stock = (−0.7, 0.1) give −0.65. Drag the angle:
# cosine is simply cos θ.
#
# WHERE YOU USE IT
# Normalise vectors once and cosine becomes a plain dot product, which is what
# vector databases compute.
#
# RUN IT:  python 03_repr-2.py
#

import numpy as np

cat, dog, stock = np.array([0.9, 0.8]), np.array([0.85, 0.75]), np.array([-0.7, 0.1])
cos = lambda a, b: float(a @ b / (np.linalg.norm(a) * np.linalg.norm(b)))
print(round(cos(cat, dog), 3), round(cos(cat, stock), 3))
print(round(cos(np.array([1.0, 0.0]), np.array([0.0, 2.0])), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.0 -0.646
# 0.0
