# -*- coding: utf-8 -*-
# ==========================================================================
# Quantization and bit depth [speech-processing / Sound, sampling and speech
# data]
# ==========================================================================
# WHAT IT IS
# Each sample is rounded to one of 2^b levels. The rounding error is
# quantization noise; for a full-scale sine the signal-to-noise ratio is about
# 6.02 b + 1.76 dB: 8 bits ≈ 49.9 dB, 16 bits ≈ 98.1 dB, 24 bits ≈ 146 dB.
# Every extra bit buys 6 dB. 16-bit audio is the standard for speech and CDs;
# 8-bit telephone audio uses non-linear μ-law or A-law companding, which gives
# quiet sounds finer steps: μ-law maps x to sign(x) · ln(1 + 255|x|)/ln 256,
# so 0.1 becomes 0.591 and 0.01 becomes 0.228.
#
# WHERE YOU USE IT
# Neural models typically take float32 samples scaled to [−1, 1]; keep the
# conversion consistent between training and serving.
#
# RUN IT:  python 05_sig-4.py
#

import numpy as np

for b in (8, 16, 24):
    print(b, round(6.02 * b + 1.76, 1))
mu = 255
f = lambda x: np.sign(x) * np.log1p(mu * np.abs(x)) / np.log1p(mu)
print(round(float(f(0.1)), 3), round(float(f(0.01)), 3))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 8 49.9
# 16 98.1
# 24 146.2
# 0.591 0.228
