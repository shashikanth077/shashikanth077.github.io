# -*- coding: utf-8 -*-
# ==========================================================================
# Noise and speech enhancement [speech-processing / Enhancement and microphone
# arrays]
# ==========================================================================
# WHAT IT IS
# Real speech arrives with noise (traffic, fans, other talkers) and
# reverberation (echoes from the room). Speech enhancement improves quality
# and intelligibility, for calls, hearing aids and as a front end for ASR.
# Quality is measured by SNR improvement and perceptual scores (PESQ, STOI).
# The classical approach works in the spectrogram: estimate the noise from
# non-speech frames and subtract it (spectral subtraction): with a noise
# estimate of 2, magnitudes (5, 3, 1) become (3, 1, max(1 − 2, 0) = 0).
# Negative values are floored at zero; the remaining random "musical noise" is
# its main artefact.
#
# WHERE YOU USE IT
# Enhancement for ASR can help or hurt: neural recognisers trained on noisy
# data sometimes do better without enhancement.
#
# RUN IT:  python 01_enh-0.py
#

import numpy as np

mag = np.array([5.0, 3.0, 1.0])
noise = 2.0
print(np.maximum(mag - noise, 0).tolist())
rng = np.random.default_rng(0)
clean = np.sin(2 * np.pi * 200 * np.arange(800) / 8000)
noisy = clean + 0.3 * rng.standard_normal(800)
snr = 10 * np.log10(np.sum(clean ** 2) / np.sum((noisy - clean) ** 2))
print(round(float(snr), 1))

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# [3.0, 1.0, 0.0]
# 7.4
