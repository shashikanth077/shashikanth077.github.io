# -*- coding: utf-8 -*-
# ==========================================================================
# Pitch from autocorrelation [speech-processing / Frequency analysis and
# spectrograms]
# ==========================================================================
# WHAT IT IS
# Voiced speech repeats every pitch period, so a frame correlates strongly
# with a copy of itself shifted by exactly that period. The autocorrelation
# r[τ] = Σₙ x[n]x[n+τ] therefore peaks at τ = T₀. A 100 Hz tone at fs = 8 kHz
# repeats every 80 samples: r peaks at lag 80, giving f₀ = fs/τ = 8000/80 =
# 100 Hz. Search only the plausible lags (50–400 Hz → fs/400 … fs/50) and
# apply a voiced/unvoiced decision — unvoiced sounds have no clear peak.
# Modern trackers (YIN, pYIN, CREPE) refine this to avoid octave errors, where
# the detector reports half or double the true pitch.
#
# WHERE YOU USE IT
# Pitch carries intonation, emotion and tone in tonal languages; many TTS
# systems and speech tools need a good F₀ track.
#
# RUN IT:  python 07_freq-6.py
#

import numpy as np

fs, f0 = 8000, 100
t = np.arange(800) / fs
x = np.sin(2 * np.pi * f0 * t)
ac = np.correlate(x, x, "full")[len(x) - 1:]
lo, hi = fs // 400, fs // 50
lag = int(np.argmax(ac[lo:hi])) + lo
print(lag, fs / lag)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 80 100.0
