# -*- coding: utf-8 -*-
# ==========================================================================
# The Fourier transform: finding the frequencies [speech-processing /
# Frequency analysis and spectrograms]
# ==========================================================================
# WHAT IT IS
# A voice is a sum of sine waves. The discrete Fourier transform finds how
# much of each frequency a block of N samples contains: X[k] = Σₙ x[n] e^(−2πi
# kn/N). For the four samples (1, 2, 3, 4): X = (10, −2 + 2i, −2, −2 − 2i).
# X[0] = 10 is the sum (the DC component); the magnitudes |X[k]| are the
# strengths of the frequencies k·fs/N. For real signals the second half
# mirrors the first, so only N/2 + 1 values are kept (rfft). The magnitude
# gives "how much", the phase "when in the cycle".
#
# WHERE YOU USE IT
# Always know the frequency of each bin: bin k of an N-point FFT at rate fs is
# k·fs/N Hz.
#
# RUN IT:  python 01_freq-0.py
#

import numpy as np

x = np.array([1.0, 2.0, 3.0, 4.0])
X = np.fft.fft(x)
print(X.round(3).tolist())
print(np.abs(X).round(3).tolist(), np.fft.rfftfreq(4, 1 / 8000).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [(10+0j), (-2+2j), (-2+0j), (-2-2j)]
# [10.0, 2.828, 2.0, 2.828] [0.0, 2000.0, 4000.0]
