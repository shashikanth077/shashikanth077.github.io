# -*- coding: utf-8 -*-
# ==========================================================================
# Aliasing: when sampling is too slow [speech-processing / Sound, sampling and
# speech data]
# ==========================================================================
# WHAT IT IS
# A frequency above fs/2 does not vanish — it folds back and masquerades as a
# lower one: an input of f appears at |f − k·fs| for the integer k that brings
# it into 0…fs/2. A 5 kHz tone sampled at 8 kHz appears at |5000 − 8000| =
# 3,000 Hz, exactly the same samples as a genuine 3 kHz tone, and nothing in
# the data reveals the difference. Hence every ADC places an analogue
# anti-aliasing low-pass filter before sampling, and every downsampler filters
# first. Aliasing cannot be repaired afterwards.
#
# WHERE YOU USE IT
# If a spectrogram shows odd mirrored lines near the top, suspect aliasing
# from careless resampling.
#
# RUN IT:  python 03_sig-2.py
#

import numpy as np

fs = 8000
t = np.arange(64) / fs
x5 = np.cos(2 * np.pi * 5000 * t)
x3 = np.cos(2 * np.pi * 3000 * t)
print(bool(np.allclose(x5, x3)), abs(5000 - fs))
freqs = np.fft.rfftfreq(64, 1 / fs)
print(float(freqs[np.abs(np.fft.rfft(x5)).argmax()]))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# True 3000
# 3000.0
