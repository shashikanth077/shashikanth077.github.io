# -*- coding: utf-8 -*-
# ==========================================================================
# Generative versus discriminative models [neural-networks / Autoencoders,
# VAEs and GANs]
# ==========================================================================
# WHAT IT IS
# A discriminative model learns the boundary between classes — P(y | x): "is
# this photo defective?". A generative model learns what the data look like —
# P(x), or P(x | y) — and can synthesise new samples. Autoencoders learn
# compact representations; VAEs and GANs generate. Choose by the business
# goal, not by fashion: if you only need to classify, a discriminator is
# simpler and usually more accurate.
#
# WHERE YOU USE IT
# Generative models answer a harder question, and are harder to evaluate (BLEU
# for text, human judgement or specialised scores for images).
#
# RUN IT:  python 09_gen-8.py
#

import numpy as np

rng = np.random.default_rng(0)
a = rng.normal(-1, 0.5, 200)
b = rng.normal(1, 0.5, 200)
boundary = (a.mean() + b.mean()) / 2
mean_a, std_a = a.mean(), a.std()
sample = rng.normal(mean_a, std_a, 3)
print(round(float(boundary), 2), sample.round(2).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# -0.02 [-1.17, -0.71, -1.68]
