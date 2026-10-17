# -*- coding: utf-8 -*-
# ==========================================================================
# Log-mel spectrograms [speech-processing / Speech features]
# ==========================================================================
# WHAT IT IS
# The standard front end of modern speech models: frame the signal, window,
# FFT, power spectrum |X|², mel filterbank, then take the logarithm: log-mel =
# log(mel energy + ε). The logarithm matches loudness perception, compresses
# the huge dynamic range (energies vary by a factor of a million) and turns
# multiplicative effects such as the microphone's gain into simple additions.
# Result: a matrix of shape (frames × mel bands), e.g. 98 × 80 for one second.
# Per-utterance or global mean–variance normalisation then removes level and
# channel differences.
#
# WHERE YOU USE IT
# Add a small floor (10⁻¹⁰) before the log to avoid −∞ in silence.
#
# RUN IT:  python 05_feat-4.py
#

import numpy as np

energy = np.array([1e-6, 1e-3, 1.0, 1e3])
print(np.log(energy + 1e-10).round(2).tolist())
gain = 10.0
print(bool(np.allclose(np.log(gain * energy), np.log(energy) + np.log(gain))))
frames, bands = 98, 80
print((frames, bands), frames * bands)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [-13.82, -6.91, 0.0, 6.91]
# True
# (98, 80) 7840
