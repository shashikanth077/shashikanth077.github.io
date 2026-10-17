# -*- coding: utf-8 -*-
# ==========================================================================
# Training and sampling [generative-ai / Image generation with diffusion]
# ==========================================================================
# WHAT IT IS
# Training is simple regression: sample an image x₀, a step t and noise ε;
# build x_t; the network ε_θ(x_t, t) is trained to minimise ‖ε − ε_θ(x_t,
# t)‖². One sentence of code, millions of images. Sampling reverses it: start
# at x_T ~ N(0, I) and for t = T…1 predict the noise, subtract a scaled
# amount, add a little fresh noise (DDPM) or none (deterministic DDIM). Fewer
# steps are faster: 1,000 steps (original DDPM) take about 1,000 network
# passes per image; modern samplers and distillation get good images in 20–50
# steps, and consistency/distilled models in 1–4. Quality versus speed is a
# dial.
#
# WHERE YOU USE IT
# Sampler and step count change image quality and speed: expose them as
# settings and test your defaults.
#
# RUN IT:  python 03_diff-2.py
#

import numpy as np

rng = np.random.default_rng(0)
x0 = np.array([1.0, 0.5])
ab = 0.3
eps = rng.standard_normal(2)
xt = np.sqrt(ab) * x0 + np.sqrt(1 - ab) * eps
eps_hat = eps + 0.1 * rng.standard_normal(2)
print(round(float(((eps - eps_hat) ** 2).mean()), 4))
for steps in (1000, 50, 4):
    print(steps, "network passes per image")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 0.0021
# 1000 network passes per image
# 50 network passes per image
# 4 network passes per image
