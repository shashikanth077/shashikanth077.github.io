# -*- coding: utf-8 -*-
# ==========================================================================
# Time–frequency trade-off [speech-processing / Frequency analysis and
# spectrograms]
# ==========================================================================
# WHAT IT IS
# A longer window resolves frequencies more finely but blurs timing, and vice
# versa — an uncertainty principle: frequency resolution Δf = fs/N = 1/(window
# duration). A 25 ms window has Δf = 40 Hz (enough to separate pitch harmonics
# of a 100 Hz voice only barely) and 25 ms of time blur; a 5 ms window gives
# Δf = 200 Hz but sharper timing; a 100 ms window gives 10 Hz. Wide-band
# spectrograms (short windows, ≈ 5 ms) show vertical glottal pulses and smooth
# formants; narrow-band ones (long windows, ≈ 40 ms) show individual
# harmonics. Pick the window to match what you need to see.
#
# WHERE YOU USE IT
# Wavelets and constant-Q transforms trade resolution differently across
# frequency; speech mostly uses the plain STFT.
#
# RUN IT:  python 06_freq-5.py
#

for ms in (5, 25, 100):
    print(ms, "ms window ->", 1000 / ms, "Hz resolution")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 5 ms window -> 200.0 Hz resolution
# 25 ms window -> 40.0 Hz resolution
# 100 ms window -> 10.0 Hz resolution
