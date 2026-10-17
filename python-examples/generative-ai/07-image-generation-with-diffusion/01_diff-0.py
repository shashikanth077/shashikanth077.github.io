# -*- coding: utf-8 -*-
# ==========================================================================
# Diffusion models: create by removing noise [generative-ai / Image generation
# with diffusion]
# ==========================================================================
# WHAT IT IS
# A diffusion model learns to reverse a gradual corruption. Forward process:
# take a real image and add a little Gaussian noise, again and again, until
# only noise is left (a few hundred to a thousand steps). Reverse process: a
# neural network is trained to predict the noise in a noisy image; starting
# from pure random noise and removing the predicted noise step by step
# produces a new image. Because the network only has to make small, local
# denoising decisions, training is stable and produces diverse, high-quality
# results — the basis of Stable Diffusion, DALL·E and video generators.
#
# WHERE YOU USE IT
# Unlike a GAN, a diffusion model does not need an adversary, and it covers
# the whole data distribution rather than a few modes.
#
# RUN IT:  python 01_diff-0.py
#

import numpy as np

rng = np.random.default_rng(0)
x = np.array([1.0, -1.0, 0.5, 0.0])
for step in range(1, 4):
    x = np.sqrt(0.9) * x + np.sqrt(0.1) * rng.standard_normal(4)
    print(step, x.round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1 [0.99, -0.99, 0.68, 0.03]
# 2 [0.77, -0.83, 1.05, 0.33]
# 3 [0.51, -1.18, 0.8, 0.33]
