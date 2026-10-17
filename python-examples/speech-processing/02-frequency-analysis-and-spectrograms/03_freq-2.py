# -*- coding: utf-8 -*-
# ==========================================================================
# Windowing and spectral leakage [speech-processing / Frequency analysis and
# spectrograms]
# ==========================================================================
# WHAT IT IS
# The FFT assumes the block repeats forever. If a tone does not complete a
# whole number of cycles in the block, the repetition has a jump at the edge
# and the energy leaks into neighbouring bins. A 64-sample block containing
# exactly 8 cycles gives a single clean peak of magnitude 32; at 8.5 cycles
# the peak falls to 20.8 and leakage spreads out, with far bins at about 3.4%
# of the peak. Multiplying the block by a smooth window (Hann: 0.5 − 0.5
# cos(2πn/(N−1)), Hamming: 0.54 − 0.46 cos…) tapers the edges to zero and cuts
# the far leakage to about 0.02%, at the price of a slightly wider main peak.
#
# WHERE YOU USE IT
# Speech analysis nearly always applies a Hamming or Hann window to every
# frame.
#
# RUN IT:  python 03_freq-2.py
#

import numpy as np

n = 64
t = np.arange(n)
on = np.sin(2 * np.pi * 8 * t / n)
off = np.sin(2 * np.pi * 8.5 * t / n)
for name, s in (("on-bin", on), ("off-bin", off), ("off-bin + Hann", off * np.hanning(n))):
    m = np.abs(np.fft.rfft(s))
    print(name, int(m.argmax()), round(float(m.max()), 2), round(float(m[20:].max() / m.max()), 4))
print(np.hanning(5).round(3).tolist(), np.hamming(5).round(3).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# on-bin 8 32.0 0.0
# off-bin 8 20.84 0.0337
# off-bin + Hann 9 13.44 0.0002
# [0.0, 0.5, 1.0, 0.5, 0.0] [0.08, 0.54, 1.0, 0.54, 0.08]
