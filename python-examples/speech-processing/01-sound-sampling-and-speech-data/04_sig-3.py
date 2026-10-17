# -*- coding: utf-8 -*-
# ==========================================================================
# Amplitude, decibels and loudness [speech-processing / Sound, sampling and
# speech data]
# ==========================================================================
# WHAT IT IS
# Hearing is logarithmic, so level is given in decibels: dB = 20
# log₁₀(A/A_ref) for amplitudes (10 log₁₀ for power). Doubling the amplitude
# adds 6.02 dB; a factor of 10 adds 20 dB; 0.1 subtracts 20. A signal of
# amplitude 1,000 over noise of amplitude 10 has an SNR of 20 log₁₀(100) = 40
# dB. Digital audio is limited at ±1 (full scale, 0 dBFS); quieter levels are
# negative dBFS. Normalising loudness before training or recognition removes a
# nuisance factor — recordings of the same speech at different volumes should
# give the same transcript.
#
# WHERE YOU USE IT
# Clipping (values forced to ±1) destroys information and cannot be undone:
# leave headroom when recording.
#
# RUN IT:  python 04_sig-3.py
#

import numpy as np

print(round(20 * np.log10(2), 2), round(20 * np.log10(10), 1), round(20 * np.log10(0.5), 2))
print(round(20 * np.log10(1000 / 10), 1))
x = np.array([0.5, -0.25, 0.1])
print(round(float(20 * np.log10(np.sqrt(np.mean(x ** 2)))), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 6.02 20.0 -6.02
# 40.0
# -9.7
