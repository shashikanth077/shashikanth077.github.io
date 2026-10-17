# -*- coding: utf-8 -*-
# ==========================================================================
# Histograms and contrast [computer-vision / Images as data]
# ==========================================================================
# WHAT IT IS
# An image's histogram counts how many pixels have each intensity. A dark,
# low-contrast photo has all its pixels bunched into a narrow range. Contrast
# stretching rescales linearly: out = (x − min)/(max − min) × 255; for a pixel
# 90 in an image spanning 60–140 that gives 96. Gamma correction brightens or
# darkens mid-tones with out = 255 (x/255)^γ: γ < 1 brightens, γ > 1 darkens.
# Always inspect the histogram: clipped bars at 0 or 255 mean lost detail.
#
# WHERE YOU USE IT
# Apply contrast changes for display or as a pre-processing step; for
# learning, a network usually copes with raw but normalised pixels.
#
# RUN IT:  python 04_img-3.py
#

import numpy as np

x = np.array([60, 90, 100, 140], dtype=float)
print(((x - x.min()) / (x.max() - x.min()) * 255).round().astype(int).tolist())
for g in (0.5, 1.0, 2.2):
    print(g, round(255 * (128 / 255) ** g))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0, 96, 128, 255]
# 0.5 181
# 1.0 128
# 2.2 56
