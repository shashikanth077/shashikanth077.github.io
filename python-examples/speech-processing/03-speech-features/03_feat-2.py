# -*- coding: utf-8 -*-
# ==========================================================================
# The mel scale: how we hear pitch [speech-processing / Speech features]
# ==========================================================================
# WHAT IT IS
# Humans resolve low frequencies finely and high ones coarsely: the step from
# 100 to 200 Hz sounds large, from 7,000 to 7,100 Hz hardly at all. The mel
# scale warps frequency to match: mel = 2595 log₁₀(1 + f/700). It is nearly
# linear below 1 kHz and logarithmic above: 100 Hz → 150.5 mel, 1,000 Hz →
# 1,000 mel, 4,000 Hz → 2,146 mel, 8,000 Hz → 2,840 mel. Using mel-spaced
# bands gives the recogniser fine detail where speech carries most information
# and coarse detail where it does not, and matches the ear's critical bands.
#
# WHERE YOU USE IT
# Other perceptual scales exist (Bark, ERB); mel is the standard in speech and
# audio models.
#
# RUN IT:  python 03_feat-2.py
#

import numpy as np

mel = lambda f: 2595 * np.log10(1 + np.asarray(f, float) / 700)
inv = lambda m: 700 * (10 ** (np.asarray(m, float) / 2595) - 1)
print(mel([100, 1000, 4000, 8000]).round(1).tolist())
print(round(float(inv(mel(1234.0))), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [150.5, 1000.0, 2146.1, 2840.0]
# 1234.0
