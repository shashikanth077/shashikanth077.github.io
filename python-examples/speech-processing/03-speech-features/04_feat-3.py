# -*- coding: utf-8 -*-
# ==========================================================================
# Mel filterbank [speech-processing / Speech features]
# ==========================================================================
# WHAT IT IS
# Group the FFT bins into a few bands with overlapping triangular filters
# spaced evenly on the mel scale. To build a bank of M filters between 0 and 8
# kHz: convert the range to mel, take M + 2 equally spaced points, convert
# back to Hz — these are the filter edges and centres. For M = 4 the edges are
# 0, 459, 1,218, 2,475, 4,556 and 8,000 Hz: narrow filters at low frequency,
# one 3.5 kHz wide at the top. Each filter outputs the weighted sum of the
# power spectrum under its triangle. Typical systems use 40–80 filters: a
# 257-bin spectrum becomes a compact 40-number description.
#
# WHERE YOU USE IT
# Number of mel bands is a hyper-parameter: 80 is common for neural ASR and
# TTS, 23–40 for classic MFCC systems.
#
# RUN IT:  python 04_feat-3.py
#

import numpy as np

mel = lambda f: 2595 * np.log10(1 + f / 700)
inv = lambda m: 700 * (10 ** (m / 2595) - 1)
edges = inv(np.linspace(mel(0), mel(8000), 6))
print(edges.round(0).tolist())
print(np.diff(edges).round(0).tolist())

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [0.0, 459.0, 1218.0, 2475.0, 4556.0, 8000.0]
# [459.0, 759.0, 1257.0, 2081.0, 3444.0]
