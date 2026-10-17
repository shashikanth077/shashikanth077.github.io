# -*- coding: utf-8 -*-
# ==========================================================================
# Noise: salt-and-pepper, Gaussian, shot [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# Real images are noisy. Salt-and-pepper noise sets a few pixels to 0 or 255
# (dead pixels, transmission errors). Gaussian noise adds a small random value
# to every pixel (sensor electronics); its standard deviation σ measures the
# damage. Shot noise comes from counting photons: its variance grows with
# brightness, which is why dark photos look grainy. The quality measure PSNR =
# 10 log₁₀(255²/MSE) compares a processed image with the clean original; noise
# of σ = 10 gives MSE ≈ 100 and PSNR ≈ 28 dB.
#
# WHERE YOU USE IT
# Choose the denoiser to match the noise: a median filter for salt-and-pepper,
# a Gaussian or non-local means for Gaussian noise.
#
# RUN IT:  python 06_img-5.py
#

import numpy as np

rng = np.random.default_rng(0)
clean = np.full((100, 100), 120.0)
noisy = clean + rng.normal(0, 10, clean.shape)
mse = float(((noisy - clean) ** 2).mean())
print(round(mse, 1), round(10 * np.log10(255 ** 2 / mse), 1))
sp = clean.copy()
sp[rng.random(clean.shape) < 0.05] = 255
print(round(float((sp == 255).mean()), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 99.6 28.1
# 0.049
