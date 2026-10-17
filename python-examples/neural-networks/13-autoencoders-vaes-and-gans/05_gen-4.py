# -*- coding: utf-8 -*-
# ==========================================================================
# Variational autoencoders: a distribution instead of a point [neural-networks
# / Autoencoders, VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# A VAE encoder predicts a distribution for each input: a mean μ and a
# log-variance. A code is sampled by the reparameterisation trick: z = μ + σ·ε
# with ε ~ N(0,1) and σ = exp(½·logσ²). Because ε carries the randomness,
# gradients flow through μ and σ during training. Example μ = 0.5, log σ² =
# −0.4, ε = 1: σ = e^(−0.2) = 0.819, so z = 1.319. Drag μ, log σ² and ε.
#
# WHERE YOU USE IT
# Sampling is written as a deterministic function of (μ, σ) plus external
# noise — that is the whole trick.
#
# RUN IT:  python 05_gen-4.py
#

import numpy as np

mu, logvar, eps = 0.5, -0.4, 1.0
sigma = np.exp(0.5 * logvar)
print(round(float(sigma), 4), round(float(mu + sigma * eps), 4))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.8187 1.3187
