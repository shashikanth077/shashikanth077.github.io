# -*- coding: utf-8 -*-
# ==========================================================================
# Beamforming with a microphone array [speech-processing / Enhancement and
# microphone arrays]
# ==========================================================================
# WHAT IT IS
# Two or more microphones give spatial information. A wave from direction θ
# reaches microphones d apart with a delay τ = d sin θ / c (c = 343 m/s). With
# d = 5 cm and θ = 30°: τ = 0.05 × 0.5 / 343 = 72.9 µs, 1.17 samples at 16
# kHz. Delay-and-sum beamforming delays each channel to line up sound from the
# wanted direction and adds them: the target adds coherently (amplitude × M
# for M microphones) while noise from other directions adds incoherently (×
# √M), improving SNR by 10 log₁₀ M dB — about 6 dB for four microphones. Smart
# speakers use 4–8 microphones plus neural post-filters.
#
# WHERE YOU USE IT
# Spatial aliasing limits the microphone spacing: keep d below half the
# shortest wavelength of interest.
#
# RUN IT:  python 03_enh-2.py
#

import numpy as np

d, theta, c, fs = 0.05, np.radians(30), 343.0, 16000
tau = d * np.sin(theta) / c
print(round(tau * 1e6, 1), round(tau * fs, 2))
print(round(10 * np.log10(4), 2), round(10 * np.log10(8), 2))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 72.9 1.17
# 6.02 9.03
