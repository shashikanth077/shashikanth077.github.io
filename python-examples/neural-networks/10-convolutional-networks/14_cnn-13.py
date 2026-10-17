# -*- coding: utf-8 -*-
# ==========================================================================
# A beginner project roadmap [neural-networks / Convolutional networks]
# ==========================================================================
# WHAT IT IS
# Start with MNIST before camera photos: small, well understood, clear
# objective. 1) Load images and labels. 2) Split train / validation / test;
# tune only on validation. 3) Normalise (÷255) and shape (28×28×1). 4) Define
# Conv2D → ReLU → Pool → Conv2D → Pool → Dense. 5) Train with Adam +
# cross-entropy and plot train/validation curves. 6) Evaluate: confusion
# matrix, misclassified examples. 7) Improve: dropout, augmentation, batch
# normalisation, architecture changes. Start with one epoch to check the
# pipeline before long runs.
#
# WHERE YOU USE IT
# Seven habits: begin with pixel matrices, remember every position is a dot
# product, size is set by filter/padding/stride, depth by the filter count,
# pooling has no weights, watch validation loss, keep preprocessing identical
# at inference.
#
# RUN IT:  python 14_cnn-13.py
#

steps = ["load", "split", "normalise", "define", "train", "evaluate", "improve"]
for i, s in enumerate(steps, 1):
    print(i, s)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 load
# 2 split
# 3 normalise
# 4 define
# 5 train
# 6 evaluate
# 7 improve
