# -*- coding: utf-8 -*-
# ==========================================================================
# Frames: short pieces of nearly stationary sound [speech-processing /
# Frequency analysis and spectrograms]
# ==========================================================================
# WHAT IT IS
# A whole sentence is not stationary — the mouth keeps moving — but over 20–30
# ms the sound is almost constant. So cut the signal into overlapping frames:
# typically 25 ms long (400 samples at 16 kHz) shifted by a hop of 10 ms (160
# samples). One second of audio gives 1 + (16000 − 400) // 160 = 98 frames.
# Each frame is windowed and transformed separately. The overlap makes sure
# nothing falls on a frame boundary; the hop sets the time resolution of
# everything that follows (about 100 feature vectors per second).
#
# WHERE YOU USE IT
# A 10 ms hop is a de-facto standard: fast enough for phonemes (50–200 ms),
# slow enough to be cheap.
#
# RUN IT:  python 04_freq-3.py
#

import numpy as np

fs, frame, hop = 16000, 400, 160
x = np.zeros(fs)
n = 1 + (len(x) - frame) // hop
frames = np.stack([x[i * hop:i * hop + frame] for i in range(n)])
print(n, frames.shape, frame / fs * 1000, hop / fs * 1000)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 98 (98, 400) 25.0 10.0
