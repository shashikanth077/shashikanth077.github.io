# -*- coding: utf-8 -*-
# ==========================================================================
# The spectrogram [speech-processing / Frequency analysis and spectrograms]
# ==========================================================================
# WHAT IT IS
# Apply a window and an FFT to each frame and stack the magnitudes side by
# side: time runs along one axis, frequency along the other, brightness shows
# energy — a spectrogram (short-time Fourier transform, STFT). Vowels appear
# as horizontal bands, the formants (resonances of the vocal tract);
# fricatives like "s" as broadband noise at high frequencies; plosives as
# short vertical bursts; the pitch as evenly spaced harmonics. We usually plot
# 20 log₁₀|X| because energy spans many orders of magnitude. A 16 kHz,
# 512-point FFT gives 257 frequency bins 31.25 Hz apart.
#
# WHERE YOU USE IT
# Spectrograms turn audio into an image: CNNs and vision transformers can then
# be used, which is how many audio classifiers work.
#
# RUN IT:  python 05_freq-4.py
#

import numpy as np

fs = 16000
t = np.arange(fs) / fs
x = np.sin(2 * np.pi * (200 + 600 * t) * t)
frame, hop, nfft = 400, 160, 512
n = 1 + (len(x) - frame) // hop
win = np.hanning(frame)
S = np.abs(np.stack([np.fft.rfft(x[i * hop:i * hop + frame] * win, nfft) for i in range(n)]))
print(S.shape, fs / nfft)
print(int(S[0].argmax()) * fs / nfft, int(S[-1].argmax()) * fs / nfft)

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# (98, 257) 31.25
# 218.75 1375.0
