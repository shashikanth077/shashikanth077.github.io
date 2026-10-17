# -*- coding: utf-8 -*-
# ==========================================================================
# Autoencoders: compress, then reconstruct [neural-networks / Autoencoders,
# VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# An autoencoder is trained to reproduce its own input. The encoder squeezes
# an input (a 784-pixel digit) into a small latent code (say 32 numbers); the
# decoder rebuilds the 784 values. The loss is reconstruction error MSE =
# (1/N)Σ(xᵢ − x̂ᵢ)² and the targets are the inputs themselves:
# model.fit(x_train, x_train). The goal is a compact useful representation,
# not predicting a digit label.
#
# WHERE YOU USE IT
# Because the code is smaller than the input, the network is forced to keep
# only the most important structure.
#
# RUN IT:  python 01_gen-0.py
#

import numpy as np

x = np.array([0.0, 0.5, 1.0, 0.5])
x_hat = np.array([0.1, 0.4, 0.9, 0.6])
print(round(float(np.mean((x - x_hat) ** 2)), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.01
