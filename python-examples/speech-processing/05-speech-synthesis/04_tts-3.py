# -*- coding: utf-8 -*-
# ==========================================================================
# Vocoders: from spectrogram to waveform [speech-processing / Speech
# synthesis]
# ==========================================================================
# WHAT IT IS
# A mel spectrogram has magnitudes but no phase, and has only 80 numbers per
# 10 ms while the waveform needs 160 samples at 16 kHz. A vocoder fills in the
# missing detail. Griffin–Lim estimates phase iteratively — fast but buzzy.
# WaveNet generates one sample at a time conditioned on the spectrogram —
# superb quality, painfully slow (16,000 steps per second of audio). GAN
# vocoders (HiFi-GAN) generate the whole waveform in parallel with a generator
# trained against discriminators — near-WaveNet quality at hundreds of times
# real time. Rate check: 1 s of 22.05 kHz audio is 22,050 samples from only 86
# mel frames, so the vocoder upsamples about 256× in time.
#
# WHERE YOU USE IT
# A mismatch between the acoustic model's spectrograms and the vocoder's
# training data causes artefacts: train or fine-tune them together.
#
# RUN IT:  python 04_tts-3.py
#

fs, hop = 22050, 256
frames = fs // hop
print(frames, frames * hop, hop)
for name, steps in {"WaveNet (autoregressive)": fs, "HiFi-GAN (parallel)": 1}.items():
    print(f"{name:26s} sequential steps per second: {steps}")

# --------------------------------------------------------------------------
# EXPECTED OUTPUT
# 86 22016 256
# WaveNet (autoregressive)   sequential steps per second: 22050
# HiFi-GAN (parallel)        sequential steps per second: 1
