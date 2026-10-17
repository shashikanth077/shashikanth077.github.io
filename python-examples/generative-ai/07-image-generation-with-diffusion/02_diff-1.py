# -*- coding: utf-8 -*-
# ==========================================================================
# The forward process in one formula [generative-ai / Image generation with
# diffusion]
# ==========================================================================
# WHAT IT IS
# Noise can be added in one jump: x_t = √ᾱ_t · x₀ + √(1 − ᾱ_t) · ε, ε ~ N(0,
# I), where ᾱ_t falls from ≈ 1 (clean) to ≈ 0 (pure noise) along the noise
# schedule. With ᾱ = 0.5, x₀ = 1 and noise ε = 0.5: x_t = 0.707 × 1 + 0.707 ×
# 0.5 = 1.061 — signal and noise equally strong, signal-to-noise ratio ᾱ/(1 −
# ᾱ) = 1. A linear schedule with β from 10⁻⁴ to 0.02 over T = 1,000 steps
# gives ᾱ₁ = 0.9999, ᾱ₅₀₀ = 0.079, ᾱ₁₀₀₀ = 4×10⁻⁵. Training picks a random t,
# forms x_t from a real image and asks the network to predict ε.
#
# WHERE YOU USE IT
# Schedules (linear, cosine) decide how fast the image is destroyed; cosine
# keeps more signal in the early steps.
#
# RUN IT:  python 02_diff-1.py
#

import numpy as np

ab, x0, eps = 0.5, 1.0, 0.5
print(round(float(np.sqrt(ab) * x0 + np.sqrt(1 - ab) * eps), 3), ab / (1 - ab))
beta = np.linspace(1e-4, 0.02, 1000)
abar = np.cumprod(1 - beta)
print(float(abar[0]), round(float(abar[499]), 4), float(abar[-1]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 1.061 1.0
# 0.9999 0.0786 4.035829765375676e-05
