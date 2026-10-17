# -*- coding: utf-8 -*-
# ==========================================================================
# FFT: why it is fast [speech-processing / Frequency analysis and
# spectrograms]
# ==========================================================================
# WHAT IT IS
# The direct DFT needs N² multiplications; the FFT splits the sum into even-
# and odd-indexed halves recursively and needs only about N log₂ N. For N =
# 512: 262,144 versus 4,608 operations — 57 times fewer; for N = 4,096 the
# ratio is over 340. That makes real-time spectral analysis possible on a
# phone. The FFT is fastest for N a power of two, which is why frame lengths
# are padded to 256, 512 or 1024 samples. Zero-padding does not add
# information but interpolates the spectrum between bins, giving a smoother
# picture.
#
# WHERE YOU USE IT
# In code use np.fft.rfft (real input) and let the library handle the
# algorithm.
#
# RUN IT:  python 02_freq-1.py
#

import numpy as np

for N in (64, 512, 4096):
    print(N, N * N, int(N * np.log2(N)), round(N * N / (N * np.log2(N))))
x = np.random.default_rng(0).standard_normal(8)
direct = np.array([sum(x[n] * np.exp(-2j * np.pi * k * n / 8) for n in range(8)) for k in range(8)])
print(bool(np.allclose(direct, np.fft.fft(x))))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 64 4096 384 11
# 512 262144 4608 57
# 4096 16777216 49152 341
# True
