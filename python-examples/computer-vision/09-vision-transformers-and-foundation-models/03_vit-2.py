# -*- coding: utf-8 -*-
# ==========================================================================
# Contrastive image–text learning (CLIP) [computer-vision / Vision
# transformers and foundation models]
# ==========================================================================
# WHAT IT IS
# CLIP trains an image encoder and a text encoder together on hundreds of
# millions of image–caption pairs. In a batch of N pairs, build the N × N
# matrix of cosine similarities; the diagonal holds the matching pairs. A
# softmax over each row (and each column) with a cross-entropy loss pushes the
# diagonal up and everything else down. For a 2-pair batch with logits [[4,
# 1], [0, 3]]: row 1 gives P(correct) = e⁴/(e⁴ + e¹) = 0.953 and row 2 gives
# e³/(e⁰ + e³) = 0.953. At test time zero-shot classification compares an
# image with the text "a photo of a {class}" for every class and picks the
# best match.
#
# WHERE YOU USE IT
# Prompt wording changes accuracy; evaluate several templates and ensemble
# them.
#
# RUN IT:  python 03_vit-2.py
#

import numpy as np

logits = np.array([[4.0, 1.0], [0.0, 3.0]])
p = np.exp(logits) / np.exp(logits).sum(axis=1, keepdims=True)
print(p.round(3).tolist(), round(float(-np.log(np.diag(p)).mean()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [[0.953, 0.047], [0.047, 0.953]] 0.049
