# -*- coding: utf-8 -*-
# ==========================================================================
# Capacity of the code: how many components to keep [neural-networks /
# Autoencoders, VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# The smaller the latent code, the more detail is lost. A linear autoencoder
# behaves like PCA, so we can see the trade-off with plain NumPy: take 40
# noisy 8×8 "digit" patterns, project onto the top k directions (singular
# vectors) and rebuild. Reconstruction error falls quickly for the first few
# components and then flattens — extra capacity buys little. Choose the
# bottleneck size by validation reconstruction error and by what the code is
# for.
#
# WHERE YOU USE IT
# Nonlinear autoencoders can compress better than PCA at the same code size.
#
# RUN IT:  python 02_gen-1.py
#

import numpy as np

rng = np.random.default_rng(0)
basis = rng.normal(size=(3, 64))
X = rng.normal(size=(40, 3)) @ basis + rng.normal(0, 0.1, (40, 64))
mean = X.mean(axis=0)
U, S, Vt = np.linalg.svd(X - mean, full_matrices=False)
for k in (1, 2, 3, 5, 10):
    Xk = (X - mean) @ Vt[:k].T @ Vt[:k] + mean
    print(k, round(float(np.mean((X - Xk) ** 2)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 1.832
# 2 0.6399
# 3 0.0084
# 5 0.0071
# 10 0.0047
