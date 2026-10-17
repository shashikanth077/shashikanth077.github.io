# -*- coding: utf-8 -*-
# ==========================================================================
# Vision Transformer: images as sequences of patches [computer-vision / Vision
# transformers and foundation models]
# ==========================================================================
# WHAT IT IS
# A Vision Transformer (ViT) treats an image like a sentence. Cut a 224 × 224
# image into 16 × 16 patches: 14 × 14 = 196 patches, each with 16 × 16 × 3 =
# 768 numbers. A linear layer maps each patch to a token embedding (768 → 768:
# 590,592 parameters), a learned position embedding is added, a special [CLS]
# token is prepended (197 tokens), and a stack of transformer encoder layers
# with self-attention processes them. The [CLS] output feeds the classifier.
# Self-attention lets every patch see every other patch from the first layer,
# while a CNN builds context gradually.
#
# WHERE YOU USE IT
# ViTs need lots of data (or pretraining) because they lack the CNN's built-in
# bias towards locality and translation invariance.
#
# RUN IT:  python 01_vit-0.py
#

import numpy as np

img_size, patch = 224, 16
n = (img_size // patch) ** 2
dim_in = patch * patch * 3
print(n, n + 1, dim_in, dim_in * 768 + 768)
rng = np.random.default_rng(0)
img = rng.random((224, 224, 3))
patches = img.reshape(14, 16, 14, 16, 3).transpose(0, 2, 1, 3, 4).reshape(196, 768)
print(patches.shape)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 196 197 768 590592
# (196, 768)
